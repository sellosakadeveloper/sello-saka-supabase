# Home

## Purpose

The home area acts as the main landing experience for the site and introduces the foundation, its programs, and key calls to action.

## Relevant Source Areas

- `src/pages/Home.tsx`
- shared site chrome in `src/components/Header.tsx` and `src/components/Footer.tsx`
- supporting shared content components under `src/components/`

## Architectural Notes

The home page fits the repo's standard public-page pattern: a route-level page component composes shared layout and reusable visual sections. Any shared sections extracted from this page should remain in `src/components/`, not duplicated across other pages.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/AGENTS.md`
