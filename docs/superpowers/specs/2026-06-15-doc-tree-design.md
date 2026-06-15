# Doc Tree Design

## Objective

Add a deep documentation tree to the repository that serves two audiences:

- AI agents that need local, scoped instructions through `AGENTS.md` files.
- Humans that need architecture and feature-overview documentation under `docs/`.

The tree should follow the repository layout rather than introducing a separate feature taxonomy.

## Goals

- Add a root `AGENTS.md` with repo-wide guidance.
- Add child `AGENTS.md` files where ownership or behavior changes materially.
- Add a human-facing `docs/` tree focused on architecture and feature overviews.
- Align agent docs and human docs so each subtree points to the nearest relevant document.
- Keep the docs grounded in the current codebase structure and behavior.

## Non-Goals

- No runtime application behavior changes.
- No runbooks, deployment playbooks, or contribution-process guides.
- No speculative documentation for folders that do not yet exist.
- No forced one-file-per-folder documentation for static asset directories.

## Current Repo Context

The repo is a Vite + React + TypeScript application with Supabase integration. Routing is centralized in `src/App.tsx`. Page-level code lives in `src/pages`, reusable UI and layout code lives in `src/components`, and admin feature logic is split into `src/components/admin`. Supabase client and generated types live under `src/integrations/supabase`. There is also a `supabase/` directory for backend-side project artifacts and a `ticket_code/` directory containing local markdown documentation.

This repo does not currently contain an `AGENTS.md` hierarchy or a structured human-facing architecture doc tree.

## Recommended Approach

Use a mirror-with-selective-leaves structure:

- Mirror the existing repo layout at the top and mid levels.
- Add deeper `AGENTS.md` files only where the subtree has a distinct responsibility.
- Keep generic subtrees like `src/components/ui` lightweight.
- Keep human docs broader than the agent docs, but cross-link them.

This preserves locality without creating excessive documentation noise.

## Deliverables

### Agent-Facing Tree

Create these files:

- `AGENTS.md`
- `src/AGENTS.md`
- `src/pages/AGENTS.md`
- `src/components/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `src/components/ui/AGENTS.md`
- `src/integrations/AGENTS.md`
- `src/integrations/supabase/AGENTS.md`
- `supabase/AGENTS.md`
- `public/AGENTS.md`
- `ticket_code/AGENTS.md`

Each file should contain:

- Scope of the directory.
- What belongs in the directory and what does not.
- Important dependencies and boundaries.
- Rules for where future changes should be placed.
- Pointers to relevant human-facing docs.

### Human-Facing Tree

Create these files:

- `docs/README.md`
- `docs/architecture/repo-layout.md`
- `docs/architecture/frontend.md`
- `docs/architecture/data-access.md`
- `docs/architecture/admin.md`
- `docs/features/home.md`
- `docs/features/about-and-programs.md`
- `docs/features/impact.md`
- `docs/features/competition.md`
- `docs/features/resource-hub.md`
- `docs/features/donations.md`
- `docs/features/applications.md`
- `docs/features/auth-and-admin.md`
- `docs/features/ticketing.md`

Each human-facing doc should explain:

- What the area does.
- Which source folders and files are most relevant.
- Key architectural constraints or boundaries.
- How that area relates to adjacent parts of the repo.

## Information Architecture

### Root `AGENTS.md`

The root file should define repo-wide expectations:

- The app stack and main entrypoints.
- Routing ownership in `src/App.tsx`.
- The split between pages, shared components, admin components, and integrations.
- The rule that child `AGENTS.md` files override root guidance for their subtree.
- The rule that meaningful new subtrees should add local documentation.

### `src` subtree

- `src/AGENTS.md` documents top-level frontend composition.
- `src/pages/AGENTS.md` documents route-level responsibilities and page ownership.
- `src/components/AGENTS.md` documents shared UI versus feature-specific components.
- `src/components/admin/AGENTS.md` documents admin feature tabs and shared admin patterns.
- `src/components/ui/AGENTS.md` documents wrapper primitives and the expectation to keep them generic.
- `src/integrations/AGENTS.md` documents integration boundaries.
- `src/integrations/supabase/AGENTS.md` documents client access, generated types, and Supabase coupling.

### Non-`src` subtree

- `supabase/AGENTS.md` documents backend project artifacts and the boundary with frontend code.
- `public/AGENTS.md` documents static public assets and when they should be used instead of imported source assets.
- `ticket_code/AGENTS.md` documents the purpose of local ticket-related markdown files.

### Human docs

- `docs/README.md` is the top-level navigation page.
- `docs/architecture/` describes the system by repo boundaries.
- `docs/features/` describes important user-facing areas already represented in the code.

## Cross-Linking Rules

- Every `AGENTS.md` should link to the nearest relevant `docs/` page.
- Human docs should reference the governing source directories and, where useful, the nearest `AGENTS.md`.
- Cross-links should avoid duplication: agent docs stay instructional, human docs stay explanatory.

## Content Style

### Agent docs

- Concise and imperative.
- Optimized for local decision-making.
- Focused on boundaries, placement rules, and maintenance expectations.

### Human docs

- Descriptive and architectural.
- Focused on current implementation, not aspirational redesign.
- Written for quick orientation by a new contributor.

## Validation

Implementation is complete when:

- All planned documentation files exist.
- The tree follows the repo layout.
- Content reflects the current codebase accurately.
- Cross-links are coherent.
- No doc claims contradict the observed source structure.

## Risks

- Over-documenting generic folders could create stale noise.
- Repeating the same content across agent and human docs could increase maintenance cost.
- Describing behavior too abstractly could make the docs less useful than reading code directly.

These risks are mitigated by selective leaf docs, clear scope boundaries, and strict cross-linking discipline.

## Implementation Notes

- Reuse current repo terminology where possible.
- Keep file sizes moderate; prefer local, scoped docs over large central documents.
- Document current realities such as route registration in `src/App.tsx`, page-owned resource fetching in `src/pages/ResourceHub.tsx`, and admin tab composition in `src/pages/Admin.tsx` plus `src/components/admin`.
