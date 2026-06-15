# Repository Guidance

## Scope

This file applies to the entire repository unless a deeper `AGENTS.md` overrides it for a subtree.

## Purpose

This repo contains a Vite + React + TypeScript frontend with Supabase integration. The main frontend entrypoints are `src/main.tsx` and `src/App.tsx`. Route registration is centralized in `src/App.tsx`.

## Directory Boundaries

- Put route-level screens in `src/pages`.
- Put shared layout, UI, and reusable behavior in `src/components`.
- Put admin-specific feature components in `src/components/admin`.
- Put third-party or backend integration code in `src/integrations`.
- Put Supabase project artifacts in `supabase`.
- Put static public files in `public`.
- Put local markdown notes or ticket-specific working docs in `ticket_code`.

## Placement Rules

- Prefer extending an existing subtree with local instructions before creating new top-level directories.
- Keep feature logic near the subtree that owns it.
- Do not place Supabase access code directly into unrelated shared UI primitives.
- When a new subtree gains its own responsibility, add a local `AGENTS.md` or extend the nearest existing one.

## Documentation Rules

- Human-facing architecture and feature docs live under `docs/`.
- Agent-facing guidance should stay concise and operational.
- Human-facing docs should explain structure and current behavior, not aspirational redesigns.

## Key References

- Human docs index: `docs/README.md`
- Repo layout overview: `docs/architecture/repo-layout.md`
- Frontend architecture: `docs/architecture/frontend.md`
- Data access architecture: `docs/architecture/data-access.md`
