# Startup Atlas

A map of YC-backed startups across India. Inspired by
[bangalorestartupmap.com](https://bangalorestartupmap.com/).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Leaflet via `react-leaflet`, tiles from CARTO/OpenStreetMap (no API key needed)
- [motion](https://motion.dev) for animations

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Company data lives in [`src/data/companies.json`](src/data/companies.json)
(160 companies), shaped by [`src/types/company.ts`](src/types/company.ts):

```ts
{
  id, name, address, location: { lat, lng },
  contactEmail, founders, yearFounded, logoUrl,
  ycBatch, website, description, status, dataConfidence
}
```

Sourced directly from Y Combinator's own company directory, filtered per
city (`ycombinator.com/companies/location/<city>`) — name, founders, batch,
year founded, website, and status all come straight from each company's YC
profile, not inferred or guessed.

Covers: Hyderabad (10), Bengaluru (102), New Delhi NCR (35), Mumbai (11),
Pune (2). Kolkata has no dedicated YC location page — essentially no YC
company is HQ'd there, so it isn't represented. A few notes on how the
"authenticity" pass shook out, since YC's own location pages aren't always
literally scoped to one city:

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
  than shipped with a broken image.

Exact office addresses aren't publicly listed anywhere, so `location` is a
city/neighborhood-level approximation (`dataConfidence: "approximate"` on
every row) — deterministically jittered around each city's center so
markers don't stack, not tied to any claimed real address.

The map shows exactly the companies whose markers fall inside the current
viewport (`src/components/startup-map.tsx`), updating live as you pan/zoom
— not a fixed radius or proximity ranking.
