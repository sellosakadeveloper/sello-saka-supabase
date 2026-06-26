# Ticketing

## Purpose

The ticketing area appears to be supported partly by application code and partly by local markdown notes in `ticket_code/`.

## Relevant Source Areas

- `src/pages/TicketSuccess.tsx`
- `netlify/functions/competition-ticket-pdf.js`
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
- the browser PDF function is a CommonJS Netlify function that launches `playwright-core` against `@sparticuz/chromium`
- deployed Netlify environments must package the Chromium `bin` assets with the function
- the email body and browser PDF use the same ticket information model, but email PDF attachments require a public render URL reachable by Convex cloud

Ticket delivery is downstream from payment completion. PayFast confirmation now finalizes the payment first and then attempts ticket side effects. Failed email or PDF side effects should be treated as delivery issues, not as payment-state blockers.

In local development, browser PDF downloads work only when the site is served through Netlify dev. Running only raw Vite does not expose the PDF function route.

## Deployment Notes

The ticket PDF flow now depends on a specific Netlify packaging shape:

- the deployed function should use the `esbuild` Netlify bundler
- `playwright-core` stays externalized for the function package
- `@sparticuz/chromium` must be bundled into the function artifact
- `node_modules/@sparticuz/chromium/bin/**` must be included so the brotli assets are available at runtime
- the function should treat only `NETLIFY_LOCAL=true` as the local Playwright path; all deployed environments should use the serverless Chromium path

Deploy Previews are the correct place to validate this route before production because they exercise the same Netlify packaging behavior as the live site.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `ticket_code/AGENTS.md`
