# Convex Auth Cutover Implementation Plan

## Objective

Implement the approved Convex Auth cutover for this repo using:

- Convex Auth
- email + password only
- no public sign-up
- one bootstrap admin
- admin-created users
- email-based password setup or reset flow

## Phase 1: Foundation

### Goal

Install and initialize the Convex Auth backend and frontend provider wiring without yet removing the old auth UI paths.

### Tasks

1. Install required auth packages.
   - `@convex-dev/auth`
   - `@auth/core`
2. Run the Convex Auth initializer.
3. Confirm generated auth files exist:
   - `convex/auth.config.ts`
   - `convex/auth.ts`
   - any `convex/http.ts` updates
4. Add `authTables` to `convex/schema.ts`.
5. Update `src/main.tsx` from `ConvexProvider` to the Convex Auth-compatible provider wiring.
6. Push the backend changes with `convex dev --once`.

### Exit Criteria

- Convex auth files are present
- schema compiles
- app still builds
- Convex deployment accepts the auth schema changes

## Phase 2: Authorization Model

### Goal

Move admin authorization into Convex and establish the bootstrap admin path.

### Tasks

1. Add an app-level `users` table in `convex/schema.ts`.
2. Decide the exact relationship between `users` and `user_roles` in code:
   - `users` stores managed account state
   - `user_roles` stores authorization role assignments
3. Add Convex auth helper functions to:
   - load the current authenticated identity
   - resolve the app user record
   - resolve current admin status
4. Add bootstrap admin logic keyed to `sellosakadeveloper@gmail.com`.
5. Ensure admin authorization can succeed on first login for the bootstrap admin without relying on Supabase ids.
6. Add explicit server-side authorization checks for admin-only flows.

### Exit Criteria

- backend can identify authenticated users
- backend can identify the bootstrap admin
- admin-only helper checks exist and reject unauthorized callers

## Phase 3: Auth Route Cutover

### Goal

Replace the current Supabase login page with Convex Auth sign-in only.

### Tasks

1. Refactor `src/pages/Auth.tsx` to remove public sign-up behavior.
2. Replace Supabase auth calls with Convex Auth sign-in.
3. Keep the route UX minimal:
   - email
   - password
   - sign-in button
4. Remove the sign-up toggle and sign-up copy.
5. Preserve success and error handling behavior that matches the existing app quality bar.

### Exit Criteria

- `/auth` allows sign-in only
- no public sign-up path remains in the UI
- successful login moves the user toward `/admin`

## Phase 4: Admin Gate Cutover

### Goal

Replace the Supabase-based `/admin` gate with Convex-authenticated authorization.

### Tasks

1. Refactor `src/pages/Admin.tsx` to:
   - wait for Convex auth readiness
   - redirect unauthenticated users to `/auth`
   - authorize via Convex data
   - sign out via Convex Auth
2. Remove remaining Supabase auth imports from `src/pages/Admin.tsx`.
3. Keep the existing tab registration and dashboard shell intact.
4. Preserve the current `reviewedByUserId` handoff into the applications tab, sourced from Convex-authenticated identity data instead of Supabase.

### Exit Criteria

- `/admin` is protected by Convex auth only
- admin shell behavior remains stable
- no Supabase auth logic remains in `src/pages/Admin.tsx`

## Phase 5: User Management

### Goal

Allow the bootstrap admin to create and manage users from the admin interface.

### Tasks

1. Add admin-only Convex mutations for:
   - create user
   - assign role
   - list users
   - update user status
2. Add a new admin UI surface for account management.
   - this can be a new tab such as `Users` or `Access`
3. Record:
   - email
   - role
   - status
   - created_by
   - timestamps
4. Default newly created users to a non-admin role unless explicitly assigned otherwise.
5. Ensure all user-management mutations perform server-side admin checks.

### Exit Criteria

- bootstrap admin can create a managed user record
- user-management actions are not exposed to non-admin users

## Phase 6: Invite And Password Setup Flow

### Goal

Complete production-ready onboarding for admin-created users without exposing public sign-up.

### Tasks

1. Configure the Convex Auth password flow for email-based setup or reset.
2. Configure the required email delivery provider and deployment settings.
3. Implement the user onboarding trigger from the admin-created user flow.
4. Verify invited users can set or reset their password through email.
5. Ensure invited users cannot self-assign elevated roles.

### Exit Criteria

- invited users receive the password setup or reset path
- invited users can complete onboarding without admin password handling
- production email flow works

## Phase 7: Cleanup

### Goal

Remove the old live Supabase auth dependency after validation passes.

### Tasks

1. Remove live Supabase auth usage from:
   - `src/pages/Auth.tsx`
   - `src/pages/Admin.tsx`
   - `src/integrations/supabase/client.ts` if no longer needed anywhere
2. Update docs that still describe Supabase as the active auth source.
3. Keep rollback notes until production validation is complete.
4. Remove dead auth-specific Supabase code only after the new flow is proven.

### Exit Criteria

- no live runtime auth path depends on Supabase
- docs reflect Convex Auth as the active auth source

## Verification Checklist

### Local

- bootstrap admin can sign in
- bootstrap admin can sign out
- bootstrap admin can sign back in
- unauthenticated access to `/admin` redirects to `/auth`
- non-admin authenticated users cannot access `/admin`

### Admin Management

- bootstrap admin can create a user
- created user record is stored in Convex
- created user cannot access admin unless granted admin role

### Onboarding

- created user receives setup or reset email
- created user completes password setup
- created user can sign in afterward

### Production

- production auth config matches dev auth config
- production email delivery works
- bootstrap admin can log in on production

## Rollout Order

Recommended execution order:

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Local validation of bootstrap admin
6. Phase 5
7. Phase 6
8. Production validation
9. Phase 7

## Risk Controls

### Access Lockout

- do not remove old Supabase auth code until Convex bootstrap admin login is validated

### Email Failure

- do not consider the migration complete until production email delivery is confirmed

### Authorization Drift

- enforce admin checks inside Convex mutations and queries, not just in the UI

### Scope Creep

- keep this cutover focused on admin auth
- do not add extra profile or consumer-auth features during this pass
