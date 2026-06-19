# Donations

## Purpose

The donations area supports donation-related user journeys and return handling after payment flows.

## Relevant Source Areas

- `src/pages/Donate.tsx`
- `src/pages/PayFastReturn.tsx`
- any shared form or feedback components used by those pages

## Architectural Notes

Donation-related flows are route-led and should stay anchored in `src/pages` unless reusable payment-supporting UI emerges. Return or callback handling belongs close to the route that receives it so that integration flow remains easy to trace.

The current implementation uses Convex for payment creation, verification, and payment-status lookup. Keep provider-specific callback handling close to the payment route or Convex action that owns it.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/integrations/AGENTS.md`
