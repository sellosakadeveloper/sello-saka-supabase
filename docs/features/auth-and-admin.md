# Auth And Admin

## Purpose

The auth and admin areas control privileged access and content management for the site.

## Relevant Source Areas

- `src/pages/Auth.tsx`
- `src/pages/Admin.tsx`
- `src/components/admin/`
- `src/integrations/convex/client.ts`
- `convex/auth.ts`
- `convex/admin.ts`
- `convex/authHelpers.ts`

## Current Flow

Authentication now runs through Convex Auth with email and password only. The `/auth` route handles:

- standard admin sign-in
- one-time bootstrap admin initialization for the configured bootstrap email
- emailed password setup and reset completion through tokenized setup links

The `/admin` route waits for Convex Auth readiness, syncs the signed-in identity into Convex-managed admin records, and only renders the dashboard after Convex-side authorization confirms the caller is an admin.

The admin dashboard data and the admin authorization gate are both now Convex-backed.

## Authorization Model

- Convex Auth owns the authenticated session and internal auth tables.
- `managed_users` tracks app-level account state such as `invited`, `active`, and setup-link lifecycle.
- `user_roles` remains the authorization surface for roles such as `admin`.
- The configured bootstrap admin email is treated as a narrow first-account escape hatch and is then persisted into the same Convex-backed records as the rest of the admin system.

## Admin User Management

The dashboard now includes a `Users` tab for:

- listing managed accounts
- viewing role and activation state
- emailing invite/setup links

Admins do not assign raw passwords. Account activation and password reset both use emailed setup links handled by Convex actions.

Auth emails are sent through Resend from the configured `AUTH_EMAIL_FROM` address. Production setups should point this at a verified sender on the foundation's Resend-managed domain, for example `noreply@mail.sellosakafoundation.org`.

## Architectural Notes

The most important boundary here is between:

- access control and admin shell composition in `src/pages/Admin.tsx`
- per-domain admin behavior in `src/components/admin/`

That split should be preserved because it keeps the route readable and limits the blast radius of changes to individual admin domains.

## Related Agent Docs

- `src/pages/AGENTS.md`
- `src/components/admin/AGENTS.md`
- `convex/AGENTS.md`
