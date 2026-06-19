# Admin Architecture

## Overview

The admin area is split between a route-level gatekeeper and tab-level feature components. The route is still Supabase-authenticated for now while the backend migration to Convex continues, but the tab data layer and file uploads have moved to Convex for the migrated domains.

## Entry And Access Control

`src/pages/Admin.tsx` is the admin entrypoint. It checks for an authenticated user, verifies the user has the `admin` role in `user_roles`, and then renders the dashboard tabs.

This page owns:

- access gating
- logout flow
- top-level tab registration

## Tab Composition

Each admin tab renders a dedicated component from `src/components/admin/`. Current domains include applications, donors, competitions, entries, contact submissions, metrics, teams, stories, and resources.

This separation keeps the admin page focused on composition while feature-specific CRUD flows live closer to the tab that owns them.

## Data Access Pattern

Admin tabs now interact with Convex for business data and file uploads. The remaining Supabase calls in the admin subtree are limited to the auth gate in `src/pages/Admin.tsx`.

## Architectural Constraint

Admin-only behavior should stay isolated from the public site where possible. Generic UI primitives may be shared, but admin feature code should not bleed into public page components.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
