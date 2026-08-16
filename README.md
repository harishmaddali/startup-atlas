# Startup Atlas

A map of YC-backed startups, starting with Hyderabad, India. Inspired by
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

Company data lives in [`src/data/companies.json`](src/data/companies.json),
shaped by [`src/types/company.ts`](src/types/company.ts):

```ts
{
  id, name, address, location: { lat, lng },
  contactEmail, founders, yearFounded, logoUrl,
  ycBatch, website, description, dataConfidence
}
```

The initial Hyderabad dataset (10 companies) was compiled from Y Combinator's
own [company directory filtered to Hyderabad](https://www.ycombinator.com/companies/location/hyderabad).
Names, founders, batch, and year founded come directly from YC profiles.
Exact office addresses aren't publicly listed, so `location` is a
neighborhood-level approximation (`dataConfidence: "approximate"`) and
`contactEmail` is left `null` where no public email was found — please verify
and correct entries as you find more accurate data.

The map loads/ranks companies by proximity to the current map center
(`src/lib/geo.ts`), showing the sidebar list sorted nearest-first and
filtered to a 15km radius when possible.
