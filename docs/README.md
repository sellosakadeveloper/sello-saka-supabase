# Documentation Index

This repository keeps two parallel documentation systems:

- `AGENTS.md` files for local, agent-facing implementation guidance.
- `docs/` pages for human-facing architecture and feature overviews.

## Architecture

- [Repo Layout](architecture/repo-layout.md)
- [Frontend Architecture](architecture/frontend.md)
- [Data Access](architecture/data-access.md)
- [Admin Architecture](architecture/admin.md)

## Features

- [Home](features/home.md)
- [About And Programs](features/about-and-programs.md)
- [Impact](features/impact.md)
- [Competition](features/competition.md)
- [Resource Hub](features/resource-hub.md)
- [Donations](features/donations.md)
- [Applications](features/applications.md)
- [Auth And Admin](features/auth-and-admin.md)
- [Ticketing](features/ticketing.md)

## Operations

- [Local Development](operations/local-development.md)

## Notes

These docs describe the current codebase layout and behavior. They are meant for orientation and maintenance, not as product requirements.

The live backend runtime is now Convex-driven: Convex handles public reads, form submissions, admin CRUD, payment workflows, PayFast reconciliation, file uploads, and the active admin auth gate. Supabase remains in the repository only for legacy project artifacts, backfill support, and eventual decommissioning.

Some local flows still rely on Netlify Functions, most notably competition ticket PDF generation. See the local development operations doc for the exact Windows startup commands.
