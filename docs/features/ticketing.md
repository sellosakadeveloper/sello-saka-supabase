# Ticketing

## Purpose

The ticketing area appears to be supported partly by application code and partly by local markdown notes in `ticket_code/`.

## Relevant Source Areas

- `src/pages/TicketSuccess.tsx`
- `netlify/functions/competition-ticket-pdf.ts`
- `src/integrations/tickets/template.ts`
- `convex/paymentsNode.ts`
- `ticket_code/README.md`
- `ticket_code/layout.md`
- `ticket_code/ticket_info.md`

## Architectural Notes

The code-facing part of ticketing should remain in `src/`, especially for user-visible route behavior. The `ticket_code/` directory is useful for local notes and supporting documentation, but it should not become the primary home for executable behavior or canonical architecture descriptions that belong under `docs/`.

Competition ticket emails are sent from the Convex backend. The sender address is configured through environment variables:

- `TICKETS_EMAIL_FROM` for ticket emails
- `AUTH_EMAIL_FROM` as the fallback sender for auth emails and the secondary fallback for ticket emails

For production delivery, these sender addresses should point at a verified Resend domain owned by the foundation.

Competition ticket PDFs now use a shared HTML ticket layout:

- the browser download route is rendered by the Netlify function at `/.netlify/functions/competition-ticket-pdf`
- the email body uses the same ticket template source, but email PDF attachments require a public render URL reachable by Convex cloud

In local development, browser PDF downloads work only when the site is served through Netlify dev. Running only raw Vite does not expose the PDF function route.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `ticket_code/AGENTS.md`
