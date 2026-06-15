# Supabase Client Guidance

## Scope

This file applies to `src/integrations/supabase`.

## Ownership

This subtree owns the frontend Supabase client and generated Supabase types used by the browser app.

## Expectations

- Keep client initialization centralized in `client.ts`.
- Treat `types.ts` as generated or schema-derived integration output; do not hand-edit it casually.
- Import the shared client from here instead of recreating Supabase clients elsewhere in the frontend.
- Keep UI concerns out of this subtree.

## Boundaries

- Frontend consumers may query auth, database, and storage through the shared client.
- Backend-side project configuration, migrations, and functions belong in the root `supabase/` directory, not here.

## References

- `docs/architecture/data-access.md`
- `docs/architecture/admin.md`
