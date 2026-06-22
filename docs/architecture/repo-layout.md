# Repo Layout

## Overview

The repository is organized around the current project structure rather than a separate domain-driven taxonomy. The main code lives in `src/`, Convex backend code lives in `convex/`, static public assets live in `public/`, and local ticket-related notes live in `ticket_code/`.

## Main Directories

- `src/`: frontend application code
- `convex/`: Convex schema and server functions
- `public/`: stable public-path assets
- `ticket_code/`: local markdown notes for the ticketing area
- `docs/`: human-facing architecture and feature documentation

## Frontend Subtrees

- `src/App.tsx` registers routes and ties pages into the browser application.
- `src/pages/` contains route-level screens such as `Home`, `About`, `Competition`, `ResourceHub`, and `Admin`.
- `src/components/` contains shared presentation and feature-supporting components.
- `src/components/admin/` contains admin dashboard tab content and admin-only feature logic.
- `src/components/ui/` contains shared UI primitives and wrappers.
- `src/integrations/convex/` contains the browser Convex client setup.
- `src/assets/` contains images and brand assets imported by code.

## Why The Layout Matters

The repo is already structured in a way that signals ownership:

- Routes and orchestration stay near `src/pages`.
- Shared UI stays in `src/components`.
- Admin-specific behavior stays grouped in `src/components/admin`.
- External system coupling stays in `src/integrations`.
- Backend product logic stays in `convex/`.

The `AGENTS.md` tree follows these same boundaries so instructions stay close to the code they govern.

## Related Agent Docs

- `AGENTS.md`
- `src/AGENTS.md`
- `src/pages/AGENTS.md`
- `src/components/AGENTS.md`
- `src/integrations/AGENTS.md`
