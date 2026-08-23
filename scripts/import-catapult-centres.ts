import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { EcosystemOrganization, MapLocation } from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const DIRECTORY_URL = "https://catapult.org.uk/about-us/our-centres/";
const organizationsPath = resolve(process.cwd(), "src/data/ecosystem/organizations.json");

type CentreSeed = {
  id: string;
  name: string;
  website: string;
  description: string;
  sectors: string[];
  cities: Array<{ city: string; state: string; lat: number; lng: number }>;
};

const centres: CentreSeed[] = [
  {
    id: "cell-gene-therapy-catapult",
    name: "Cell and Gene Therapy Catapult",
    website: "https://ct.catapult.org.uk/",
    description: "A UK innovation centre helping early-stage research become commercially viable and investible cell and gene therapies through specialist facilities and technical support.",
    sectors: ["healthcare", "biotech", "life sciences"],
    cities: [
      { city: "London", state: "England", lat: 51.5074, lng: -0.1278 },
      { city: "Stevenage", state: "England", lat: 51.9022, lng: -0.2026 },
      { city: "Braintree", state: "England", lat: 51.8782, lng: 0.5529 },
      { city: "Edinburgh", state: "Scotland", lat: 55.9533, lng: -3.1883 },
    ],
  },
  {
    id: "compound-semiconductor-applications-catapult",
    name: "Compound Semiconductor Applications Catapult",
    website: "https://csa.catapult.org.uk/",
    description: "The UK technology and commercialisation centre helping startups and industry de-risk compound-semiconductor applications in telecoms, energy, transport, quantum, and data infrastructure.",
    sectors: ["semiconductors", "deeptech", "energy", "telecommunications"],
    cities: [
      { city: "Newport", state: "Wales", lat: 51.5842, lng: -2.9977 },
      { city: "Bristol", state: "England", lat: 51.4545, lng: -2.5879 },
    ],
  },
  {
    id: "connected-places-catapult",
    name: "Connected Places Catapult",
    website: "https://cp.catapult.org.uk/",
    description: "The UK's innovation accelerator for cities, transport, and places, providing commercialization, market-access, and innovation support to startups and other organizations.",
    sectors: ["mobility", "transport", "smart cities", "infrastructure"],
    cities: [
      { city: "London", state: "England", lat: 51.5074, lng: -0.1278 },
      { city: "Milton Keynes", state: "England", lat: 52.0406, lng: -0.7594 },
      { city: "Birmingham", state: "England", lat: 52.4862, lng: -1.8904 },
    ],
  },
  {
    id: "digital-catapult",
    name: "Digital Catapult",
    website: "https://www.digicatapult.org.uk/",
    description: "A UK deep-tech innovation organization that helps companies test, adopt, commercialize, and responsibly scale advanced digital technologies.",
    sectors: ["deeptech", "artificial intelligence", "digital", "telecommunications"],
    cities: [
      { city: "London", state: "England", lat: 51.5074, lng: -0.1278 },
      { city: "Belfast", state: "Northern Ireland", lat: 54.5973, lng: -5.9301 },
      { city: "Bristol", state: "England", lat: 51.4545, lng: -2.5879 },
    ],
  },
  {
    id: "energy-systems-catapult",
    name: "Energy Systems Catapult",
    website: "https://es.catapult.org.uk/",
    description: "A Birmingham-based innovation centre helping energy businesses navigate market barriers, validate solutions, and accelerate the transition to low-carbon energy systems.",
    sectors: ["energy", "climate", "cleantech"],
    cities: [{ city: "Birmingham", state: "England", lat: 52.4862, lng: -1.8904 }],
  },
  {
    id: "high-value-manufacturing-catapult",
    name: "High Value Manufacturing Catapult",
    website: "https://hvm.catapult.org.uk/",
    description: "A network of six UK manufacturing centres that gives businesses access to industrial expertise, equipment, and applied research for developing and scaling manufacturing technologies.",
    sectors: ["manufacturing", "advanced materials", "deeptech"],
    cities: [],
  },
  {
    id: "medicines-discovery-catapult",
    name: "Medicines Discovery Catapult",
    website: "https://md.catapult.org.uk/",
    description: "A national medicines-discovery facility connecting UK startups and researchers with specialist technologies, expertise, and partners to improve the productivity and fundability of drug-discovery assets.",
    sectors: ["healthcare", "biotech", "life sciences"],
    cities: [{ city: "Alderley Edge", state: "England", lat: 53.3039, lng: -2.2377 }],
  },
  {
    id: "offshore-renewable-energy-catapult",
    name: "Offshore Renewable Energy Catapult",
    website: "https://ore.catapult.org.uk/",
    description: "The UK's technology innovation and research centre for offshore renewable energy, helping companies test, validate, de-risk, and commercialize technologies for the offshore supply chain.",
    sectors: ["energy", "climate", "cleantech", "manufacturing"],
    cities: [
      { city: "Glasgow", state: "Scotland", lat: 55.8642, lng: -4.2518 },
      { city: "Blyth", state: "England", lat: 55.1269, lng: -1.5142 },
      { city: "Leven", state: "Scotland", lat: 56.2, lng: -3.002 },
      { city: "Pembroke Dock", state: "Wales", lat: 51.694, lng: -4.938 },
    ],
  },
  {
    id: "satellite-applications-catapult",
    name: "Satellite Applications Catapult",
    website: "https://sa.catapult.org.uk/",
    description: "A UK innovation and technology centre helping businesses use satellite applications, facilities, and expertise to create and commercialize space-enabled products and services.",
    sectors: ["space", "deeptech", "telecommunications"],
    cities: [
      { city: "Didcot", state: "England", lat: 51.606, lng: -1.238 },
      { city: "Leicester", state: "England", lat: 52.6369, lng: -1.1398 },
      { city: "Portsmouth", state: "England", lat: 50.8198, lng: -1.088 },
      { city: "Westcott", state: "England", lat: 51.846, lng: -0.967 },
    ],
  },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function locationsFor(centre: CentreSeed): MapLocation[] {
  return centre.cities.map((place, index) => ({
    id: `${centre.id}-${slugify(place.city)}`,
    role: index === 0 ? "headquarters" : "incubation_facility",
    label: `${centre.name} — ${place.city}`,
    address: null,
    city: place.city,
    district: null,
    state: place.state,
    postalCode: null,
    marketCode: "GB",
    countryCode: "GB",
    coordinates: { lat: place.lat, lng: place.lng },
    precision: "city",
    evidenceUrl: DIRECTORY_URL,
    verifiedAt: CHECKED_AT,
  }));
}

const organizations = JSON.parse(readFileSync(organizationsPath, "utf8")) as EcosystemOrganization[];
const existingIds = new Set(organizations.map((organization) => organization.id));
let created = 0;

for (const centre of centres) {
  if (existingIds.has(centre.id)) continue;
  organizations.push({
    id: centre.id,
    kind: "organization",
    name: centre.name,
    aliases: [],
    categories: ["incubator", "government_agency"],
    description: centre.description,
    status: "active",
    publicationState: "published",
    website: centre.website,
    logoUrl: `https://www.google.com/s2/favicons?domain=${new URL(centre.website).hostname}&sz=128`,
    serviceMarkets: [{ marketCode: "GB", serviceMode: "hybrid" }],
    sectors: centre.sectors,
    stages: ["idea", "pre_seed", "seed", "series_a", "growth"],
    supportCapabilities: ["labs", "mentorship", "market_access", "corporate_pilots", "ip_support"],
    applicationUrl: centre.website,
    affiliations: ["Catapult Network", "Innovate UK"],
    registrations: [],
    managedVehicles: [],
    locations: locationsFor(centre),
    evidence: [
      {
        url: DIRECTORY_URL,
        title: "Our Centres",
        publisher: "Catapult Network",
        sourceClass: "official_website",
        checkedAt: CHECKED_AT,
        supports: ["current centre status", "startup support", "public operating locations"],
      },
    ],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  });
  existingIds.add(centre.id);
  created += 1;
}

organizations.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);
console.log(`Resolved all ${centres.length} Catapult centres (${created} created).`);
