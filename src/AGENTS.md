# Frontend Source Guidance

## Scope

This file applies to `src/` except where a deeper `AGENTS.md` overrides it.

## Ownership

`src/` owns the browser application code: routing, pages, shared components, hooks, assets imported by code, and client-side integrations.

## Structure

- `App.tsx` owns route registration.
- `pages/` owns route-level screens.
- `components/` owns shared and feature-supporting components.
- `hooks/` owns reusable client hooks.
- `integrations/` owns external service clients and generated integration types.
- `assets/` owns source-imported images and brand assets.

## Placement Rules

- Put page-specific orchestration in pages unless a reusable component boundary is clear.
- Shared presentation belongs in `components`, not `pages`.
- Integration setup belongs in `integrations`, not scattered across unrelated files.
- Keep source-imported assets under `src/assets`; use `public/` only when a stable public URL is needed.

## References

- `docs/architecture/frontend.md`
- `docs/architecture/repo-layout.md`
