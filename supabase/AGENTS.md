# Supabase Project Guidance

## Scope

This file applies to the root `supabase/` directory.

## Ownership

This subtree owns Supabase project artifacts such as configuration, migrations, and edge functions.

## Boundaries

- Schema changes and backend-side behaviors belong here.
- Frontend client setup does not belong here; that lives in `src/integrations/supabase`.
- Keep migrations authoritative for database structure changes.

## Current Structure

- `config.toml` for project configuration
- `migrations/` for schema evolution
- `functions/` for Supabase edge functions

## References

- `docs/architecture/data-access.md`
- `docs/architecture/repo-layout.md`
