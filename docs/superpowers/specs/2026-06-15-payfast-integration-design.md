# Real PayFast Integration Design

## Objective

Replace the current partial PayFast flow with a production-safe payment lifecycle and add a proper shared payment record model that supports both donations and competition entries.

## Goals

- Add a shared `payment_records` table for payment lifecycle tracking and auditability.
- Use server-generated PayFast payloads with a signed request.
- Make the PayFast webhook the only source of truth for payment completion.
- Keep the frontend return page informational rather than authoritative.
- Preserve competition ticket generation and extend the same pattern to donations.
- Improve idempotency and traceability for both PayFast and existing payment flows.

## Non-Goals

- No redesign of the donation or competition UI.
- No subscriptions or recurring billing implementation in this change.
- No replacement of Paystack; Paystack should continue to work, but the new payment model should support it more cleanly.

## Current State

The current implementation has three structural problems:

1. Frontend flows create or depend on feature rows directly before payment is confirmed.
2. `netlify/functions/payfast-webhook.ts` does not yet perform full verification and is not safe as a production ITN handler.
3. Competition ticket generation treats `competition_entries` as both the business record and the payment record.

This makes reconciliation, idempotency, and cross-provider consistency harder than they need to be.

## Recommended Architecture

### Shared Payment Record Model

Add a new table named `payment_records` that tracks the lifecycle of a single checkout attempt.

Each payment record should contain:

- `id` UUID primary key
- `payment_reference` text unique, the app-owned checkout identifier
- `provider` text, initially `payfast` or `paystack`
- `status` text with values such as `pending`, `processing`, `completed`, `failed`, `cancelled`
- `purpose` text with values such as `donation` or `competition_entry`
- `amount` numeric
- `currency` text default `ZAR`
- `payer_name` text
- `payer_email` text
- `payer_phone` text nullable
- `donation_id` UUID nullable
- `competition_entry_id` UUID nullable
- `competition_id` UUID nullable for pre-ticket competition checkouts
- `provider_payment_id` text nullable, for values such as PayFast `pf_payment_id`
- `provider_status` text nullable
- `provider_payload` jsonb nullable for the latest verified callback payload
- `return_url` text nullable
- `cancel_url` text nullable
- `verified_at` timestamp nullable
- `completed_at` timestamp nullable
- `created_at` timestamp
- `updated_at` timestamp

Constraints:

- `payment_reference` must be unique.
- A row must represent exactly one business purpose.
- `donation_id` and `competition_entry_id` should not both be populated.

### Business Record Ownership

#### Donations

- Create the `donations` row first with `status='pending'`.
- Create a `payment_records` row linked to that donation.
- After verified payment, update both `payment_records.status='completed'` and `donations.status='completed'`.

#### Competition entries

Use a pending-first model instead of creating the final confirmed ticket only after payment.

- Create a `competition_entries` row before redirecting to the gateway.
- Keep it pending with no ticket number yet.
- Create a `payment_records` row linked to that competition entry.
- After verified payment, generate the ticket number, mark the entry confirmed, and mark the payment completed.

This keeps the business record stable across the full checkout lifecycle and avoids creating entries only inside a webhook.

## PayFast Flow

### Checkout initialization

Create a new server function responsible for initializing a PayFast checkout using an existing `payment_records` row.

Inputs:

- `payment_reference`

Server responsibilities:

- Load the payment record and related business context from Supabase using the service role.
- Build the PayFast payload using authoritative server-side amounts and payer values.
- Populate `m_payment_id` with the app-owned `payment_reference`.
- Use `custom_str1..custom_str4` only for compact contextual values that help with tracing, not as the primary identifier.
- Generate the PayFast signature using merchant credentials and passphrase.
- Return the signed payload and correct process URL for sandbox or production.

### Webhook / ITN

Harden `netlify/functions/payfast-webhook.ts` so it:

- Accepts only POST.
- Parses the form-encoded ITN payload.
- Reconstructs and verifies the PayFast signature.
- Verifies merchant identity and amount against the stored payment record.
- Uses `m_payment_id` to look up the internal payment record.
- Stores the verified payload in `payment_records.provider_payload`.
- Updates `provider_payment_id`, `provider_status`, and lifecycle timestamps.
- Applies idempotent business updates only once.

Business updates:

- Donation payment: mark donation completed.
- Competition payment: generate ticket number, confirm the entry, send email, and mark `ticket_emailed` when successful.

### Return page

The return page should:

- Read a `payment_reference` query param.
- Poll or fetch by that internal reference only for UX feedback.
- Show `verifying`, `success`, or `pending/manual review` style states.
- Never independently mark payment success.

## Paystack Alignment

This change should not remove Paystack, but it should align Paystack with the new payment model where feasible.

Recommended adjustment:

- Create a `payment_records` row before opening Paystack.
- Reuse the same lifecycle statuses.
- Allow `verify-payment.ts` to update the payment record first, then the feature row.

Paystack can remain a lighter verification flow than PayFast, but the app should still converge on one internal model.

## Schema Changes

### New table

Add a migration to create `payment_records` plus indexes on:

- `payment_reference`
- `provider`
- `status`
- `purpose`
- `provider_payment_id`

### Existing table updates

`donations`

- Keep the existing business fields.
- Standardize statuses to include `pending`, `completed`, `failed`, `cancelled`.

`competition_entries`

- Ensure pending rows are supported.
- Ensure `ticket_number` remains nullable until confirmed.
- Keep `payment_reference` for compatibility during rollout if needed, but treat `payment_records` as canonical.
- Preserve `ticket_emailed`.

## Netlify Function Changes

### Replace or rename `payfast-signature.ts`

The current function is too generic and accepts arbitrary amount data from the client. The new function should instead initialize checkout from the stored payment record.

Recommended behavior:

- request body contains only app identifiers needed to locate the pending payment
- amount and payer values come from the database
- return shape includes the final PayFast form fields and the gateway URL

### Rewrite `payfast-webhook.ts`

This function becomes the core of the PayFast integration and must be safe to run repeatedly.

### Update `verify-payment.ts`

Bring Paystack verification into the same internal lifecycle:

- resolve the linked `payment_records` row
- verify externally
- update internal payment status
- finalize the linked business record

### Update `utils/ticket-generator.ts`

Change the utility so it can finalize an existing pending competition entry instead of always inserting a brand-new row.

## Frontend Changes

### Donations page

`src/pages/Donate.tsx` should:

- create a pending donation and payment record through a server endpoint
- receive a signed PayFast payload from the server
- submit the returned form to PayFast

### Competition entry flow

`src/components/ActiveCompetition.tsx` should:

- create a pending competition entry and payment record through a server endpoint
- initialize PayFast from that payment record
- keep Paystack aligned with the same internal reference

### Return page

`src/pages/PayFastReturn.tsx` should pivot from competition-email polling to generic payment status feedback keyed by `payment_reference`.

## Environment Variables

Require the server-side functions to use:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE`
- `SITE_URL`
- `PAYFAST_SANDBOX`
- `RESEND_API_KEY` where ticket email is needed

Do not rely on `VITE_*` values inside server-side mutation flows except as a temporary fallback where absolutely necessary during migration.

## Validation

The implementation is complete when:

- A pending donation can be created, redirected to PayFast, verified via webhook, and marked completed.
- A pending competition entry can be created, redirected to PayFast, verified via webhook, confirmed with a ticket number, and emailed once.
- Duplicate ITNs do not create duplicate side effects.
- Frontend success UX is driven by the stored internal payment state.
- Paystack still works and updates the new payment model.

## Risks

- Existing competition payment logic assumes ticket creation can happen at verification time without a pre-created pending entry.
- Existing admin views may rely on current status strings.
- Payment migration work can break return-page UX if the frontend still expects legacy query parameters.

These are manageable as long as the migration, functions, and frontend updates are done together.
