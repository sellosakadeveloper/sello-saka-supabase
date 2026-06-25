# Competition

## Purpose

The competition area covers the public competition experience and its supporting admin management surfaces.

## Relevant Source Areas

- `src/pages/Competition.tsx`
- `src/pages/TicketSuccess.tsx`
- `src/components/ActiveCompetition.tsx`
- `src/components/admin/CompetitionsTab.tsx`
- `src/components/admin/CompetitionEntriesTab.tsx`

## Architectural Notes

This feature crosses public user flow and admin operations. Public participation pages should stay route-focused, while management of competitions and entries should remain in the admin subtree. The public competition page is Convex-backed, and payment initialization, webhook verification, status tracking, reconciliation retries, and hero-image uploads now go through Convex as well. Keep ticket or proof-related supporting notes in `ticket_code/` as documentation, not as a replacement for source-owned behavior.
Competition admin edits and entry management are also Convex-backed. Any future proof upload flow should follow the same Convex storage pattern.

The competition success flow also depends on a Netlify function for PDF ticket rendering. Public ticket downloads are function-backed, while ticket confirmation and email orchestration remain Convex-backed.

The competition entry admin detail view now doubles as the operational payment support view for PayFast entries. It exposes payment metadata, the reconciliation timeline, and an admin retry action for stuck non-completed payments.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `ticket_code/AGENTS.md`
