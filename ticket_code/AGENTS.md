# Ticket Notes Guidance

## Scope

This file applies to `ticket_code/`.

## Ownership

This subtree owns local markdown notes and working documents related to the ticketing area.

## Expectations

- Treat this directory as supporting documentation, not application source.
- Keep implementation code in `src/` and only link or reference it from here.
- Prefer concise notes that point to canonical code or human-facing docs when relevant.
- Do not treat local ticket notes as the source of truth for Netlify packaging, preview validation, or production deployment behavior; that belongs under `docs/operations/` and the relevant source subtrees.

## References

- `docs/features/ticketing.md`
- `docs/architecture/repo-layout.md`
