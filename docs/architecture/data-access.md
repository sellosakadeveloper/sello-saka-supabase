# Data Access

## Overview

The frontend is in a staged migration from Supabase to Convex. Public reads, form submissions, admin CRUD, payment workflows, file uploads, and the live admin auth gate now use Convex.

## Frontend Integration Boundaries

- `src/integrations/convex/client.ts` exposes the shared Convex browser client.
- `src/integrations/supabase/client.ts` remains as a legacy integration artifact while the broader migration cleanup phase is still in progress.
- `src/integrations/supabase/types.ts` remains for legacy compatibility until Supabase decommissioning is complete.

Pages and admin components import the shared client rather than recreating connection logic locally.

## Current Usage Patterns

- `src/pages/ResourceHub.tsx` queries Convex for public-facing resource content.
- `src/components/ActiveImpactStories.tsx` and `src/components/ActiveTeams.tsx` query Convex for public content blocks.
- `src/pages/Apply.tsx` and `src/pages/Contact.tsx` submit forms through Convex mutations.
- `src/pages/Donate.tsx`, `src/components/ActiveCompetition.tsx`, and `src/pages/PayFastReturn.tsx` use Convex payment mutations, actions, and status queries.
- `src/pages/Auth.tsx` and `src/pages/Admin.tsx` use Convex Auth and Convex-backed authorization queries and actions.
- `src/components/admin/*.tsx` read and mutate admin domains through Convex, including managed-user invites.

The current pattern is pragmatic and direct: data access often sits near the feature that uses it, rather than behind a separate repository layer. During migration, Convex is now the live runtime backend while Supabase remains in the repo as a legacy artifact until cleanup.

## Backend Project Artifacts

The root `convex/` directory owns the backend schema and functions for migrated data models, including auth, admin CRUD, payment workflows, and file uploads. The root `supabase/` directory still owns legacy project-side configuration, migrations, and scripts until the migration is fully decommissioned.

## Architectural Constraint

Any change that affects live backend behavior should be reflected in `convex/`. Supabase changes should be treated as migration-support or decommissioning work, not as additions to the active runtime path.

## Related Agent Docs

- `src/integrations/AGENTS.md`
- `src/integrations/convex/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
- `convex/AGENTS.md`
- `supabase/AGENTS.md`
