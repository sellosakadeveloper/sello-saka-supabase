# Donations

## Purpose

The donations area supports donation-related user journeys and return handling after payment flows.

## Relevant Source Areas

- `src/pages/Donate.tsx`
- `src/pages/PayFastReturn.tsx`
- any shared form or feedback components used by those pages

## Architectural Notes

Donation-related flows are route-led and should stay anchored in `src/pages` unless reusable payment-supporting UI emerges. Return or callback handling belongs close to the route that receives it so that integration flow remains easy to trace.

The current implementation uses Convex for payment creation, verification, payment-status lookup, and PayFast retry/reconciliation handling. Keep provider-specific callback handling close to the payment route or Convex action that owns it.

`src/pages/PayFastReturn.tsx` is now a generic payment-return observer rather than a sandbox-only helper. For PayFast returns it:

- reads the canonical `payment_records` state
- redirects immediately when a completed payment is already finalized
- records browser-observed pending or completed states through the backend retry surface
- attempts a safe internal retry only when a PayFast payment is still pending

This keeps the browser return route as a support path, not the primary source of payment truth.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/integrations/AGENTS.md`
