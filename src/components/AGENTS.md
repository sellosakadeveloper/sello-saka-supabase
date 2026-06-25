# Shared Components Guidance

## Scope

This file applies to `src/components` except where a deeper `AGENTS.md` overrides it.

## Ownership

This subtree owns reusable presentation, layout helpers, animation wrappers, and feature-supporting components that are shared by pages.

## Boundaries

- Generic primitives belong in `ui/`.
- Admin-only feature components belong in `admin/`.
- Shared site chrome such as headers, footers, and navigation helpers belong directly in this subtree.
- Avoid placing page-owned orchestration here unless the logic is actually reused.
- Keep backend-specific data fetching out of generic primitives. If a reusable component needs data, wrap it at the feature boundary and prefer Convex for migrated reads and writes.

## Placement Rules

- Prefer small, composable components over page-sized component files.
- Keep props explicit and reusable.
- Do not couple shared components directly to admin-only assumptions unless they live in `admin/`.
- Do not hardwire Supabase into new shared components. Shared components should remain backend-agnostic or Convex-consumable at the feature boundary.

## References

- `docs/architecture/frontend.md`
- `docs/architecture/admin.md`
