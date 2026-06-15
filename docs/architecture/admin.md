# Admin Architecture

## Overview

The admin area is split between a route-level gatekeeper and tab-level feature components.

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

Admin tabs typically interact with Supabase directly through the shared client. `ResourcesTab.tsx` is a representative example: it loads rows, opens form dialogs, uploads files to storage, and writes updates back to the database.

## Architectural Constraint

Admin-only behavior should stay isolated from the public site where possible. Generic UI primitives may be shared, but admin feature code should not bleed into public page components.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
