# Resource Hub

## Purpose

The resource hub provides searchable, filterable awareness and prevention resources for site visitors.

## Relevant Source Areas

- `src/pages/ResourceHub.tsx`
- `src/components/ResourceCard.tsx`
- `src/components/admin/ResourcesTab.tsx`

## Current Flow

The public resource page loads resources from Convex, filters them by search query and category, and renders them as cards. The admin resources tab also uses Convex for creation, editing, deletion, and file upload.

## Architectural Notes

This area is a good example of the repo's current pattern:

- public route orchestration in a page
- reusable item rendering in a shared component
- content management in the admin subtree
- direct feature-owned integration access through the shared client, now handled by Convex for reads, CRUD, and uploads

If this feature grows significantly, it would be a candidate for extracting a more explicit shared domain layer. The current structure is still coherent for the existing code size.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
