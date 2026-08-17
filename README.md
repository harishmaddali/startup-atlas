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
(~2.6MB), shaped by [`src/types/company.ts`](src/types/company.ts):

```ts
{
  id, name, address, location: { lat, lng },
  contactEmail, founders: { name, linkedinUrl?, twitterUrl? }[],
  yearFounded, logoUrl, ycBatch, website, description, status, dataConfidence
}
```

Sourced directly from Y Combinator's own company directory — per-city
location pages plus the India HQ list (`/companies/location/india`) and
each company's profile payload — name, founders, batch, year founded,
website, city, and status all come straight from YC, not inferred, guessed,
or web-search-summarized.

**Coverage by region:**

| Region | Companies |
| --- | --- |
| San Francisco Bay Area | 2,301 |
| New York | 593 |
| London | 174 |
| Los Angeles | 140 |
| Bengaluru | 122 |
| Boston | 80 |
| Seattle | 62 |
| Austin | 56 |
| Singapore | 45 |
| Gurugram | 21 |
| Delhi / New Delhi | 19 |
| Mumbai | 18 |
| Dubai | 15 |
| Hyderabad | 14 |
| Sydney | 11 |
| Noida | 2 |
| Pune | 2 |
| Chennai | 2 |
| Kolkata | 1 |
| Chandigarh | 1 |
| Coimbatore | 1 |
| Raipur | 1 |
| Lucknow | 1 |
| Surat | 1 |
| Melbourne | 1 |

(Smaller US/UK metros like Philadelphia, Oxford, and Cambridge also have a
handful of companies each, not broken out as their own rows here.)

India is sourced from YC's own India HQ list (`/companies/location/india`
plus each company's profile `city` / `country=IN`) — **209 companies**,
not just the metros that have a dedicated YC city page. Cities that were
previously missing (Chennai, Kolkata, Chandigarh, Coimbatore, Raipur,
Lucknow, Surat) and NCR suburbs that were collapsed into New Delhi
(Gurugram, Noida) are now pinned at their actual YC city.

A few notes on how the India pass shook out:

- YC's directory `all_locations` is often state-level (`MH, India`) even
  when the company profile has a city. Each company is placed by its
  profile `city` field first. The 18 companies YC only labels `MH, India`
  / `India` were assigned Mumbai or Pune from their own profiles (or, for
  newly added ones, from the company's own site / Crunchbase HQ). Kalam
  Labs (YC location: India) is in Lucknow per its own site; Pulse Active
  Stations Network is in Hyderabad per its contact page.
- Delhi NCR is no longer lumped under `"New Delhi, India"`. Gurugram (21)
  and Noida (2) sit at their own city centers; Delhi and New Delhi stay
  distinct.
- One Bengaluru company (Betterhalf) had no founders listed on its YC
  profile; filled in from its own public funding announcements. Scribe
  (acquired) had no stable logo URL and now uses the initials-avatar
  fallback (`src/components/company-logo.tsx`), same as other companies
  with no YC logo.
- Checked whether T-Hub (Hyderabad's large public-private incubator, 2,000+
  portfolio companies) had YC-backed startups missing from YC's own
  Hyderabad listing. The ~8 startups T-Hub features on its homepage weren't
  YC-backed, and their own `/startups-directory` page (which should list
  the full portfolio) rendered empty when checked — not something to
  exhaustively cross-reference by hand either way. YC's own India HQ list
  remains the source of truth here.
- Founder `linkedinUrl`/`twitterUrl` come from YC profiles for Hyderabad
  companies and for newly added India companies; most older records still
  only have founder `name`.

**Address precision is mixed, and this is tracked per row**
(`dataConfidence: "verified" | "approximate"`). For most of the dataset,
exact office addresses aren't publicly listed anywhere, so `location` is a
city/neighborhood-level approximation — deterministically jittered around
each city's center (with a wider spread for sprawling metros like the Bay
Area) so markers don't stack, not tied to any claimed real address.

Indian companies with a real, individually-sourced office address (from
each company's own site footer, legal pages, or public MCA filings — not
a guess) are geocoded via OpenStreetMap Nominatim and marked
`dataConfidence: "verified"`:

- **Bengaluru:** 92 of 125 companies now have a street-level pin. The
  remaining 33 keep the city-level approximation — no trustworthy
  Bengaluru street address turned up (several are registered in another
  city, early-stage with no public office, or acquired/defunct with only
  a vague "Bangalore" listing). Plotting those as a specific building
  would be actively misleading.
- **Hyderabad:** 7 of the original 10, plus Pulse Active Stations
  Network. SpadeWorks, AlgoUniversity, and Reclaim Protocol stay
  approximate (AlgoUniversity's registered address is in Raipur,
  Chhattisgarh).
- **Elsewhere in India:** HelpNow (Mumbai), TagMango (Kolkata), and
  GimBooks (Raipur).

The map shows exactly the companies whose markers fall inside the current
viewport (`src/components/startup-map.tsx`), updating live as you pan/zoom
— not a fixed radius or proximity ranking. At world zoom the sidebar list is
capped at 200 (of however many are in view) purely for render performance;
the map itself still clusters and shows all of them via
`react-leaflet-cluster`.

**Known tradeoff:** the full dataset (~2.6MB of JSON) is currently fetched
server-side and passed to the client as page props on every load — fine for
now, but if this grows further it'd be worth moving to real pagination /
viewport-scoped queries once a database is in place (see
`src/app/actions/companies.ts`).

**The map shows companies founded 2022 or later, plus every India-HQ
company regardless of year** — so Kolkata, Chandigarh, Chennai, and other
Indian cities aren't hidden by the recency cutoff. `companies.json` itself
keeps every company regardless of founding year; both rules are applied
inside `getCompanies()` (`src/app/actions/companies.ts`). Change
`MIN_YEAR_FOUNDED` there to adjust the worldwide cutoff.

**Companies that have actually shut down are removed from the dataset
entirely** (not just filtered from the map) — this one genuinely deletes
rows from `companies.json`, unlike the year cutoff above. Two passes:

- The 4 companies YC itself tags `"Inactive"` from its earliest (2005-2008)
  batches — Infogami, Slinkset, Picwing, Hungry Labs — cross-checked via web
  search (e.g. Infogami's founder, Aaron Swartz, went on to co-found Reddit
  after Infogami ceased operating in 2005).
- Of the 648 companies YC tags `"Acquired"` — which does *not* mean shut
  down; most acquisitions are successful exits whose product keeps running
  under new ownership — each one was individually researched (site check +
  web search, defaulting to keep on ambiguous evidence) rather than removed
  by tag alone. **199 of 648** turned out to be genuinely discontinued
  post-acquisition (e.g. Parse, Posterous, Hipmunk, Homejoy, RethinkDB,
  Pebble); the other 449 are kept since their product/tech demonstrably
  continues (e.g. Heroku, Twitch, Disqus, HelloSign→Dropbox Sign).

One caution that came out of this: a *separate* batch of 39 companies also
tagged `"Inactive"` by YC (newer, non-2005-era ones, mostly from the India
expansion) turned out to be unreliable — a spot check found 3 of 4 checked
(Synapsica Healthcare, PropReturns, Drivezy) are confirmably still
operating in 2026 despite the tag. So `"Inactive"` alone was **not**
treated as sufficient evidence for removal outside that first, verified
batch of 4 — it got the same individual-research treatment as `"Acquired"`
instead. Result: **21 of 39** were confirmed genuinely shut down (dead
domains, explicit shutdown announcements, founders confirmed moved on) and
removed; the other **18** have independent evidence of still operating
(recent funding, active hiring, live product) and were kept despite the
stale tag.
