# Ticketing

## Purpose

The ticketing area appears to be supported partly by application code and partly by local markdown notes in `ticket_code/`.

## Relevant Source Areas

- `src/pages/TicketSuccess.tsx`
- `ticket_code/README.md`
- `ticket_code/layout.md`
- `ticket_code/ticket_info.md`

## Architectural Notes

The code-facing part of ticketing should remain in `src/`, especially for user-visible route behavior. The `ticket_code/` directory is useful for local notes and supporting documentation, but it should not become the primary home for executable behavior or canonical architecture descriptions that belong under `docs/`.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `ticket_code/AGENTS.md`
