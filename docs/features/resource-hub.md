# Resource Hub

## Purpose

The resource hub provides searchable, filterable awareness and prevention resources for site visitors.

## Relevant Source Areas

- `src/pages/ResourceHub.tsx`
- `src/components/ResourceCard.tsx`
- `src/components/admin/ResourcesTab.tsx`

## Current Flow

The public resource page loads resources from Supabase, filters them by search query and category, and renders them as cards. The admin resources tab manages creation, editing, deletion, and file upload for the same content set.

## Architectural Notes

This area is a good example of the repo's current pattern:

- public route orchestration in a page
- reusable item rendering in a shared component
- content management in the admin subtree
- direct feature-owned Supabase access through the shared client

If this feature grows significantly, it would be a candidate for extracting a more explicit shared domain layer. The current structure is still coherent for the existing code size.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
