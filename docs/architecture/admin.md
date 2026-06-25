# Admin Architecture

## Overview

The admin area is split between a route-level gatekeeper and tab-level feature components. Both the auth gate and the tab data layer now run through Convex.

## Entry And Access Control

`src/pages/Admin.tsx` is the admin entrypoint. It waits for Convex Auth readiness, verifies the caller has the `admin` role in Convex-backed records, and then renders the dashboard tabs.

This page owns:

- access gating
- logout flow
- top-level tab registration

## Tab Composition

Each admin tab renders a dedicated component from `src/components/admin/`. Current domains include applications, donors, competitions, entries, contact submissions, metrics, teams, stories, resources, and managed users.

This separation keeps the admin page focused on composition while feature-specific CRUD flows live closer to the tab that owns them.

## Data Access Pattern

Admin tabs and the admin auth gate now interact with Convex. Supabase is no longer part of the live admin runtime path.

The competition entries admin view also acts as the first support surface for PayFast troubleshooting. It now exposes:

- payment reference and provider status
- payment verification timestamp
- ticket email state
- a reconciliation timeline backed by `payment_reconciliation_events`
- an admin-triggered PayFast reconciliation retry for non-completed entries

## Architectural Constraint

Admin-only behavior should stay isolated from the public site where possible. Generic UI primitives may be shared, but admin feature code should not bleed into public page components.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/admin/AGENTS.md`
