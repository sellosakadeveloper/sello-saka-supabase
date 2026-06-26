# Production Release

## Purpose

This checklist covers the current live release path for the foundation site, with emphasis on Convex, Netlify, PayFast, Resend, and ticket PDF delivery.

## Branch And Preview Flow

Use this sequence before every production release:

1. work on a dedicated branch
2. open a PR into the live deployment branch
3. wait for the Netlify Deploy Preview to build
4. validate the preview end to end before merging

For the competition ticket flow, a raw local Vite run is not sufficient. The preview or `netlify dev` path is required because the browser PDF route is owned by a Netlify Function.

## Pre-Merge Checklist

- Convex functions deployed to the intended environment
- Netlify Deploy Preview green
- admin login works
- public content renders correctly
- competition checkout initializes correctly
- PayFast return page resolves correctly
- PayFast webhook path confirms payments
- reconciliation timeline is recorded
- ticket email renders with the correct sender
- PDF download succeeds from `/.netlify/functions/competition-ticket-pdf`
- mobile and desktop spot checks complete

## Netlify Production Variables

Set these in Netlify production:

- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `SITE_URL`
- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE` if used
- `PAYFAST_SANDBOX`
- `RESEND_API_KEY`
- `AUTH_EMAIL_FROM`
- `TICKETS_EMAIL_FROM`
- `TICKET_PDF_RENDER_URL` if you want to pin the public PDF render endpoint explicitly

Recommended values:

- `SITE_URL` should be the production site origin, for example `https://sellosakafoundation.org`
- `AUTH_EMAIL_FROM` should be a verified Resend sender such as `Sello Saka Foundation <noreply@mail.sellosakafoundation.org>`
- `TICKETS_EMAIL_FROM` should be a verified Resend sender such as `Sello Saka Foundation Tickets <tickets@mail.sellosakafoundation.org>`
- `PAYFAST_SANDBOX` must be `false` in production

For Deploy Previews, do not reuse the production `SITE_URL`. Let previews use `DEPLOY_PRIME_URL` fallback or set preview-specific values if you need explicit overrides.

## Convex Production Variables

Set these in the Convex production deployment:

- `SITE_URL`
- `CONVEX_SITE_URL`
- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE` if used
- `PAYFAST_SANDBOX`
- `RESEND_API_KEY`
- `AUTH_EMAIL_FROM`
- `TICKETS_EMAIL_FROM`
- `TICKET_PDF_RENDER_URL` if used
- `JWT_PRIVATE_KEY`
- `JWKS`

If production auth is enabled, confirm the bootstrap admin can sign in before calling the release complete.

## PayFast Production Checks

- merchant credentials are the live values
- `PAYFAST_SANDBOX=false`
- PayFast notify URL points to the production Convex HTTP action
- return and cancel URLs resolve to the production site
- one controlled live payment confirms:
  - payment record creation
  - webhook evidence capture
  - payment finalization
  - ticket success page
  - ticket PDF download
  - ticket email delivery

## Ticket PDF Notes

The production PDF route depends on Netlify packaging behavior:

- the Netlify function uses the `esbuild` bundler
- `playwright-core` is externalized for the function package
- `@sparticuz/chromium` is bundled with the function
- `node_modules/@sparticuz/chromium/bin/**` must be included in the artifact
- deployed runtimes should use the serverless Chromium path, while only `NETLIFY_LOCAL=true` uses local Playwright

If the PDF route fails in preview or production, classify the failure before changing code:

1. build failure
2. function bundling failure
3. runtime import failure
4. runtime browser launch failure
5. application logic failure

## Merge And Release Sequence

1. merge the validated PR into the live deployment branch
2. confirm Netlify production deploy starts from the merge
3. deploy Convex production functions if not already deployed for that commit set
4. run a production smoke test
5. confirm admin access, payment confirmation, PDF delivery, and email delivery
6. only then consider the release complete
