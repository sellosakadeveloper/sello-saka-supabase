# Convex Auth Cutover Design

## Purpose

Replace the remaining Supabase authentication flow with Convex Auth while preserving the existing admin dashboard behavior and moving all live runtime auth checks into Convex.

## Scope

This design covers:

- frontend auth provider cutover
- admin route authentication and authorization
- bootstrap admin setup
- admin-managed user creation
- email-based password setup for created users
- production-ready email/password auth wiring
- rollback checkpoints for the cutover

This design does not cover:

- social login providers
- public self-service registration
- a full profile management system
- historical Supabase auth data migration beyond the initial bootstrap admin model

## Confirmed Decisions

- Auth provider: Convex Auth
- Environment scope: production-ready now
- Sign-in method: email + password only
- Public sign-up: disabled
- User onboarding: admin-only user creation
- Password handling: email invite / password setup, not admin-assigned passwords
- Initial admin count at cutover: exactly one
- Bootstrap admin email: `sellosakadeveloper@gmail.com`

## Current State

At the time of this design:

- business data reads and writes are already primarily Convex-backed
- file uploads are already Convex-backed for migrated admin flows
- payments are already Convex-backed
- the remaining live Supabase runtime surface is auth-centric:
  - `src/pages/Auth.tsx`
  - `src/pages/Admin.tsx`
  - `src/integrations/supabase/client.ts`

The admin tabs themselves are already using Convex for business data.

## Goals

1. Remove Supabase as the live authentication dependency.
2. Keep the `/auth` and `/admin` routes intact from the user's perspective.
3. Preserve a single controlled bootstrap admin path at cutover.
4. Prevent public self-service account creation.
5. Allow admins to create users without handling raw passwords.
6. Keep authorization checks server-side in Convex.
7. Keep rollback possible until production validation is complete.

## Non-Goals

1. Recreate Supabase auth semantics one-for-one.
2. Build a broad consumer-facing authentication system.
3. Add unnecessary identity or profile tables beyond what the admin management flow needs.
4. Remove Supabase project artifacts immediately on the same step as auth cutover.

## Architecture

### Provider Layer

- Add Convex Auth to the existing Convex backend.
- Use the Convex Auth `Password` provider.
- Replace `ConvexProvider` with `ConvexAuthProvider` in `src/main.tsx`.
- Keep the frontend bound to a single Convex deployment URL.

### Backend Authentication

- Add Convex Auth initialization output:
  - `convex/auth.config.ts`
  - `convex/auth.ts`
  - updated `convex/http.ts` if required by the initializer
- Add `authTables` to `convex/schema.ts`.
- Use `ctx.auth.getUserIdentity()` inside protected Convex functions.

### Backend Authorization

- Authorization will be implemented in Convex, not in the client.
- Admin access will be granted only when the authenticated Convex identity matches an admin record in Convex data.
- The bootstrap phase will recognize exactly one initial admin email:
  - `sellosakadeveloper@gmail.com`
- Admin-only backend functions must reject unauthenticated and unauthorized callers explicitly.

### App-Level User Model

This repo should add an app-level managed-user surface in Convex because admins need to create users and govern access.

Recommended responsibilities:

- track created users by email
- track role assignments
- track account status such as `invited` or `active`
- record which admin created the user

The app-level user model should be separate from Convex Auth's internal auth tables. Convex Auth handles sign-in state; the app model handles authorization and admin governance.

## Data Model

### Auth Tables

Add Convex Auth tables through `authTables` in `convex/schema.ts` as required by Convex Auth.

### Admin Authorization Records

Keep `user_roles` as the app authorization surface, but stop treating its current `user_id` shape as a Supabase-only concept.

Recommended direction:

- continue storing role assignments in Convex
- associate bootstrap and future accounts by auth-linked identity data
- for bootstrap, allow an email-based admin match
- after authenticated accounts exist, store enough stable identity linkage to make role checks deterministic

### Managed User Records

Add a dedicated app-level `users` table for clean admin operations. Expected fields:

- email
- role
- status
- created_by
- created_at
- auth linkage once the account is claimed

`users` should be the managed account record, while `user_roles` remains the authorization record. This keeps a clear boundary between "who can sign in" and "what role they have."

## Frontend Flow

### `/auth`

The auth route becomes sign-in only.

Required behavior:

- remove public sign-up toggle from the UI
- show email/password sign-in form only
- handle Convex Auth sign-in errors cleanly
- on successful login, navigate to `/admin`

The route must not expose self-service registration.

### `/admin`

The admin route remains the gatekeeper and tab-composition page.

Required behavior:

- wait for Convex Auth session readiness
- redirect unauthenticated users to `/auth`
- verify admin authorization through Convex-backed logic
- render the existing dashboard tabs only after authorization succeeds
- use Convex Auth sign-out instead of Supabase sign-out

The existing tab layout should remain unchanged unless auth-specific UI adjustments are needed.

## User Creation And Invite Flow

### Admin-Created Accounts

Only an authenticated admin may create user accounts.

Proposed flow:

1. Admin opens a new user-management screen in the admin dashboard.
2. Admin submits:
   - user email
   - role
3. Convex creates an app-level managed-user record with an `invited` state.
4. System initiates email-driven password setup or reset-capable onboarding.
5. User completes setup from the email flow and becomes active.

### Password Setup Model

Admins must never assign or transport raw passwords manually.

Implementation requirement:

- configure Convex Auth password flow together with email-based password setup or reset support

Reason:

- a production password system needs a password setup or reset path
- this avoids admins handling credentials directly
- this aligns with the Convex Auth password guidance

## Bootstrap Admin Model

At cutover there is exactly one initial admin account:

- `sellosakadeveloper@gmail.com`

The bootstrap admin is the only initial authority that can create additional users.

Bootstrap requirements:

- the account must be recognized as admin on first successful Convex-authenticated sign-in
- no second implicit bootstrap admin should exist
- the bootstrap rule should be narrow and deliberate

After the bootstrap admin is active, future administrators should be created through the managed admin flow instead of by expanding the bootstrap rule.

## Production Requirements

### Required Packages

Install the current Convex Auth package set required by the docs at implementation time.

As of the referenced docs:

- `@convex-dev/auth`
- `@auth/core`

The implementation must verify versions against the current setup docs rather than rely on memory.

### Required Configuration

Implementation is expected to include:

- Convex Auth initialization
- schema changes for `authTables`
- React provider swap
- password provider configuration
- email delivery configuration for password setup or reset
- production deployment setup for the same auth configuration

### Email Delivery

Production-ready auth is incomplete without working email delivery for setup or reset.

The final implementation must configure a production-capable email path for the onboarding flow and validate it in the deployed environment.

## Cutover Plan

1. Add Convex Auth packages.
2. Run Convex Auth initialization.
3. Add `authTables` to schema.
4. Add protected Convex auth and authorization helpers.
5. Add bootstrap admin rule for `sellosakadeveloper@gmail.com`.
6. Swap the frontend provider to `ConvexAuthProvider`.
7. Replace `/auth` with sign-in-only Convex Auth UI.
8. Replace `/admin` auth gate with Convex-authenticated authorization.
9. Add admin-only user creation flow.
10. Configure password setup or reset email flow.
11. Validate locally.
12. Push and validate against production-ready deployment settings.
13. Keep Supabase auth code only until production validation passes.
14. Remove remaining Supabase runtime auth usage.

## Rollback Plan

Rollback must remain possible until the following are confirmed:

- bootstrap admin sign-in works
- admin authorization works
- sign-out works
- admin can create a user
- created user can complete password setup
- created user can sign in
- unauthorized users cannot access `/admin`
- production email flow works

Rollback surface is intentionally narrow:

- `src/main.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Admin.tsx`
- Convex auth files and schema changes

Supabase auth code should not be fully deleted until that validation window is complete.

## Risks

### High Risk

- misconfigured email delivery breaks invited-user onboarding
- bootstrap admin rule fails and locks out admin access
- public sign-up is accidentally left reachable
- admin authorization is enforced only in the UI instead of in Convex

### Medium Risk

- role linkage model remains too tied to Supabase-era ids
- partial production config drift between dev and production deployments
- route-level loading state causes redirect loops

## Validation Plan

### Local Validation

- sign in as bootstrap admin
- sign out
- sign back in
- visit `/admin` while signed out and confirm redirect to `/auth`
- verify admin dashboard renders only after auth is ready

### Authorization Validation

- authenticated non-admin cannot access `/admin`
- admin-only mutations reject non-admin callers
- admin-only mutations succeed for bootstrap admin

### User Management Validation

- bootstrap admin creates a user
- created user receives password setup or reset flow email
- created user completes setup
- created user can sign in
- created user cannot access admin unless assigned admin role

### Production Validation

- production auth provider wiring works
- production password setup or reset email flow works
- production redirect behavior is correct
- bootstrap admin can sign in on production

## Implementation Constraints

- preserve the existing route structure
- keep admin tabs stable unless auth-specific adjustments are required
- do not reintroduce Supabase-backed runtime logic during the cutover
- keep authorization logic inside Convex functions
- do not expose public sign-up UI

## Source References

- Convex Auth setup: https://labs.convex.dev/auth/setup
- Convex Auth passwords: https://labs.convex.dev/auth/config/passwords
- Convex Auth overview: https://docs.convex.dev/auth/convex-auth
- Auth in Convex functions: https://docs.convex.dev/auth/functions-auth
