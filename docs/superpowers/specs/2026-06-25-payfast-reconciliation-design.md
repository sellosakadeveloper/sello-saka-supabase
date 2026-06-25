# PayFast Reconciliation Design

## Objective

Add a production-grade internal reconciliation model for PayFast so the system durably captures every payment control event, preserves raw provider evidence, and can recover from missing or failed webhook processing without losing auditability.

## Current Findings

The current production behavior establishes three facts:

1. Payment initialization works in production.
   - `payment_records` rows are created correctly.
   - `return_url` and `cancel_url` are being stored with the production domain.
2. Recent production PayFast records remain `pending`.
   - `provider_payment_id`, `provider_status`, `verified_at`, and `completed_at` are absent on affected rows.
3. Production relies on webhook confirmation.
   - Browser-side fallback finalization exists only for sandbox mode.
   - In production, a payment remains pending unless the webhook path confirms it.

This means the immediate operational gap is not payment creation. The gap is that the live system does not yet preserve enough ingress and reconciliation evidence to reliably diagnose and recover failed or missing PayFast confirmation events.

## Goals

- Capture every inbound PayFast webhook request before any business processing occurs.
- Capture every provider validation request and provider validation response.
- Capture every internal payment control action, including duplicate classification and manual recovery attempts.
- Preserve both raw evidence and structured query fields.
- Keep `payment_records` as the canonical current-state table.
- Make payment confirmation recoverable through internal reconciliation actions.
- Separate payment confirmation from downstream ticket delivery side effects.

## Non-Goals

- No introduction of new infrastructure services such as RabbitMQ, OpenTelemetry, or external webhook inboxes.
- No replacement of Convex as the operational source of truth.
- No dependence on PayFast transaction-history APIs for core correctness.
- No redesign of the donation or competition UX.

## Recommended Architecture

### Model Split

Keep two layers:

1. `payment_records`
   - current operational state
   - one row per checkout attempt
2. `payment_reconciliation_events`
   - append-only event history
   - one row per payment control event
   - immutable audit log

`payment_records` answers:
- what is the current state of this payment?

`payment_reconciliation_events` answers:
- what happened, in what order, with what evidence, and what did the system do about it?

### Why Append-Only Reconciliation Events

The live problem is forensic, not just transactional. A mutable audit blob on `payment_records` would lose retry history, duplicate history, and before/after decision context. Append-only events preserve:

- original inbound webhook body
- duplicate webhook deliveries
- failed validation attempts
- manual recovery actions
- downstream side effect retries

This is the right shape for support, incident response, compliance, and manual reconciliation.

## Reconciliation Event Table

### Table Name

`payment_reconciliation_events`

### Required Fields

- `provider`
  - `payfast`
- `channel`
  - `webhook`
  - `browser_return`
  - `manual_recovery`
  - `internal_retry`
- `event_type`
  - discriminated string identifier for the step
- `payment_reference`
  - app-owned payment reference
- `provider_payment_id`
  - PayFast payment ID when available
- `payment_record_id`
  - Convex `payment_records` row ID when matched
- `status_before`
  - payment status before this event's business action
- `status_after`
  - payment status after this event's business action
- `raw_inbound_body`
  - exact inbound request body as received
- `raw_inbound_headers`
  - exact inbound request headers needed for diagnostics
- `raw_outbound_url`
  - provider URL called by the system
- `raw_outbound_method`
  - typically `POST`
- `raw_outbound_body`
  - exact outbound validation payload sent to the provider
- `raw_response_status`
  - provider response status code
- `raw_response_body`
  - provider response body
- `parsed_provider_status`
  - normalized provider status when extracted
- `signature_valid`
  - boolean or null if not applicable
- `merchant_match`
  - boolean or null if not applicable
- `amount_match`
  - boolean or null if not applicable
- `duplicate_detected`
  - boolean
- `processing_result`
  - compact internal outcome string
- `error_message`
  - normalized error text when a step fails
- `occurred_at`
  - server timestamp

### Suggested Indexes

- `by_payment_reference`
- `by_provider_and_occurred_at`
- `by_event_type_and_occurred_at`
- `by_processing_result_and_occurred_at`
- `by_payment_record_id_and_occurred_at`

## Event Types

The system should log at least the following event types:

- `webhook_received`
- `webhook_signature_verified`
- `webhook_signature_failed`
- `provider_validation_requested`
- `provider_validation_succeeded`
- `provider_validation_failed`
- `payment_matched`
- `payment_match_failed`
- `payment_finalized`
- `payment_finalize_skipped_duplicate`
- `payment_finalize_failed`
- `return_page_observed_pending`
- `return_page_observed_completed`
- `manual_reconciliation_requested`
- `manual_reconciliation_succeeded`
- `manual_reconciliation_failed`
- `ticket_email_requested`
- `ticket_email_succeeded`
- `ticket_email_failed`
- `ticket_pdf_requested`
- `ticket_pdf_succeeded`
- `ticket_pdf_failed`

These should be treated as operational facts, not user-facing states.

## Processing Model

### Rule

Write reconciliation first, then enqueue processing.

### Flow

1. A PayFast webhook reaches the HTTP endpoint.
2. The system writes a `webhook_received` event immediately using the exact raw inbound body and relevant headers.
3. The system schedules or dispatches an internal processing step rather than making the webhook request the only place where business completion can succeed.
4. Processing performs:
   - payment reference extraction
   - payment record lookup
   - signature verification
   - merchant verification
   - amount verification
   - PayFast validation request
   - internal finalization if valid
5. Every step writes its own reconciliation event.
6. Downstream side effects such as ticket email and PDF handling are executed after payment finalization and logged independently.

### Why Async After Evidence Write

This prevents the webhook request from being both:

- the only place evidence exists
- the only place business success can occur

The operational benefit is that:

- evidence exists even if processing crashes
- stuck payments can be retried internally
- support tools can inspect a timeline even when finalization failed

## Separation Of Concerns

### Payment Confirmation

Payment confirmation must be treated as complete when:

- PayFast evidence is sufficient
- the payment record is valid
- the payment finalization mutation succeeds

### Ticket Delivery

Ticket delivery must be downstream from payment confirmation.

If email or PDF generation fails:

- the payment should still be confirmed
- reconciliation events should record the side-effect failure
- internal retry tooling should recover the delivery path later

This prevents valid payments from being operationally blocked by non-payment side effects.

## Manual Recovery Model

Add an internal or admin-scoped reconciliation action for live pending payments.

### Inputs

- `payment_reference`

### Responsibilities

- write `manual_reconciliation_requested`
- reload the payment record
- inspect existing reconciliation timeline
- re-run provider validation logic where possible
- finalize the payment if the evidence supports it
- write `manual_reconciliation_succeeded` or `manual_reconciliation_failed`

### Constraints

- must be idempotent
- must not create a second competition entry
- must not resend side effects blindly without checking current state

## Browser Return Logging

Even though the browser return page is not authoritative in production, it is still a payment control path because it exposes user-observed stuck states.

When the return page observes:

- pending
- completed
- missing payment reference
- missing payment record

the system should write reconciliation events such as:

- `return_page_observed_pending`
- `return_page_observed_completed`

This helps correlate support complaints with actual operational timelines.

## Data Strategy

Use both raw and structured storage.

### Raw

Store exact request and response bodies for:

- forensic review
- provider disputes
- regression analysis

### Structured

Extract and persist normalized query fields for:

- dashboards
- admin support tooling
- stuck-payment queries
- duplicate-event detection

This dual approach is necessary because raw-only is hard to operate, and structured-only is weak for incident investigation.

## PayFast Transaction History API

The reconciliation design must not depend on PayFast transaction-history APIs for correctness.

Reason:

- The system must be able to preserve evidence and recover from webhook issues using its own operational model.
- Provider-side history lookup should be treated as an optional enhancement or backfill aid, not a primary confirmation path.

If a PayFast API lookup is later added, it should be modeled as:

- an additional manual recovery input
- a separate reconciliation event series
- not a replacement for inbound webhook evidence capture

## Query And Support Surfaces

The system will need query surfaces for:

- pending payments older than a threshold
- reconciliation timeline by `payment_reference`
- payments with failed provider validation
- payments with duplicate webhook deliveries
- confirmed payments with failed downstream delivery
- manual recovery attempts and outcomes

These should be added as Convex queries over both `payment_records` and `payment_reconciliation_events`.

## Production Findings Incorporated Into Design

The current production data indicates that the right model is evidence-first reconciliation, because:

- payment records are being created
- payment references are valid
- production URLs are registered correctly
- multiple recent live payments are stuck in `pending`
- provider completion and internal completion are not reliably connected today

This design directly addresses that operational gap.

## Implementation Phases

### Phase 1

- Add `payment_reconciliation_events` schema
- Add internal mutation for append-only reconciliation writes
- Instrument PayFast webhook ingress to write `webhook_received` immediately

### Phase 2

- Move validation and finalization into a processor path that logs every step
- Add duplicate classification and finalization result events

### Phase 3

- Add manual reconciliation action for pending live PayFast records
- Add admin/support query surfaces for timelines and stuck payments

### Phase 4

- Add side-effect reconciliation events for ticket email and PDF generation
- Add targeted retry support for non-payment side effects

## Validation Criteria

The design is successful when:

- every webhook request is durably stored before business processing
- every provider validation request and response is stored
- every internal payment decision is traceable as an event
- a pending payment can be manually reconciled without duplicate side effects
- payment confirmation is operationally independent from email/PDF success
- support can inspect a full timeline from one `payment_reference`

## Open Questions Resolved By Scope

The design intentionally does not require:

- RabbitMQ
- OpenTelemetry
- DuckDB
- external webhook capture tools
- PayFast history API integration

Those may be useful later for scaling, observability, or analytics, but they are not required for the first correct internal reconciliation model.
