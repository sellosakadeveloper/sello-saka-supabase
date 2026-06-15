# Data Access

## Overview

The frontend uses Supabase for authentication, database access, and file storage. Client-side integration setup lives in `src/integrations/supabase/`.

## Frontend Supabase Boundary

- `src/integrations/supabase/client.ts` exposes the shared browser client.
- `src/integrations/supabase/types.ts` contains generated or schema-derived types used by the frontend.

Pages and admin components import the shared client rather than recreating connection logic locally.

## Current Usage Patterns

- `src/pages/ResourceHub.tsx` queries the `resources` table for public-facing resource content.
- `src/pages/Admin.tsx` checks authentication state and verifies admin role membership through Supabase.
- `src/components/admin/ResourcesTab.tsx` reads and mutates `resources` records and uploads files to Supabase storage.

The current pattern is pragmatic and direct: data access often sits near the feature that uses it, rather than behind a separate repository layer.

## Backend Project Artifacts

The root `supabase/` directory owns project-side configuration, migrations, and functions. This keeps frontend client setup separate from backend project evolution.

## Architectural Constraint

Any change that affects database shape or backend behavior should be reflected in the `supabase/` project artifacts, while frontend usage of that shape should continue to flow through `src/integrations/supabase/`.

## Related Agent Docs

- `src/integrations/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
- `supabase/AGENTS.md`
