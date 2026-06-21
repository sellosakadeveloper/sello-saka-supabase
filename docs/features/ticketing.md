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

Competition ticket emails are sent from the Convex backend. The sender address is configured through environment variables:

- `TICKETS_EMAIL_FROM` for ticket emails
- `AUTH_EMAIL_FROM` as the fallback sender for auth emails and the secondary fallback for ticket emails

For production delivery, these sender addresses should point at a verified Resend domain owned by the foundation.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `ticket_code/AGENTS.md`
