# Supabase To Convex Backfill

## Purpose

This runbook covers the one-way backfill of legacy Supabase data into the Convex backend used by the app.

## Scope

The backfill imports these tables:

- `applications`
- `competitions`
- `competition_entries`
- `contact_messages`
- `contact_submissions`
- `donations`
- `impact_stories`
- `impact_metrics`
- `payment_records`
- `resources`
- `team_members`
- `teams`
- `user_roles`

It also records a per-row mapping in Convex through `legacy_import_mappings` so the import can be retried without duplicating previously imported rows.

## What It Does Not Do

The backfill preserves existing Supabase file and image URLs in Convex records.

It does not download historical files from Supabase Storage and re-upload them into Convex Storage. New uploads already use Convex. Historical asset mirroring is a separate operation.

## Prerequisites

- The local repo has the latest Convex migration code.
- Convex dev deployment is configured and reachable.
- Local environment has:
  - `SUPABASE_URL` or `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- `convex dev --once` has been run successfully after pulling the latest backend changes.

## Command

From the repo root:

```powershell
corepack pnpm migrate:supabase-to-convex
```

Optional:

```powershell
corepack pnpm migrate:supabase-to-convex -- --table competitions --table competition_entries
corepack pnpm migrate:supabase-to-convex -- --batch-size 50
```

## Verification

After the script completes:

- compare source row counts with the per-table output from the script
- review the Convex summary emitted at the end of the run
- spot-check critical relationships:
  - `competition_entries.competition_id`
  - `payment_records.donation_id`
  - `payment_records.competition_entry_id`
  - `payment_records.competition_id`
- verify the admin tabs render expected historical data
- verify public pages still resolve historical image and file URLs

## Remaining Supabase Runtime Surface

After this backfill, Supabase should still only be required for the legacy auth gate:

- `src/pages/Auth.tsx`
- `src/pages/Admin.tsx`

Admin business data, public reads, forms, payments, and new file uploads are already Convex-backed.
