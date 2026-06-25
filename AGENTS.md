# Repository Guidance

## Scope

This file applies to the entire repository unless a deeper `AGENTS.md` overrides it for a subtree.

## Purpose

This repo contains a Vite + React + TypeScript frontend backed by Convex. The main frontend entrypoints are `src/main.tsx` and `src/App.tsx`. Route registration is centralized in `src/App.tsx`.

The live product currently includes:

- a public foundation website
- competition entry and donation flows
- PayFast payment handling with reconciliation support
- Convex Auth-backed admin access
- admin CRUD for competitions, entries, users, resources, teams, metrics, stories, applications, and contact submissions
- Netlify-backed ticket PDF downloads

## Directory Boundaries

- Put route-level screens in `src/pages`.
- Put shared layout, UI, and reusable behavior in `src/components`.
- Put admin-specific feature components in `src/components/admin`.
- Put third-party or backend integration code in `src/integrations`.
- Put active Convex backend code in `convex`.
- Do not add new Supabase artifacts back into the repository.
- Put static public files in `public`.
- Put local markdown notes or ticket-specific working docs in `ticket_code`.

## Placement Rules

- Prefer extending an existing subtree with local instructions before creating new top-level directories.
- Keep feature logic near the subtree that owns it.
- Do not place backend access code directly into unrelated shared UI primitives.
- Prefer Convex for all live read and write paths. Do not add new Supabase runtime dependencies.
- When a new subtree gains its own responsibility, add a local `AGENTS.md` or extend the nearest existing one.

## Documentation Rules

- Human-facing architecture and feature docs live under `docs/`.
- Agent-facing guidance should stay concise and operational.
- Human-facing docs should explain structure and current behavior, not aspirational redesigns.
- When repo structure, runtime boundaries, or active backend ownership changes, update both the relevant `docs/` pages and the local `AGENTS.md` files that describe those boundaries.

## Key References

- Human docs index: `docs/README.md`
- Repo layout overview: `docs/architecture/repo-layout.md`
- Frontend architecture: `docs/architecture/frontend.md`
- Data access architecture: `docs/architecture/data-access.md`
- Admin architecture: `docs/architecture/admin.md`
- Feature docs: `docs/features/competition.md`, `docs/features/donations.md`, `docs/features/auth-and-admin.md`, `docs/features/ticketing.md`
- Local development operations: `docs/operations/local-development.md`

## AGENTS Tree

Update these when their owned subtree responsibilities change:

- `AGENTS.md`
- `src/AGENTS.md`
- `src/pages/AGENTS.md`
- `src/components/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `src/components/ui/AGENTS.md`
- `src/integrations/AGENTS.md`
- `src/integrations/convex/AGENTS.md`
- `convex/AGENTS.md`
- `public/AGENTS.md`
- `ticket_code/AGENTS.md`

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
