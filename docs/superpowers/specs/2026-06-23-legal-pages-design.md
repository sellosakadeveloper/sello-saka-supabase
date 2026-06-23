# Legal Pages Design

## Goal

Add production-usable public pages for:

- `Privacy Policy`
- `Terms of Service`
- `Cookie Policy`

These pages must match the current site architecture and the current runtime integrations, while avoiding invented legal facts that are not present in the repository.

## Approved Direction

- Add three new public routes: `/privacy`, `/terms`, and `/cookies`.
- Use South Africa-aware wording aligned with the site's current data flows and public functionality.
- Base the privacy framing on POPIA concepts and the Information Regulator's role.
- Keep policy content factual to the current codebase:
  - Convex
  - Convex Auth
  - PayFast
  - Resend
  - Netlify PDF ticket rendering
- Use narrow placeholders only where the repository does not contain a legally sensitive fact, such as a formally published Information Officer identity or PAIA manual link.

## Research Basis

Primary sources used for the design:

- POPIA official Act text: [Protection of Personal Information Act, 2013](https://www.gov.za/sites/default/files/gcis_document/201409/3706726-11act4of2013protectionofpersonalinforcorrect.pdf)
- Information Regulator official site: [Information Regulator South Africa](https://inforegulator.org.za/)
- Existing competition compliance basis already used on the site: [National Lotteries Commission Regulatory Compliance](https://www.nlcsa.org.za/regulatory-compliance/)

Key repo observations used to scope the pages:

- Footer links already point to `/privacy`, `/terms`, and `/cookies`, but those routes do not exist yet.
- Public forms collect personal information for:
  - contact messages
  - applications
  - donations
  - competition entries
- Admin auth uses Convex Auth with email and password.
- Ticket fulfillment uses Resend and a Netlify PDF rendering function.
- The code shows a functional UI cookie for sidebar state in `src/components/ui/sidebar.tsx`.

## Route And Page Structure

Add three route pages under `src/pages`:

- `PrivacyPolicy.tsx`
- `TermsOfService.tsx`
- `CookiePolicy.tsx`

Register them in `src/App.tsx` as:

- `/privacy`
- `/terms`
- `/cookies`

Each page should follow the current public-page composition pattern:

- `Header`
- route-owned content section
- shared `Footer`

## Content Design

### Privacy Policy

The page should include:

- effective date / last updated date
- scope of the policy
- categories of information collected
- how the foundation uses the information
- service providers and processing partners
- ticketing and payment-specific processing notes
- data retention summary
- security summary
- data-subject rights
- contact and complaints path

The data categories should align to the current codebase:

- names
- email addresses
- phone numbers
- contact form content
- application form details
- donation details
- competition entry details
- authentication/account details for admin users
- uploaded files where a user or admin submits documents or media

The processor/service-provider section should align to the current runtime:

- Convex for application data and backend processing
- PayFast for payment processing
- Resend for account and ticket emails
- Netlify function flow for downloadable competition ticket PDF rendering

The wording should explain these relationships plainly without overstating compliance status or legal conclusions.

### Terms Of Service

The page should include:

- acceptance of terms
- permitted use of the website
- content accuracy and availability
- donation terms summary
- competition entry and ticketing summary
- payment handling disclaimer
- intellectual property statement
- external links disclaimer
- liability limitation wording appropriate for a public nonprofit site
- governing law / South Africa framing
- contact details

The competition section should make clear that:

- competition participation is subject to the applicable competition mechanics displayed on the site
- payment confirmation and ticket issuance depend on successful processing
- separate competition-specific rules may apply where published

### Cookie Policy

The page should include:

- what cookies or similar technologies are used
- what they are used for
- current first-party functional cookie usage visible in the code
- third-party cookies that may be encountered during payment or auth flows
- how users can control cookies in their browser
- how policy updates will be communicated

The page should remain narrow and factual. It should not claim analytics, ad tech, remarketing, or consent-banner categories unless those are actually present in the project.

## Wording Posture

The policies should be written in plain English, not legal boilerplate copied from a generic template.

They should be:

- specific to the actual site
- conservative about claims
- compatible with South African privacy expectations
- understandable to donors, applicants, competition entrants, and general visitors

The copy must avoid invented assertions such as:

- a named Information Officer if none is configured in the repository or supplied by the user
- a PAIA manual link if none is available
- analytics or marketing cookie categories that are not actually in use

## Placeholder Rules

Where the repository does not prove a legally sensitive detail, the pages should use a narrow placeholder or temporary framing, for example:

- `Information Officer contact is currently available via the foundation support address pending publication of dedicated officer details.`

This keeps the public pages honest while still allowing the routes to be published.

## Implementation Notes

- Route pages should be placed in `src/pages`.
- Route registration belongs in `src/App.tsx`.
- Shared page framing should reuse the existing `Header` and `Footer`.
- The policy content can live directly in the route page files unless a reusable legal-page layout component becomes clearly beneficial.
- The implementation must not reintroduce Supabase language into public-facing policy content.

## Verification

Implementation will be considered complete when:

- `/privacy`, `/terms`, and `/cookies` render without 404s
- footer links resolve correctly site-wide
- mobile and desktop layouts remain consistent with the rest of the site
- the policy text matches the current codebase and integrations
- the policy text does not claim unsupported legal facts
- there are no stale Supabase references in the page content

## Non-Goals

- This work does not create a formal PAIA manual.
- This work does not appoint or publish a final Information Officer identity.
- This work does not replace legal review.
- This work does not add a cookie consent system or analytics banner by itself.
