# Frontend Architecture

## Overview

The frontend is a Vite + React + TypeScript application. Rendering starts in `src/main.tsx`, and route composition is centralized in `src/App.tsx`.

## Routing Model

`src/App.tsx` defines the browser routes and maps them to page components. Public pages such as `Home`, `About`, `Programs`, `Impact`, `Competition`, `Donate`, `Contact`, and `Apply` are registered alongside route-specific screens like `ResourceHub`, `Auth`, `Admin`, and `TicketSuccess`.

This makes `src/App.tsx` the first place to check when adding or moving a route.

## Page And Component Split

- `src/pages/` owns route-level composition and page-specific orchestration.
- `src/components/` owns reusable layout pieces, cards, helpers, and animations.
- `src/components/ui/` owns generic building blocks and wrappers.
- `src/components/admin/` owns admin dashboard tab content.

The codebase currently favors page-owned orchestration with component extraction where reuse is clear. For example, the resource listing flow is orchestrated in `src/pages/ResourceHub.tsx`, while the item presentation lives in `src/components/ResourceCard.tsx`.

## Shared Application Shell

Shared site chrome such as `Header`, `Footer`, and `ScrollToTop` lives in `src/components`. Cross-cutting providers such as React Query, tooltip support, and toast systems are wired in `src/App.tsx`.

## Styling Approach

The project uses utility-class styling with shared UI primitives. Components often combine Tailwind classes with the reusable wrappers in `src/components/ui/`.

## Related Agent Docs

- `src/AGENTS.md`
- `src/pages/AGENTS.md`
- `src/components/AGENTS.md`
- `src/components/ui/AGENTS.md`
