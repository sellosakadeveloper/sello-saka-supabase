# Admin Components Guidance

## Scope

This file applies to `src/components/admin`.

## Ownership

This subtree owns admin dashboard feature panels and supporting admin-only UI composition. `src/pages/Admin.tsx` controls access and tab routing, while these components implement the tab content.

## Expectations

- Keep admin feature behavior split by tab or domain when possible.
- Reuse generic primitives from `src/components/ui` instead of rebuilding controls here.
- Keep Supabase interactions close to the admin feature that uses them unless a shared admin abstraction clearly emerges.
- Avoid moving public-site display components into this subtree.

## Current Domains

- Applications
- Donors
- Competitions and entries
- Contact submissions
- Metrics
- Teams
- Impact stories
- Resources

## References

- `docs/architecture/admin.md`
- `docs/features/auth-and-admin.md`
- `docs/features/resource-hub.md`
