# PayFast Reconciliation Implementation Plan

## Objective

Implement the approved internal PayFast reconciliation model so the system:

- durably captures every payment control event
- preserves raw inbound and outbound provider evidence
- decouples payment confirmation from downstream ticket side effects
- supports manual recovery and replay for stuck live payments

## Phase 1: Schema Foundation

### Goal

Add the append-only reconciliation storage model without changing live payment behavior yet.

### Tasks

1. Add a new table to [`convex/schema.ts`](D:/Development/sello-saka-supabase/convex/schema.ts):
   - `payment_reconciliation_events`
2. Include fields for:
   - provider
   - channel
   - event_type
   - payment_reference
   - provider_payment_id
   - payment_record_id
   - status_before
   - status_after
   - raw_inbound_body
   - raw_inbound_headers
   - raw_outbound_url
   - raw_outbound_method
   - raw_outbound_body
   - raw_response_status
   - raw_response_body
   - parsed_provider_status
   - signature_valid
   - merchant_match
   - amount_match
   - duplicate_detected
   - processing_result
   - error_message
   - occurred_at
3. Add indexes for:
   - `by_payment_reference_and_occurred_at`
   - `by_event_type_and_occurred_at`
   - `by_processing_result_and_occurred_at`
   - `by_payment_record_id_and_occurred_at`
4. Run schema deployment locally with Convex.

### Exit Criteria

- reconciliation table exists
- schema typechecks
- indexes are accepted by Convex

## Phase 2: Reconciliation Write Surface

### Goal

Create the internal append-only write API used by all payment control paths.

### Tasks

1. Add internal mutations or helpers in [`convex/payments.ts`](D:/Development/sello-saka-supabase/convex/payments.ts) for:
   - append reconciliation event
   - normalize event shape
2. Ensure writes are append-only:
   - no event updates
   - no event replacement
3. Add helper typing for consistent event names and channels.
4. Keep `payment_records` as the current-state source; do not move state transitions into the event log.

### Exit Criteria

- internal code can append reconciliation events safely
- event writes are strongly shaped and reusable

## Phase 3: Webhook Ingress Capture

### Goal

Durably store the raw PayFast webhook before business processing.

### Tasks

1. Instrument [`convex/paymentsNode.ts`](D:/Development/sello-saka-supabase/convex/paymentsNode.ts) inside `payfastWebhook`.
2. On receipt of the POST body:
   - capture exact raw request body
   - capture relevant headers
   - extract `m_payment_id` if present
3. Write `webhook_received` before:
   - signature verification
   - merchant verification
   - amount verification
   - PayFast validation request
4. Keep the webhook path resilient when the payment reference is missing:
   - write a failed match event rather than dropping the evidence.

### Exit Criteria

- every inbound PayFast webhook attempt is durably recorded
- missing or malformed webhooks still leave evidence behind

## Phase 4: Validation And Finalization Eventing

### Goal

Log the full provider validation and internal decision chain.

### Tasks

1. In [`convex/paymentsNode.ts`](D:/Development/sello-saka-supabase/convex/paymentsNode.ts), instrument:
   - signature verification result
   - merchant comparison result
   - amount comparison result
   - outbound request to `eng/query/validate`
   - inbound validation response
2. Persist events for:
   - `webhook_signature_verified`
   - `webhook_signature_failed`
   - `provider_validation_requested`
   - `provider_validation_succeeded`
   - `provider_validation_failed`
   - `payment_matched`
   - `payment_match_failed`
3. In [`convex/payments.ts`](D:/Development/sello-saka-supabase/convex/payments.ts), instrument finalization outcomes for:
   - `payment_finalized`
   - `payment_finalize_skipped_duplicate`
   - `payment_finalize_failed`
4. Capture `status_before` and `status_after` on business state transitions.

### Exit Criteria

- provider validation is fully traceable
- internal payment-state decisions are traceable
- duplicate completions are explicitly classified

## Phase 5: Async Payment Control Pipeline

### Goal

Move from single-request webhook completion to evidence-first processing with internal dispatch.

### Tasks

1. Split the webhook handler responsibilities:
   - ingress evidence write
   - processing/finalization path
2. Ensure the processing path can be re-run safely from the same payment reference.
3. Prefer internal action or scheduled work where needed to avoid making the webhook request the only success path.
4. Preserve current payment completion semantics during the transition.

### Exit Criteria

- payment processing can be re-driven internally
- webhook success is not the only path to internal completion

## Phase 6: Browser Return Observability

### Goal

Capture user-observed stuck states from the browser return flow.

### Tasks

1. Instrument [`src/pages/PayFastReturn.tsx`](D:/Development/sello-saka-supabase/src/pages/PayFastReturn.tsx) through a backend write surface.
2. Write reconciliation events for:
   - `return_page_observed_pending`
   - `return_page_observed_completed`
   - `return_page_observed_missing_reference`
   - `return_page_observed_missing_payment_record`
3. Do not let browser return logging become authoritative for production payment completion.

### Exit Criteria

- support can correlate user-reported pending screens with backend evidence

## Phase 7: Manual Reconciliation Action

### Goal

Allow internal recovery of pending live payments using the recorded evidence model.

### Tasks

1. Add a manual reconciliation action in [`convex/paymentsNode.ts`](D:/Development/sello-saka-supabase/convex/paymentsNode.ts) or a dedicated module.
2. Input:
   - `payment_reference`
3. Steps:
   - write `manual_reconciliation_requested`
   - load the payment record
   - inspect reconciliation history
   - re-run provider validation where possible
   - finalize if evidence supports it
   - write success or failure event
4. Ensure idempotency:
   - no second competition entry
   - no second donation completion
   - no blind repeated side effects

### Exit Criteria

- pending production PayFast payments can be recovered manually
- recovery attempts are fully logged

## Phase 8: Side-Effect Reconciliation

### Goal

Separate payment confirmation from ticket delivery and log delivery outcomes independently.

### Tasks

1. Instrument ticket email flow in [`convex/paymentsNode.ts`](D:/Development/sello-saka-supabase/convex/paymentsNode.ts):
   - `ticket_email_requested`
   - `ticket_email_succeeded`
   - `ticket_email_failed`
2. Instrument ticket PDF generation path where evidence is available:
   - `ticket_pdf_requested`
   - `ticket_pdf_succeeded`
   - `ticket_pdf_failed`
3. Keep payment confirmation valid even when these side effects fail.
4. Leave side-effect retries as targeted recovery work, not payment-status blockers.

### Exit Criteria

- completed payments are not blocked by email/PDF failures
- downstream failures are queryable and recoverable

## Phase 9: Admin And Support Query Surfaces

### Goal

Expose the reconciliation timeline and stuck-payment operational views.

### Tasks

1. Add Convex queries for:
   - reconciliation timeline by `payment_reference`
   - pending payments older than a threshold
   - validation failures
   - duplicate webhook detections
   - completed payments with failed side effects
2. Add an admin-facing UI surface or support view for payment troubleshooting.
3. Keep the first UI pass narrow:
   - timeline
   - current status
   - manual reconciliation trigger

### Exit Criteria

- support can inspect and act on stuck payments without direct database access

## Verification Checklist

### Local Sandbox

- webhook request writes `webhook_received`
- raw inbound payload is preserved exactly
- validation request and response are logged
- payment finalization writes reconciliation events
- duplicate deliveries do not create duplicate business side effects

### Production-Like Flow

- live-mode pending records can be inspected through timeline queries
- manual reconciliation action can recover a pending record when evidence supports it
- payment confirmation remains independent from ticket email/PDF success

### Operational Observability

- a single `payment_reference` shows a full ordered timeline
- provider response bodies and statuses are visible
- support can distinguish:
  - missing webhook
  - invalid signature
  - amount mismatch
  - duplicate webhook
  - downstream ticket failure

## Rollout Order

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Local sandbox verification
6. Phase 5
7. Phase 6
8. Phase 7
9. Phase 8
10. Phase 9
11. Production validation

## Risk Controls

### Evidence Loss

- write reconciliation before all business processing

### Duplicate Completion

- preserve current idempotent completion guards on `payment_records`
- classify duplicates explicitly in reconciliation events

### Scope Creep

- do not add new infrastructure services in this implementation pass
- keep transaction-history API work out of the core reconciliation rollout

### Support Safety

- manual reconciliation actions must be explicit, logged, and idempotent
