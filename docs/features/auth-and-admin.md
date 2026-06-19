# Auth And Admin

## Purpose

The auth and admin areas control privileged access and content management for the site.

## Relevant Source Areas

- `src/pages/Auth.tsx`
- `src/pages/Admin.tsx`
- `src/components/admin/`
- `src/integrations/supabase/client.ts`
- `src/integrations/convex/client.ts`

## Current Flow

Authentication starts in the auth route and privileged access is enforced at the admin page. The admin route still checks the current user and confirms the `admin` role through Supabase before rendering the dashboard. Convex now carries the migrated admin business data, payments, and public/content flows, but it is not yet the auth source of truth.

The admin dashboard itself should now be treated as a Convex-backed data surface with a Supabase-authenticated gate.

## Architectural Notes

The most important boundary here is between:

- access control and admin shell composition in `src/pages/Admin.tsx`
- per-domain admin behavior in `src/components/admin/`

That split should be preserved because it keeps the route readable and limits the blast radius of changes to individual admin domains.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
