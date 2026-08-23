import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { EcosystemOrganization, MapLocation } from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const ELEVATE_URL = "https://www.nzgcp.co.nz/funding/elevate-venture-fund";
const organizationsPath = resolve(process.cwd(), "src/data/ecosystem/organizations.json");

type ManagerSeed = {
  id: string;
  name: string;
  aliases?: string[];
  website: string;
  description: string;
  sectors: string[];
  stages: EcosystemOrganization["stages"];
  cities?: Array<{ city: string; state: string; lat: number; lng: number; source?: string }>;
};

const seeds: ManagerSeed[] = [
  {
    id: "pacific-channel",
    name: "Pacific Channel",
    website: "https://www.pacificchannel.com/",
    description: "An Auckland-based Asia-Pacific venture manager investing from pre-seed through Series A in deep-tech companies across health, food, agriculture, and environmental innovation.",
    sectors: ["deeptech", "healthcare", "agritech", "foodtech", "climate"],
    stages: ["pre_seed", "seed", "series_a"],
    cities: [{ city: "Auckland", state: "Auckland", lat: -36.8485, lng: 174.7633, source: "https://www.pacificchannel.com/contact" }],
  },
  {
    id: "movac",
    name: "Movac",
    website: "https://www.movac.co.nz/",
    description: "A New Zealand venture-capital manager backing teams with defensible intellectual property, disruptive potential, and large global markets from early stage through growth.",
    sectors: ["deeptech", "software", "healthcare", "climate"],
    stages: ["seed", "series_a", "series_b_plus", "growth"],
    cities: [
      { city: "Auckland", state: "Auckland", lat: -36.8485, lng: 174.7633, source: "https://www.movac.co.nz/contact/" },
      { city: "Wellington", state: "Wellington", lat: -41.2866, lng: 174.7756, source: "https://www.movac.co.nz/contact/" },
    ],
  },
  {
    id: "finistere-ventures",
    name: "Finistere Ventures",
    website: "https://finistere.com/",
    description: "A global specialist venture manager whose Finistere Aotearoa Fund targets New Zealand agrifood-technology companies requiring Series A and Series B capital.",
    sectors: ["agritech", "foodtech", "climate"],
    stages: ["series_a", "series_b_plus"],
  },
  {
    id: "gd1",
    name: "GD1",
    aliases: ["Global From Day One"],
    website: "https://www.gd1.vc/",
    description: "An Auckland venture-capital firm investing in New Zealand-connected technology companies across software, deep tech, health, and connected hardware from early stage onward.",
    sectors: ["software", "deeptech", "healthcare", "hardware"],
    stages: ["pre_seed", "seed", "series_a", "series_b_plus"],
    cities: [{ city: "Auckland", state: "Auckland", lat: -36.8485, lng: 174.7633, source: "https://www.gd1.vc/get-in-touch" }],
  },
  {
    id: "nuance-connected-capital",
    name: "Nuance Connected Capital",
    aliases: ["Nuance Capital"],
    website: "https://www.nuance.vc/",
    description: "A New Zealand deep-tech venture manager investing in founders applying emerging technology to climate, energy, advanced manufacturing, materials, robotics, and other major societal challenges.",
    sectors: ["deeptech", "climate", "energy", "manufacturing", "robotics"],
    stages: ["seed", "series_a", "series_b_plus"],
    cities: [
      { city: "Auckland", state: "Auckland", lat: -36.8485, lng: 174.7633 },
      { city: "Tauranga", state: "Bay of Plenty", lat: -37.6878, lng: 176.1651 },
    ],
  },
  {
    id: "hillfarrance",
    name: "Hillfarrance Venture Capital",
    aliases: ["Hillfarrance"],
    website: "https://hillfarrance.com/",
    description: "An early-stage New Zealand venture-capital firm focused on founder-led technology businesses in machine learning, media, content, gaming, and climate solutions.",
    sectors: ["artificial intelligence", "media", "gaming", "climate", "software"],
    stages: ["pre_seed", "seed", "series_a"],
  },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function locationsFor(seed: ManagerSeed): MapLocation[] {
  return (seed.cities ?? []).map((place, index) => ({
    id: `${seed.id}-${slugify(place.city)}`,
    role: index === 0 ? "headquarters" : "office",
    label: `${seed.name} — ${place.city}`,
    address: null,
    city: place.city,
    district: null,
    state: place.state,
    postalCode: null,
    marketCode: "NZ",
    countryCode: "NZ",
    coordinates: { lat: place.lat, lng: place.lng },
    precision: "city",
    evidenceUrl: place.source ?? ELEVATE_URL,
    verifiedAt: CHECKED_AT,
  }));
}

const organizations = JSON.parse(readFileSync(organizationsPath, "utf8")) as EcosystemOrganization[];
const ids = new Set(organizations.map((item) => item.id));
let created = 0;

for (const seed of seeds) {
  if (ids.has(seed.id)) continue;
  organizations.push({
    id: seed.id,
    kind: "organization",
    name: seed.name,
    aliases: seed.aliases ?? [],
    categories: ["vc_firm"],
    description: seed.description,
    status: "active",
    publicationState: "published",
    website: seed.website,
    logoUrl: `https://www.google.com/s2/favicons?domain=${new URL(seed.website).hostname}&sz=128`,
    serviceMarkets: [{ marketCode: "NZ", serviceMode: seed.cities?.length ? "hybrid" : "remote" }],
    sectors: seed.sectors,
    stages: seed.stages,
    supportCapabilities: ["seed_funding", "investor_access", "market_access", "mentorship"],
    investmentThesis: seed.description,
    investmentPreference: "both",
    portfolioUrl: seed.website,
    applicationUrl: seed.website,
    affiliations: ["Elevate NZ Venture Fund underlying manager"],
    registrations: [],
    managedVehicles: [],
    locations: locationsFor(seed),
    evidence: [{
      url: ELEVATE_URL,
      title: "Elevate NZ Venture Fund — Current fund investments",
      publisher: "New Zealand Growth Capital Partners",
      sourceClass: "government_registry",
      checkedAt: CHECKED_AT,
      supports: ["current underlying manager", "New Zealand investment mandate", "fund and stage focus", "official website"],
    }],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  });
  ids.add(seed.id);
  created += 1;
}

organizations.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);
console.log(`Resolved six named current Elevate managers (${created} created).`);
