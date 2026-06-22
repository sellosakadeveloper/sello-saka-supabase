# Convex Project Guidance

## Scope

This file applies to the root `convex/` directory.

## Ownership

This subtree owns Convex schema, queries, mutations, actions, and other backend logic.

## Expectations

- Keep backend domain logic in Convex functions, not in the React app.
- Keep the schema authoritative for migrated data models.
- Prefer narrow query and mutation surfaces that match feature needs.

## Boundaries

- Backend project logic belongs here.
- Browser client initialization belongs in `src/integrations/convex`.
