# Data Access

## Overview

The live application runtime is now Convex-backed. Public reads, form submissions, admin CRUD, payment workflows, file uploads, and the admin auth gate all use Convex.

## Frontend Integration Boundaries

- `src/integrations/convex/client.ts` exposes the shared Convex browser client.

Pages and admin components import the shared client rather than recreating connection logic locally.

## Current Usage Patterns

- `src/pages/ResourceHub.tsx` queries Convex for public-facing resource content.
- `src/components/ActiveImpactStories.tsx` and `src/components/ActiveTeams.tsx` query Convex for public content blocks.
- `src/pages/Apply.tsx` and `src/pages/Contact.tsx` submit forms through Convex mutations.
- `src/pages/Donate.tsx`, `src/components/ActiveCompetition.tsx`, and `src/pages/PayFastReturn.tsx` use Convex payment mutations, actions, and status queries.
- `src/pages/Auth.tsx` and `src/pages/Admin.tsx` use Convex Auth and Convex-backed authorization queries and actions.
- `src/components/admin/*.tsx` read and mutate admin domains through Convex, including managed-user invites.

The current pattern is pragmatic and direct: data access often sits near the feature that uses it, rather than behind a separate repository layer. Convex is the live runtime backend.

## Backend Project Artifacts

The root `convex/` directory owns the backend schema and functions for the live data model, including auth, admin CRUD, payment workflows, and file uploads.

## Architectural Constraint

Any change that affects live backend behavior should be reflected in `convex/`.

## Related Agent Docs

- `src/integrations/AGENTS.md`
- `src/integrations/convex/AGENTS.md`
- `convex/AGENTS.md`
