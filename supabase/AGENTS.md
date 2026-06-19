# Supabase Project Guidance

## Scope

This file applies to the root `supabase/` directory.

## Ownership

This subtree owns legacy Supabase project artifacts such as configuration, migrations, and support scripts.

## Boundaries

- Schema changes and backend-side behaviors belong here.
- Frontend client setup has been removed from the live app. Keep this subtree focused on legacy project artifacts, migration support, and eventual teardown work.
- Keep migrations authoritative for database structure changes.
- Only add new work here if it is needed to support an unmigrated legacy flow, a rollback path, or the eventual teardown of Supabase.

## Current Structure

- `config.toml` for project configuration
- `migrations/` for schema evolution
- `scripts/` for migration support such as Convex backfills

## References

- `docs/architecture/data-access.md`
- `docs/architecture/repo-layout.md`
