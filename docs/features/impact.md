# Impact

## Purpose

The impact area communicates outcomes, stories, and foundation impact-related content to site visitors.

## Relevant Source Areas

- `src/pages/Impact.tsx`
- `src/components/ActiveImpactStories.tsx`
- `src/components/admin/ImpactStoriesTab.tsx`

## Architectural Notes

This feature spans public presentation and admin maintenance. Public display stays in page and shared components, while content management belongs in the admin subtree. That split is useful to preserve because it keeps editorial administration separate from the public-facing page.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/AGENTS.md`
- `src/components/admin/AGENTS.md`
