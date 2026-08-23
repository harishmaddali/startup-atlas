import { createReadStream, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";

import type { EcosystemOrganization } from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const DIRECTORY_URL = "https://nvca.org/nvca-members/";

const workspace = process.cwd();
const htmlPath = process.argv[2] ?? "/tmp/nvca-members.html";
const geonamesPath = process.argv[3] ?? "/tmp/geonames-us/US.txt";
const adminCodesPath = process.argv[4] ?? "/tmp/admin1CodesASCII.txt";
const organizationsPath = path.join(
  workspace,
  "src/data/ecosystem/organizations.json",
);

function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type MemberRow = {
  name: string;
  website: string;
  city: string;
  stateCode: string;
};

const html = readFileSync(htmlPath, "utf8");
const memberPattern =
  /<tr class=" member_block">\s*<td class="member_name"><a href="([^"]+)">([\s\S]*?)<\/a><\/td>\s*<td class="member_city">([\s\S]*?)<\/td>\s*<td class="member_state">([\s\S]*?)<\/td>/g;

const members: MemberRow[] = [...html.matchAll(memberPattern)].map((match) => ({
  website: match[1].trim(),
  name: plainText(match[2]),
  city: plainText(match[3]),
  stateCode: plainText(match[4]).replace(/[^A-Za-z]/g, ""),
}));

if (members.length !== 397) {
  throw new Error(`Expected 397 NVCA members, found ${members.length}`);
}

const stateNames = new Map<string, string>();
for (const line of readFileSync(adminCodesPath, "utf8").split("\n")) {
  const [code, name] = line.split("\t");
  if (code?.startsWith("US.") && name) {
    stateNames.set(code.slice(3), name);
  }
}

const cityAliases = new Map([
  ["Charelston|WV", "Charleston"],
  ["New York|NY", "New York City"],
  ["Saint Louis|MO", "St. Louis"],
]);

const desiredLocations = new Map<
  string,
  { lookupCity: string; displayCity: string; stateCode: string }
>();
for (const member of members) {
  if (!stateNames.has(member.stateCode)) continue;
  const key = `${member.city}|${member.stateCode}`;
  desiredLocations.set(key, {
    lookupCity: cityAliases.get(key) ?? member.city,
    displayCity: key === "Charelston|WV" ? "Charleston" : member.city,
    stateCode: member.stateCode,
  });
}

const geonamesLookup = new Map(
  [...desiredLocations.entries()].map(([key, location]) => [
    `${location.lookupCity.toLowerCase()}|${location.stateCode}`,
    key,
  ]),
);

async function main() {
  const geocodes = new Map<
    string,
    { lat: number; lng: number; population: number }
  >();
  const lines = createInterface({
    input: createReadStream(geonamesPath),
    crlfDelay: Infinity,
  });

  for await (const line of lines) {
  const fields = line.split("\t");
  if (fields[6] !== "P") continue;
  const stateCode = fields[10];
  const key = geonamesLookup.get(`${fields[1].toLowerCase()}|${stateCode}`);
  if (!key) continue;
  const candidate = {
    lat: Number(fields[4]),
    lng: Number(fields[5]),
    population: Number(fields[14] || 0),
  };
  const current = geocodes.get(key);
  if (!current || candidate.population > current.population) {
    geocodes.set(key, candidate);
  }
  }

const organizations = JSON.parse(
  readFileSync(organizationsPath, "utf8"),
) as EcosystemOrganization[];
const knownNames = new Set(organizations.map((item) => normalizeName(item.name)));
const knownIds = new Set(organizations.map((item) => item.id));

let imported = 0;
for (const member of members) {
  if (knownNames.has(normalizeName(member.name))) continue;

  const baseId = `nvca-${slugify(member.name)}`;
  let id = baseId;
  let suffix = 2;
  while (knownIds.has(id)) id = `${baseId}-${suffix++}`;
  knownIds.add(id);

  const locationKey = `${member.city}|${member.stateCode}`;
  const locationMeta = desiredLocations.get(locationKey);
  const geocode = geocodes.get(locationKey);
  const hasUsLocation = Boolean(locationMeta && geocode);
  const website = new URL(member.website).toString();
  const domain = new URL(website).hostname;
  const locationLabel = hasUsLocation
    ? `${locationMeta!.displayCity}, ${stateNames.get(member.stateCode)}`
    : "the United States market";

  organizations.push({
    id,
    kind: "organization",
    name: member.name,
    aliases: [],
    categories: ["vc_firm"],
    description: `${member.name} is a venture investor serving United States innovation companies and listed in the National Venture Capital Association's current member directory, with its public profile identifying ${locationLabel}.`,
    status: "active",
    publicationState: "published",
    website,
    logoUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    foundedYear: null,
    serviceMarkets: [
      { marketCode: "US", serviceMode: hasUsLocation ? "physical" : "remote" },
    ],
    sectors: ["sector_agnostic"],
    stages: [],
    supportCapabilities: [],
    investmentThesis:
      "Venture investing in high-growth innovation companies; founders should use the official website for current sector, stage, and cheque-size criteria.",
    investmentRange: null,
    investmentPreference: null,
    portfolioUrl: null,
    applicationUrl: website,
    contactEmail: null,
    linkedinUrl: null,
    affiliations: ["National Venture Capital Association"],
    registrations: [],
    managedVehicles: [],
    locations:
      hasUsLocation && locationMeta && geocode
        ? [
            {
              id: `${id}-${slugify(locationMeta.displayCity)}`,
              role: "headquarters",
              label: `${locationMeta.displayCity} public office city`,
              address: null,
              city: locationMeta.displayCity,
              district: null,
              state: stateNames.get(member.stateCode)!,
              postalCode: null,
              marketCode: "US",
              countryCode: "US",
              coordinates: { lat: geocode.lat, lng: geocode.lng },
              precision: "city",
              evidenceUrl: DIRECTORY_URL,
              verifiedAt: CHECKED_AT,
            },
          ]
        : [],
    evidence: [
      {
        url: DIRECTORY_URL,
        title: "NVCA member firms",
        publisher: "National Venture Capital Association",
        sourceClass: "official_website",
        checkedAt: CHECKED_AT,
        supports: ["venture investor classification", "current membership", "public office city"],
      },
      {
        url: website,
        title: `${member.name} official website`,
        publisher: member.name,
        sourceClass: "official_website",
        checkedAt: CHECKED_AT,
        supports: ["operating identity", "founder contact path"],
      },
    ],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  });
  imported += 1;
}

  writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);
  console.log(
    `Imported ${imported} NVCA organizations (${geocodes.size}/${desiredLocations.size} US cities geocoded).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
