# Startup Atlas

Startup Atlas maps startups worldwide and source-backed capital and support across India, the United States, United Kingdom, Dubai, Singapore, Australia, New Zealand, and Israel. The ecosystem directory covers investors, accelerators, incubators, venture studios, active angels, and live or upcoming programs while keeping approximate and market-wide records honest about their location precision.

Built with [UNO.engineering](https://uno.engineering?ref=startup-atlas-readme).

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS and shadcn/ui
- Leaflet, CARTO, and OpenStreetMap tiles
- Zod-validated JSON as the only persistence layer
- Vitest, Testing Library, and Playwright

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Before publishing a data or product change, run:

```bash
pnpm data:validate
pnpm data:coverage
pnpm data:check-freshness
pnpm data:check-payload
pnpm test
pnpm lint
pnpm build
pnpm test:e2e
```

The production build uses Next.js's supported Webpack builder so it does not depend on Turbopack's local worker-port behavior. The app itself remains fully compatible with Vercel's Next.js runtime.

## Data architecture

The repository is the source of truth. There is no database, public submission workflow, or runtime write path.

- `src/data/companies.json`: published startups.
- `src/data/research-queue.json`: startup records held back because their location could not be published honestly.
- `src/data/ecosystem/organizations.json`: VC firms, angel networks, accelerators, incubators, venture studios, agencies, and university centres.
- `src/data/ecosystem/people.json`: recently active individual angels using public professional information only.
- `src/data/ecosystem/programs.json`: open, rolling, upcoming, and archived opportunities.
- `src/data/ecosystem/coverage.json`: city, metro, emirate, and national source sweeps, auditable lead batches, unresolved counts, and review dates.

The canonical terminology is defined in [`CONTEXT.md`](CONTEXT.md). Runtime schemas and TypeScript types live in `src/types/company-schema.ts` and `src/types/ecosystem.ts`.

Legal fund vehicles are recorded under the recognizable organization that manages them. Multiple public offices become multiple pins but one directory profile. Market-wide and remote actors without a verified public location appear in a separate market-wide results section and are never given an invented map point.

## Freshness and live programs

Programs are included in the live layer only when they are open, rolling, or open within 90 days. Deadline evaluation happens on every page request, so a past deadline disappears from the live layer without a commit. Live programs must be checked within 14 days; published organizations and angels must be checked within 120 days.

Every ecosystem record includes source evidence, verification dates, and location precision. Individual angels additionally require publicly disclosed startup investment activity in a served market within the preceding 24 months. Date-only deadlines are normalized to 23:59 in the source market's local timezone before being committed as offset-aware ISO timestamps.

## Map delivery

The initial page sends compact `MapItem` summaries for client-side filtering and clustering. Full records load only after selection through the internal read-only route:

```text
GET /api/map-entities/[kind]/[id]
```

The compressed summary must remain below the 1 MB release ceiling. URL parameters preserve search, layers, target market, geography, sector, stage, type, cheque band, support, delivery mode, application status, and the selected profile.

## Coverage status

Coverage is completed market by market and then city by city. Every requested market has a manifest and official discovery backbones in `coverage.json`; unresolved lead totals prevent research areas from being presented as complete. The product exposes that status and each profile's evidence so “comprehensive” always has a stated, auditable boundary.

The pre-existing startup dataset was runtime-validated before the ecosystem layer was enabled. Of 39 records that conflicted with the declared company shape, 12 received defensible city-level locations and 27 were moved to the research queue rather than receiving invented pins. The published startup layer currently contains 3,835 records.
