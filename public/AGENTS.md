# Public Assets Guidance

## Scope

This file applies to `public/`.

## Ownership

This subtree owns static assets that should be served by stable public path rather than imported through the frontend bundler.

## Expectations

- Use `public/` for assets that need direct URL access.
- Use `src/assets/` for assets imported by code and bundled with the frontend.
- Keep filenames stable when pages or metadata reference them by path.

## References

- `docs/architecture/frontend.md`
- `docs/architecture/repo-layout.md`
