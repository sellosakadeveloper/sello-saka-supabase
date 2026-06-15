# Auth And Admin

## Purpose

The auth and admin areas control privileged access and content management for the site.

## Relevant Source Areas

- `src/pages/Auth.tsx`
- `src/pages/Admin.tsx`
- `src/components/admin/`
- `src/integrations/supabase/client.ts`

## Current Flow

Authentication starts in the auth route and privileged access is enforced at the admin page. The admin route checks the current user and confirms the `admin` role before rendering the dashboard.

## Architectural Notes

The most important boundary here is between:

- access control and admin shell composition in `src/pages/Admin.tsx`
- per-domain admin behavior in `src/components/admin/`

That split should be preserved because it keeps the route readable and limits the blast radius of changes to individual admin domains.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
