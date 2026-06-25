# Convex Project Guidance

## Scope

This file applies to the root `convex/` directory.

## Ownership

This subtree owns Convex schema, queries, mutations, actions, and other backend logic.

## Expectations

- Keep backend domain logic in Convex functions, not in the React app.
- Keep the schema authoritative for migrated data models.
- Prefer narrow query and mutation surfaces that match feature needs.
- Treat `payment_records` as canonical current payment state and `payment_reconciliation_events` as append-only operational evidence.
- Keep PayFast verification, retry, reconciliation, and admin recovery logic inside Convex rather than in browser-only fallback code.

## Boundaries

- Backend project logic belongs here.
- Browser client initialization belongs in `src/integrations/convex`.

## Current Domains

This subtree currently owns:

- auth and admin authorization
- applications, contact, donors, resources, teams, metrics, stories, competitions, and entries
- file upload/storage workflows tied to Convex
- PayFast and Paystack payment initialization
- PayFast webhook verification and reconciliation
- ticket email orchestration and related side-effect tracking
