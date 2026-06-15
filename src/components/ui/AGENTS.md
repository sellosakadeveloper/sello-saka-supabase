# UI Primitive Guidance

## Scope

This file applies to `src/components/ui`.

## Ownership

This subtree owns reusable UI primitives and wrappers around shared component patterns. Many files here follow the shadcn-style primitive model.

## Expectations

- Keep components generic and composable.
- Avoid embedding page-specific copy, admin-only rules, or Supabase calls here.
- Prefer extending primitives through props and composition rather than branching them for one page.
- Keep styling conventions aligned with the existing utility-class approach.

## When To Add Here

- Add a component here when it is broadly reusable across routes or features.
- Do not add a component here just because it uses basic HTML controls; feature-specific components should stay closer to their owning subtree.

## References

- `docs/architecture/frontend.md`
