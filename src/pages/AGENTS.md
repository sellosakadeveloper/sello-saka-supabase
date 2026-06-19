# Page Layer Guidance

## Scope

This file applies to `src/pages`.

## Ownership

Pages own route-level composition, page metadata such as document titles, and feature orchestration that is specific to a route.

## Expectations

- Keep route registration in `src/App.tsx`; add or change page exports to match router usage there.
- Pages may fetch data when the logic is route-specific and not yet shared across multiple screens.
- Pages should assemble shared components rather than duplicating shared layout fragments.
- Avoid moving reusable admin or UI logic into pages when a component boundary already exists.
- For migrated public and admin-content flows, pages should consume Convex-backed queries and mutations through local feature components or hooks.
- Keep Supabase usage in pages only where the route still depends on the legacy admin auth gate that has not been cut over yet.

## Current Patterns

- `ResourceHub.tsx` owns route-specific resource fetching and filtering.
- `Competition.tsx`, `Donate.tsx`, `PayFastReturn.tsx`, `Apply.tsx`, `Contact.tsx`, `ActiveImpactStories.tsx`, and `ActiveTeams.tsx` already use Convex-backed data paths.
- `Admin.tsx` owns admin authentication gating and tab-level composition, while the admin tabs themselves are now Convex-backed.
- Content-heavy public pages follow a route-per-page pattern.

## References

- `docs/architecture/frontend.md`
- `docs/features/resource-hub.md`
- `docs/features/auth-and-admin.md`
