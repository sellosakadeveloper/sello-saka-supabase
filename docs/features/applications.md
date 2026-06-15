# Applications

## Purpose

The applications area covers public application submission and admin-side review of submitted applications.

## Relevant Source Areas

- `src/pages/Apply.tsx`
- `src/components/admin/ApplicationsTab.tsx`

## Architectural Notes

This area follows the same public/admin split as other maintained content domains:

- public submission behavior stays route-owned
- admin review and management stay in `src/components/admin`

If applications begin sharing data models or validation logic with other features, that shared behavior should be extracted carefully rather than duplicated between the public page and admin tab.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/admin/AGENTS.md`
