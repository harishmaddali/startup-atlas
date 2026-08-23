import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { EcosystemOrganization } from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const INCUBATORS_URL = "https://innovationisrael.org.il/incubators-list/?nowprocket=1";
const CENTRES_URL = "https://innovationisrael.org.il/en/innovation-centers-data/";
const organizationsPath = resolve(process.cwd(), "src/data/ecosystem/organizations.json");

type Seed = {
  id: string;
  name: string;
  aliases?: string[];
  website: string;
  description: string;
  sectors: string[];
  city: string;
  state: string;
  lat: number;
  lng: number;
  source: string;
  categories?: EcosystemOrganization["categories"];
};

const incubators: Seed[] = [
  { id: "ngt-healthcare", name: "NGT HealthCare", website: "https://ngt-healthcare2.com/", description: "An Israel Innovation Authority technological incubator in Nazareth supporting medical-device and bioconvergence ventures with company-building, financing, and commercialization expertise.", sectors: ["healthcare", "medtech", "bioconvergence"], city: "Nazareth", state: "Northern District", lat: 32.6996, lng: 35.3035, source: INCUBATORS_URL },
  { id: "incentive-incubator", name: "Incentive Incubator", website: "https://www.incentive-il.com/", description: "An Or Yehuda technological incubator supporting ventures in medical devices, personalized and precision medicine, and bioconvergence with strategic and investor partners.", sectors: ["healthcare", "medtech", "bioconvergence"], city: "Or Yehuda", state: "Tel Aviv District", lat: 32.0311, lng: 34.8458, source: INCUBATORS_URL },
  { id: "the-kitchen-hub", name: "The Kitchen Hub", aliases: ["The Kitchen FoodTech Hub"], website: "https://www.thekitchenhub.com/", description: "A Strauss-backed food-technology incubator in Rehovot building and supporting startups that develop technologies for the food and beverage industry.", sectors: ["foodtech", "agritech"], city: "Rehovot", state: "Central District", lat: 31.8928, lng: 34.8113, source: INCUBATORS_URL },
  { id: "i4valley", name: "I4Valley", website: "https://www.i4valley.com/", description: "A Karmiel entrepreneurship incubator supporting Industry 4.0 startups with regional industrial partners, technical validation, mentorship, and commercialization pathways.", sectors: ["industry 4.0", "manufacturing", "deeptech"], city: "Karmiel", state: "Northern District", lat: 32.9199, lng: 35.2901, source: INCUBATORS_URL },
  { id: "innegev", name: "InNegev", website: "https://innegev.com/", description: "A southern Israel entrepreneurship incubator supporting plastics, clean technology, and agricultural technology ventures through industrial partners and commercialization resources.", sectors: ["climate", "agritech", "advanced materials"], city: "Idan HaNegev Industrial Park", state: "Southern District", lat: 31.359, lng: 34.798, source: INCUBATORS_URL },
  { id: "fresh-start-foodtech", name: "Fresh Start", aliases: ["Fresh Start FoodTech Incubator"], website: "https://fresh-start.co.il/", description: "A Kiryat Shmona food-technology incubator backed by strategic food companies and investors to establish, fund, and scale early-stage food innovation ventures.", sectors: ["foodtech", "agritech"], city: "Kiryat Shmona", state: "Northern District", lat: 33.2073, lng: 35.5708, source: INCUBATORS_URL },
  { id: "edge-medical-ventures", name: "Edge Medical Ventures", website: "https://edgemed.vc/", description: "An Or Yehuda medical-technology incubator supporting medical-device and bioconvergence companies through venture creation, clinical expertise, investment, and commercialization support.", sectors: ["healthcare", "medtech", "bioconvergence"], city: "Or Yehuda", state: "Tel Aviv District", lat: 32.0311, lng: 34.8458, source: INCUBATORS_URL, categories: ["incubator", "vc_firm"] },
  { id: "square-one-labs-build", name: "Square One Labs BUILD", aliases: ["S1L BUILD"], website: "https://s1l.vc/", description: "A Kiryat Arye technological incubator backed by industrial and venture partners to create and accelerate companies in energy, industry, and robotics.", sectors: ["energy", "manufacturing", "robotics"], city: "Petah Tikva", state: "Central District", lat: 32.084, lng: 34.8878, source: INCUBATORS_URL, categories: ["incubator", "vc_firm"] },
];

const centres: Seed[] = [
  { id: "gaia-partners-innovation-center", name: "GAIA Partners Innovation Center", aliases: ["GAIA"], website: "https://www.gaiapartners.co.il/", description: "An Eastern Galilee innovation center empowering startups in climate technology, agrifood technology, and AI for climate through research, mentorship, partnerships, and investor access.", sectors: ["climate", "agritech", "foodtech", "artificial intelligence"], city: "Kiryat Shmona", state: "Northern District", lat: 33.2073, lng: 35.5708, source: CENTRES_URL },
  { id: "civiclabs-israel", name: "CivicLabs", website: "https://www.civic-labs.com/", description: "A Yokneam innovation platform accelerating early-stage built-environment startups with mentorship, R&D and field access, pilots, business support, and investor connections.", sectors: ["built environment", "climate", "construction", "infrastructure"], city: "Yokneam", state: "Northern District", lat: 32.6594, lng: 35.11, source: CENTRES_URL },
  { id: "innoveast", name: "InnovEast", website: "https://innoveast.org/", description: "An Ariel regional innovation center promoting technology entrepreneurship, founder development, and high-tech employment through academic, industry, and investment partnerships.", sectors: ["technology", "deeptech"], city: "Ariel", state: "Judea and Samaria Area", lat: 32.105, lng: 35.174, source: CENTRES_URL },
  { id: "northmed-innovation-center", name: "NorthMed Innovation Center", aliases: ["NorthMED"], website: "https://northmed.tech/", description: "A Sakhnin health-technology innovation center offering venture building, entrepreneurship training, mentoring, research access, and talent programs for northern communities.", sectors: ["healthcare", "medtech", "digital health"], city: "Sakhnin", state: "Northern District", lat: 32.8643, lng: 35.2971, source: CENTRES_URL },
  { id: "hasoub-labs", name: "Hasoub Labs", aliases: ["HasoubLabs"], website: "https://www.hasoub.org/labs", description: "An Ar'ara innovation hub supporting Arab founders and technology professionals with programs spanning ideation, venture building, scaling, employment, and ecosystem access.", sectors: ["technology", "agritech", "climate"], city: "Ar'ara", state: "Haifa District", lat: 32.5005, lng: 35.0998, source: CENTRES_URL },
  { id: "jinnovate", name: "Jinnovate", aliases: ["JINNOVATE Jerusalem"], website: "https://jinnovate.tech/", description: "A Jerusalem health-technology innovation center supporting entrepreneurs from ideation through growth with incubation, mentorship, clinical partnerships, investor preparation, and AI expertise.", sectors: ["healthcare", "medtech", "artificial intelligence"], city: "Jerusalem", state: "Jerusalem District", lat: 31.7683, lng: 35.2137, source: CENTRES_URL },
  { id: "ibtikar-base-camp", name: "Ibtikar Base Camp", aliases: ["Ibtikar BaseCamp"], website: "https://ibtikar-bc.com/", description: "A Kfar Qasim innovation and employment center helping Arab founders accelerate startups through mentoring, proof-of-concept support, fundraising, workspace, and partner laboratories.", sectors: ["healthcare", "digital health", "technology"], city: "Kfar Qasim", state: "Central District", lat: 32.1141, lng: 34.9762, source: CENTRES_URL },
  { id: "norterra", name: "Norterra", aliases: ["Northern Innovation Synergy"], website: "https://www.norterra.co.il/", description: "A northeastern Israel regional innovation partnership supporting technology companies, entrepreneurship, talent, research collaboration, and growth across agriculture, water, climate, and applied technology.", sectors: ["agritech", "water", "climate", "artificial intelligence"], city: "Emek HaYarden", state: "Northern District", lat: 32.704, lng: 35.574, source: CENTRES_URL },
  { id: "hamitbah-western-negev", name: "Hamitbah", aliases: ["Western Negev Innovation Authority"], website: "https://hamitbah.com/en/", description: "The Western Negev innovation authority, helping startups secure pilots, mentors, funding pathways, and industry partnerships in agriculture, construction, connectivity, defence, and resilience.", sectors: ["agritech", "construction", "telecommunications", "defence", "resilience"], city: "Sha'ar HaNegev", state: "Southern District", lat: 31.509, lng: 34.59, source: CENTRES_URL },
  { id: "seanovation", name: "SeaNovation", website: "https://seanovation.org.il/", description: "An Eilat marine innovation center incubating and accelerating biotechnology, aquaculture, food-security, renewable-energy, and circular-economy ventures while building regional talent.", sectors: ["biotech", "aquaculture", "foodtech", "climate", "energy"], city: "Eilat", state: "Southern District", lat: 29.5577, lng: 34.9519, source: CENTRES_URL },
  { id: "desertech-climate-innovation-center", name: "DeserTech & Climate Innovation Center", aliases: ["DCIC"], website: "https://dcic.co.il/", description: "A Be'er Sheva climate innovation center accelerating desert and climate technologies, launching ventures, supporting pilots, and developing high-tech opportunity across the Negev.", sectors: ["climate", "agritech", "water", "energy", "infrastructure"], city: "Be'er Sheva", state: "Southern District", lat: 31.252, lng: 34.7915, source: CENTRES_URL },
  { id: "synergy7", name: "Synergy 7", aliases: ["Synergy7"], website: "https://synergy7.co.il/", description: "A Be'er Sheva innovation infrastructure hub providing advanced R&D laboratories, accelerators, and business development for startups in digital health, cybersecurity, and autonomous robotics.", sectors: ["digital health", "cybersecurity", "robotics"], city: "Be'er Sheva", state: "Southern District", lat: 31.252, lng: 34.7915, source: CENTRES_URL },
  { id: "darom-innovation-center", name: "DAROM Innovation Center", aliases: ["DAROM"], website: "https://darom.life/", description: "An Eastern Negev innovation center supporting ideas through pilots with mentoring, R&D assistance, test sites, and industry connections in green industry, energy, robotics, and climate resilience.", sectors: ["climate", "energy", "robotics", "manufacturing", "artificial intelligence"], city: "Dimona", state: "Southern District", lat: 31.069, lng: 35.033, source: CENTRES_URL },
];

const organizations = JSON.parse(readFileSync(organizationsPath, "utf8")) as EcosystemOrganization[];
const ids = new Set(organizations.map((item) => item.id));
let created = 0;

for (const seed of [...incubators, ...centres]) {
  if (ids.has(seed.id)) continue;
  organizations.push({
    id: seed.id,
    kind: "organization",
    name: seed.name,
    aliases: seed.aliases ?? [],
    categories: seed.categories ?? ["incubator", "accelerator"],
    description: seed.description,
    status: "active",
    publicationState: "published",
    website: seed.website,
    logoUrl: `https://www.google.com/s2/favicons?domain=${new URL(seed.website).hostname}&sz=128`,
    serviceMarkets: [{ marketCode: "IL", serviceMode: "hybrid" }],
    sectors: seed.sectors,
    stages: ["idea", "pre_seed", "seed", "series_a"],
    supportCapabilities: ["workspace", "mentorship", "seed_funding", "market_access", "investor_access", "ip_support"],
    applicationUrl: seed.website,
    affiliations: ["Israel Innovation Authority"],
    registrations: [],
    managedVehicles: [],
    locations: [{
      id: `${seed.id}-location`,
      role: "incubation_facility",
      label: `${seed.name} — ${seed.city}`,
      address: null,
      city: seed.city,
      district: null,
      state: seed.state,
      postalCode: null,
      marketCode: "IL",
      countryCode: "IL",
      coordinates: { lat: seed.lat, lng: seed.lng },
      precision: "city",
      evidenceUrl: seed.source,
      verifiedAt: CHECKED_AT,
    }],
    evidence: [
      {
        url: seed.source,
        title: seed.source === INCUBATORS_URL ? "Technological Incubators List" : "Innovation Centers — List",
        publisher: "Israel Innovation Authority",
        sourceClass: "government_registry",
        checkedAt: CHECKED_AT,
        supports: ["current government-backed operator", "public professional location", "activity focus", "official contact path"],
      },
      {
        url: seed.website,
        title: `${seed.name} official website`,
        publisher: seed.name,
        sourceClass: "official_website",
        checkedAt: CHECKED_AT,
        supports: ["current startup support activity", "programs or services", "founder contact path"],
      },
    ],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  });
  ids.add(seed.id);
  created += 1;
}

organizations.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);
console.log(`Resolved ${incubators.length} incubator and ${centres.length} innovation-centre leads (${created} created).`);
