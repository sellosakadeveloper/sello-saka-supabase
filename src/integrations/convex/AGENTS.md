# Convex Client Guidance

## Scope

This file applies to `src/integrations/convex`.

## Ownership

This subtree owns the browser-side Convex client setup used by the React app.

## Expectations

- Keep Convex client initialization centralized in `client.ts`.
- Expose the deployment URL through build-time env vars, not hardcoded constants.
- Keep feature logic and queries out of this subtree.

## Boundaries

- Browser integration setup belongs here.
- Convex schema and server functions belong in the root `convex/` directory.
