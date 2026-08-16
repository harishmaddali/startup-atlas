# Startup Atlas

A map of YC-backed startups worldwide. Inspired by
[bangalorestartupmap.com](https://bangalorestartupmap.com/).

Built with [UNO.engineering](https://uno.engineering?ref=startup-atlas-readme).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Leaflet via `react-leaflet` + `react-leaflet-cluster`, tiles from CARTO/OpenStreetMap (no API key needed)
- [motion](https://motion.dev) for animations

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Company data lives in [`src/data/companies.json`](src/data/companies.json)
(~2.2MB), shaped by [`src/types/company.ts`](src/types/company.ts):

```ts
{
  id, name, address, location: { lat, lng },
  contactEmail, founders: { name, linkedinUrl?, twitterUrl? }[],
  yearFounded, logoUrl, ycBatch, website, description, status, dataConfidence
}
```

Sourced directly from Y Combinator's own company directory, filtered per
location (`ycombinator.com/companies/location/<slug>`) via its own embedded
JSON payload — name, founders, batch, year founded, website, and status all
come straight from each company's YC profile, not inferred, guessed, or
web-search-summarized.

**Coverage by region:**

| Region | Companies |
| --- | --- |
| San Francisco Bay Area | 2,473 |
| New York | 620 |
| London | 184 |
| Los Angeles | 167 |
| Bengaluru | 102 |
| Boston | 81 |
| New Delhi NCR | 35 |
| Singapore | 46 |
| Seattle | 66 |
| Austin | 60 |
| Hyderabad | 10 |
| Mumbai | 11 |
| Dubai | 15 |
| Sydney | 11 |
| Pune | 2 |
| Melbourne | 1 |

Kolkata has no dedicated YC location page — essentially no YC company is
HQ'd there, so it isn't represented rather than being faked.

A few notes on how the "authenticity" pass shook out, since YC's own
location pages aren't always literally scoped to one city:

- YC's "Mumbai" and "Pune" listing pages both surface the *same* 13-company
  Maharashtra-region set. Each company was reassigned to Mumbai or Pune
  based on its own profile's `location` field, not the page it was listed
  under (11 are actually Mumbai, 2 are actually Pune).
- YC's "New Delhi" page mixes Gurugram, Noida, and Delhi proper under one
  listing (Delhi NCR). Per request, all 35 are labeled `"New Delhi, India"`
  regardless of the actual suburb, and clustered visually around New Delhi
  rather than their real (more scattered) coordinates.
- One Bengaluru company (Betterhalf) had no founders listed on its YC
  profile; filled in from its own public funding announcements. One
  (Scribe, acquired/defunct) had no stable logo URL and was dropped rather
  than shipped with a broken image — that was before company logos got a
  proper initials-avatar fallback (`src/components/company-logo.tsx`), which
  the ~198 later companies with no YC logo now use instead of being dropped.
- Checked whether T-Hub (Hyderabad's large public-private incubator, 2,000+
  portfolio companies) had YC-backed startups missing from YC's own
  Hyderabad listing. The ~8 startups T-Hub features on its homepage weren't
  YC-backed, and their own `/startups-directory` page (which should list
  the full portfolio) rendered empty when checked — not something to
  exhaustively cross-reference by hand either way. YC's own location page
  remains the source of truth here; nothing added from this angle.
- Founder `linkedinUrl`/`twitterUrl` are only populated for the 10
  Hyderabad companies so far (straight from YC's own founder records, same
  as everything else) — every other company's founders just have `name`.

**Address precision is mixed, and this is tracked per row**
(`dataConfidence: "verified" | "approximate"`). For most of the dataset,
exact office addresses aren't publicly listed anywhere, so `location` is a
city/neighborhood-level approximation — deterministically jittered around
each region's center (with a wider spread for sprawling metros like the Bay
Area) so markers don't stack, not tied to any claimed real address.

Hyderabad is the exception: 7 of its 10 companies now have a real,
individually-sourced office address (from each company's own site footer or
public company-registration filings — not a guess) geocoded to a precise
pin via OpenStreetMap Nominatim, marked `dataConfidence: "verified"`. The
remaining 3 (SpadeWorks, AlgoUniversity, Reclaim Protocol) keep the
neighborhood-level approximation — no reliable real address turned up for
them (AlgoUniversity's registered address, for one, is actually in Raipur,
Chhattisgarh, which would be actively misleading to plot as their pin).

The map shows exactly the companies whose markers fall inside the current
viewport (`src/components/startup-map.tsx`), updating live as you pan/zoom
— not a fixed radius or proximity ranking. At world zoom the sidebar list is
capped at 200 (of however many are in view) purely for render performance;
the map itself still clusters and shows all of them via
`react-leaflet-cluster`.

**Known tradeoff:** the full dataset (~2.2MB of JSON) is currently fetched
server-side and passed to the client as page props on every load — fine for
now, but if this grows further it'd be worth moving to real pagination /
viewport-scoped queries once a database is in place (see
`src/app/actions/companies.ts`).

**The map only shows companies founded 2022 or later.** `companies.json`
itself keeps every company regardless of founding year — the cutoff is
applied as a filter inside `getCompanies()` (`src/app/actions/companies.ts`),
not by deleting anything from the data file. Change `MIN_YEAR_FOUNDED` there
to adjust the cutoff.
