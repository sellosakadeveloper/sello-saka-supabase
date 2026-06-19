# Data Access

## Overview

The frontend is in a staged migration from Supabase to Convex. Public reads, form submissions, admin CRUD, payment workflows, and file uploads now use Convex. Supabase remains in place for the admin auth gate until its final cutover is completed.

## Frontend Integration Boundaries

- `src/integrations/convex/client.ts` exposes the shared Convex browser client.
- `src/integrations/supabase/client.ts` exposes the legacy Supabase browser client for paths not yet migrated.
- `src/integrations/supabase/types.ts` contains generated or schema-derived types used by the remaining Supabase-backed frontend code.

Pages and admin components import the shared client rather than recreating connection logic locally.

## Current Usage Patterns

- `src/pages/ResourceHub.tsx` queries Convex for public-facing resource content.
- `src/components/ActiveImpactStories.tsx` and `src/components/ActiveTeams.tsx` query Convex for public content blocks.
- `src/pages/Apply.tsx` and `src/pages/Contact.tsx` submit forms through Convex mutations.
- `src/pages/Donate.tsx`, `src/components/ActiveCompetition.tsx`, and `src/pages/PayFastReturn.tsx` use Convex payment mutations, actions, and status queries.
- `src/pages/Admin.tsx` still checks authentication state and verifies admin role membership through Supabase.
- `src/components/admin/*.tsx` now read and mutate the migrated admin domains through Convex. The remaining Supabase calls in the admin route are limited to the auth gate until that phase is migrated.

The current pattern is pragmatic and direct: data access often sits near the feature that uses it, rather than behind a separate repository layer. During migration, the integration boundary is split between Convex for newly migrated flows and Supabase for the remaining ones.

## Backend Project Artifacts

The root `convex/` directory owns the backend schema and functions for migrated data models, including admin CRUD, payment workflows, and file uploads. The root `supabase/` directory still owns legacy project-side configuration, migrations, and functions until the migration is finished.

## Architectural Constraint

Any change that affects migrated backend behavior should be reflected in `convex/`, while the remaining Supabase-backed behavior should continue to flow through `src/integrations/supabase/` until its cutover phase is complete.

## Related Agent Docs

- `src/integrations/AGENTS.md`
- `src/integrations/convex/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
- `convex/AGENTS.md`
- `supabase/AGENTS.md`
