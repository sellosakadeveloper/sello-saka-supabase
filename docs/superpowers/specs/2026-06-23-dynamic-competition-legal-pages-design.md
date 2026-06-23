# Dynamic Competition Legal Pages Design

## Goal

Add dynamic competition-specific legal pages that stay aligned with the currently active competition in Convex instead of relying on static legal copy that can drift from the live campaign.

## Approved Direction

- Add two new public routes:
  - `/competition/terms`
  - `/competition/rules`
- Use a controlled legal structure with fixed wording sections.
- Inject live competition data from Convex into those sections so the pages reflect the currently active campaign.
- Keep the generic site-wide `/terms` page as the general website terms page.
- Link the competition-specific legal pages from the competition page itself, not by replacing the generic footer terms link.

## Why This Route

The current competition flow already uses live Convex-backed competition data for title, pricing, status, and ticket generation. Competition legal pages should follow that same source of truth so they do not become stale when the active campaign changes.

This approach avoids the risk of:

- static legal copy referencing outdated competition facts
- free-form admin-authored rules drifting from controlled compliance language
- ambiguity between general website terms and competition-specific terms

## Data Source

Both pages should use the same active competition query already used by the public competition route:

- `api.public.getActiveCompetition`

The pages should render the current active competition details where available.

## Route Design

Add two route pages under `src/pages`:

- `CompetitionTerms.tsx`
- `CompetitionRules.tsx`

Register them in `src/App.tsx` as:

- `/competition/terms`
- `/competition/rules`

Each page should follow the existing public page pattern:

- `Header`
- route-owned content
- shared `Footer`

## Dynamic Fields

The competition-specific pages should inject the following live values where available:

- competition title
- first prize
- second prize where present
- third prize where present
- entry fee
- competition end date
- draw date, using the same current business rule already used elsewhere in the codebase
- NLC scheme number `00539/01`

This keeps the live legal pages aligned with the actual campaign currently displayed on the public competition page.

## Page Responsibilities

### Competition Terms

This page should cover higher-level competition participation terms, including:

- eligibility framing
- participation mechanics
- payment and confirmation
- ticket issuance and delivery
- cancellation, suspension, or correction of obvious operational errors
- fraud, misuse, or duplicate/invalid entry handling
- limitation of liability
- contact path
- NLC scheme reference

This page is the contractual/operational terms page for entering the current competition.

### Competition Rules

This page should cover the rulebook details for the active campaign, including:

- competition title
- prize list
- entry price
- competition period
- draw date
- how entries are counted
- how winner selection is handled
- winner contact and verification framing
- disqualification conditions
- dispute and recordkeeping framing
- NLC scheme reference

This page is the practical rule summary that maps directly to the current campaign.

## Fallback Behavior

If no active competition exists:

- the routes should still render successfully
- the pages should show a clear notice that no active competition is currently published
- the legal structure may still be shown, but the campaign-specific summary should indicate that active campaign details are unavailable until a new competition is published

This is safer than returning a 404 because the routes remain stable and can be linked publicly.

## Linking Strategy

Do not replace the generic site-wide `/terms` footer link.

Instead, add explicit links from the competition page near the compliance area or payment-entry area:

- `Competition Terms`
- `Competition Rules`

This keeps the distinction clear between:

- general website legal terms
- competition-specific conditions

## Content Control

The legal page structure should remain fixed in source code. Only campaign facts should be dynamic.

Do not implement this as a rich-text admin-managed legal CMS for now. That would create unnecessary consistency and compliance risk.

## Implementation Notes

- The route pages should live in `src/pages`.
- Route registration belongs in `src/App.tsx`.
- Reuse the existing public legal-page layout if it fits cleanly.
- If needed, add a competition-specific legal page helper that accepts:
  - route title
  - route subtitle
  - active competition data
  - structured section content
- Keep wording consistent with the current competition compliance wording already introduced elsewhere in the site.

## Verification

Implementation will be considered complete when:

- `/competition/terms` and `/competition/rules` render without 404s
- both routes reflect the live active competition from Convex
- both routes render a stable fallback state when no active competition exists
- the competition page exposes links to both routes
- the injected title, price, prize, and date fields match the active competition page
- wording remains consistent with the NLC scheme reference already used on the site

## Non-Goals

- This work does not add admin-authored custom legal text per competition.
- This work does not add a legal CMS.
- This work does not replace legal review.
- This work does not change payment, ticketing, or draw business logic.
