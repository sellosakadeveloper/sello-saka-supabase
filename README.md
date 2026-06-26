# Sello Saka Foundation

Sello Saka Foundation is a Vite + React + TypeScript web application backed by Convex. It powers the public foundation site, competition entry flow, donation flow, admin dashboard, Convex Auth-based admin access, ticket delivery, and PayFast payment reconciliation.

## Current Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Convex
- Convex Auth
- Netlify Functions for competition ticket PDF rendering
- Resend for auth and ticket email delivery
- PayFast for competition and donation payments
- Paystack still present in the payment model, but PayFast is the primary live payment path

## Repository Layout

```text
.
|-- src/
|   |-- App.tsx
|   |-- main.tsx
|   |-- pages/                Route-level screens
|   |-- components/           Shared site and feature components
|   |   |-- admin/            Admin dashboard tabs
|   |   `-- ui/               Shared UI primitives
|   |-- integrations/         Browser-side external integrations
|   |   `-- convex/           Shared Convex client setup
|   |-- hooks/
|   `-- assets/
|-- convex/                   Convex schema, queries, mutations, actions, auth, admin, payments
|-- netlify/
|   `-- functions/            Ticket PDF rendering function
|-- public/                   Stable public assets
|-- docs/                     Human-facing architecture, feature, and operations docs
|-- ticket_code/              Ticket-specific working notes and reference material
|-- scripts/                  Local development helpers
`-- AGENTS.md                 Root agent guidance
```

## Backend Summary

The live backend runtime is Convex-driven.

Current backend responsibilities include:

- public content reads
- applications and contact submissions
- donation and competition payment initialization
- PayFast webhook verification
- payment record lifecycle tracking through `payment_records`
- append-only PayFast evidence and recovery history through `payment_reconciliation_events`
- admin CRUD
- admin user invites and setup flows
- file-backed data workflows

Netlify Functions remain in use for browser-accessible competition ticket PDF rendering. Convex handles ticket orchestration and email-side delivery logic.

## Documentation

Human-facing docs live under [`docs/`](D:/Development/sello-saka-supabase/docs).

Start here:

- [Documentation Index](docs/README.md)
- [Repo Layout](docs/architecture/repo-layout.md)
- [Frontend Architecture](docs/architecture/frontend.md)
- [Data Access](docs/architecture/data-access.md)
- [Admin Architecture](docs/architecture/admin.md)
- [Competition](docs/features/competition.md)
- [Donations](docs/features/donations.md)
- [Auth And Admin](docs/features/auth-and-admin.md)
- [Ticketing](docs/features/ticketing.md)
- [Local Development](docs/operations/local-development.md)
- [Production Release](docs/operations/production-release.md)

Agent-facing guidance lives in the `AGENTS.md` tree:

- `AGENTS.md`
- `src/AGENTS.md`
- `src/pages/AGENTS.md`
- `src/components/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `src/integrations/AGENTS.md`
- `src/integrations/convex/AGENTS.md`
- `convex/AGENTS.md`

## Local Development

Install dependencies:

```powershell
corepack pnpm install
```

### Standard App Loop

Use this for normal frontend, admin, auth, Convex, and payment work:

```powershell
# Terminal 1
.\node_modules\.bin\convex.cmd dev

# Terminal 2
corepack pnpm dev:vite
```

This serves the app on `http://localhost:8080`.

### Netlify Function Loop

Use this when testing browser ticket PDF downloads:

```powershell
# Terminal 1
.\node_modules\.bin\convex.cmd dev

# Terminal 2
$env:APPDATA="$PWD\.appdata"
.\node_modules\.bin\netlify.cmd dev --command ".\scripts\dev-vite.cmd"
```

This serves the site on `http://localhost:8888`.

## Environment Notes

Important runtime variables include:

- `CONVEX_DEPLOYMENT`
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `SITE_URL`
- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE`
- `PAYFAST_SANDBOX`
- `RESEND_API_KEY`
- `AUTH_EMAIL_FROM`
- `TICKETS_EMAIL_FROM`
- `TICKET_PDF_RENDER_URL`

Production Convex auth also requires:

- `JWT_PRIVATE_KEY`
- `JWKS`

## Deployment Summary

Production deployment is split across:

- Convex for backend functions, schema, auth, payments, and admin data
- Netlify for the frontend and Netlify function routes

Typical production flow:

1. set production env vars in Convex and Netlify
2. deploy Convex functions
3. deploy the frontend / Netlify site
4. confirm PayFast notify URL points to the production Convex HTTP action
5. run a live smoke test for payment, admin access, ticket email, and ticket PDF download

## Netlify Ticket PDF Notes

The competition ticket PDF route has a deployment-specific packaging requirement:

- local development uses `netlify dev`
- deployed Netlify environments use `playwright-core` plus `@sparticuz/chromium`
- Chromium `bin` assets must be shipped with the Netlify function artifact
- Deploy Preview should be treated as the mandatory validation step before production merge for this flow

## Notes

- Do not add new Supabase runtime dependencies back into the live app path.
- Supabase artifacts may still exist in the repository for migration history and decommission support, but Convex is the active system of record.
- The current PayFast flow includes webhook verification, retry handling, admin reconciliation support, and append-only reconciliation event capture.
