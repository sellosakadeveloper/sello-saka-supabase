# Local Development

## Overview

There are two practical local development modes in this repo:

- `pnpm dev` or `npm run dev` for the standard Vite + Convex app loop
- `netlify dev` for flows that require Netlify Functions, especially competition ticket PDF generation

## Standard App Loop

Use the standard app loop when working on normal frontend pages, Convex queries and mutations, admin screens, auth, and most payment/reconciliation logic:

```powershell
.\node_modules\.bin\convex.cmd dev
node "%USERPROFILE%\AppData\Local\node\corepack\v1\pnpm\10.11.1\bin\pnpm.cjs" dev:vite
```

This serves the frontend directly from Vite on `http://localhost:8080`.

## Netlify Function Loop

Use Netlify dev when testing the competition ticket PDF route because the browser download path is served through `/.netlify/functions/competition-ticket-pdf`.

Start Convex in one terminal:

```powershell
.\node_modules\.bin\convex.cmd dev
```

Start Netlify dev in a second terminal:

```powershell
$env:APPDATA="$PWD\.appdata"
.\node_modules\.bin\netlify.cmd dev --command ".\scripts\dev-vite.cmd"
```

This serves the site through Netlify on `http://localhost:8888`.

The helper script `scripts/dev-vite.cmd` exists because this repo currently needs a direct cached `pnpm` entrypoint during local Netlify development on Windows.

## Ticket PDF Behavior

Competition ticket rendering is split across two environments:

- Browser download uses the Netlify function route and can work locally through `netlify dev`
- Email attachment rendering is triggered from Convex server actions and requires a public HTTP endpoint that Convex cloud can reach

Because Convex runs remotely, it cannot fetch a local `localhost` Netlify function URL for email attachments.

## PayFast Reconciliation Testing

You do not need Netlify dev to test the hardened PayFast webhook and reconciliation flow itself. The core PayFast flow now lives in Convex:

- checkout initialization
- webhook capture
- signature verification
- provider validation
- payment finalization
- retry and manual reconciliation replay

Netlify dev is only needed when you also need to test browser ticket PDF downloads from the local site.

## Environment Notes

- `SITE_URL` should point to the public site URL in deployed environments
- `TICKET_PDF_RENDER_URL` can be set explicitly to a public Netlify function URL for ticket attachment rendering
- local `localhost` values are intentionally ignored for server-side ticket attachment generation
- `PAYFAST_SANDBOX` should be set explicitly for the environment you are testing so webhook validation and process URLs stay aligned

## Current Limitation

If the app is running only on raw Vite at `http://localhost:8080`, the PDF download route is not available because that route is owned by Netlify Functions rather than Vite.
