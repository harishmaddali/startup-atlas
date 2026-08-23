import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { EcosystemOrganization } from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const DIRECTORY_URL = "https://www.british-business-bank.co.uk/our-partners";

const workspace = process.cwd();
const partnersPath = process.argv[2] ?? "/tmp/bbb-partners.json";
const programmesPath = process.argv[3] ?? "/tmp/bbb-program-partners.json";
const organizationsPath = path.join(
  workspace,
  "src/data/ecosystem/organizations.json",
);

type Partner = { id: string; name: string; website: string };
type Programme = { id: string; label: string; count: number; rows: Partner[] };

const includedNames = new Set([
  "13books Capital",
  "2050 Capital",
  "24 Haymarket",
  "7percent Ventures",
  "Abingworth",
  "Accelerated Digital Ventures",
  "Active Partners",
  "Ada Ventures",
  "Advent Life Sciences",
  "AlbionVC",
  "Amadeus Capital",
  "Angel Academe",
  "Angel CoFund",
  "Apposite Capital",
  "Araya Ventures",
  "Archangels",
  "Ascension Ventures",
  "Atempo Growth",
  "Atlantic Bridge",
  "Atomico",
  "Balderton Capital",
  "Bethnal Green Ventures",
  "Bootstrap Europe II",
  "British Design Fund",
  "Cambridge Innovation Capital",
  "Catapult Ventures",
  "CircleRock Capital",
  "Clarendon Fund Managers",
  "Claret Capital Partners",
  "Columbia Lake Partners",
  "Concept Ventures",
  "Crane",
  "Dawn Capital",
  "Deepbridge",
  "Deeptech Labs",
  "Dementia Discovery Fund",
  "DSW Ventures",
  "Earlybird Venture Capital",
  "Edge Investments",
  "Eka Ventures",
  "Elbow Beach",
  "Empirical Ventures",
  "Entrepreneur First",
  "EOS",
  "Epidarex Capital",
  "Episode1 Ventures",
  "ETF Partners",
  "Eurazeo",
  "Evolution Equity Partners",
  "Exceptional Ventures",
  "Foresight Group",
  "Form Ventures",
  "Frog Capital",
  "FSE Group",
  "Future Planet Capital Regional",
  "Green Angel Ventures",
  "Haatch",
  "HERmesa",
  "Hoxton Ventures",
  "Imbiba",
  "IQ Capital",
  "JamJar Investments",
  "Kennet",
  "Kindred",
  "Longwall Ventures",
  "Maven Capital Partners",
  "Mercia Asset Management",
  "Mercia Fund Management",
  "Mercuri",
  "MMC Ventures",
  "Mobeus",
  "Molten Ventures Plc",
  "MVM Partners",
  "Nauta Capital",
  "Newable",
  "Northern Gritstone",
  "Notion Capital",
  "Odyssey Ventures",
  "Osney Capital",
  "Outward VC",
  "Oxx",
  "Partech",
  "Passion Capital",
  "Pentech",
  "Prefequity",
  "Prime Ventures",
  "PXN Group",
  "Redrice",
  "Revaia",
  "River Capital",
  "Salica Investments",
  "Science Creates Ventures (SCV)",
  "Scottish Equity Partners",
  "Seedcamp",
  "Seraphim",
  "Sie Ventures",
  "Startup Funding Club",
  "SuperSeed",
  "Sure Valley Ventures",
  "Sussex Place Ventures",
  "SV Health Investors",
  "Syndicate Room",
  "The Games Angels",
  "Thena Capital",
  "Twin Path Ventures",
  "UCL Technology Fund",
  "VGC Partners",
  "Viola Credit",
  "Whiterock Finance",
  "Zinc Ventures",
]);

const operatingNames = new Map<string, string>([
  ["acfinvestors.com", "ACF Investors"],
  ["midven.co.uk", "Future Planet Capital Regional"],
  ["mercia.co.uk", "Mercia Asset Management"],
  ["sfccapital.com", "SFC Capital"],
  ["svhealthinvestors.com", "SV Health Investors"],
]);

const ventureDebtNames = new Set([
  "Atempo Growth",
  "Bootstrap Europe II",
  "Claret Capital Partners",
  "Columbia Lake Partners",
  "Prefequity",
  "Viola Credit",
  "Whiterock Finance",
]);

const angelNetworkNames = new Set([
  "2050 Capital",
  "24 Haymarket",
  "Angel Academe",
  "Angel CoFund",
  "Archangels",
  "CircleRock Capital",
  "Clarendon Fund Managers",
  "Deepbridge",
  "EOS",
  "Green Angel Ventures",
  "HERmesa",
  "Newable",
  "Odyssey Ventures",
  "Startup Funding Club",
  "Syndicate Room",
  "The Games Angels",
]);

function domainFor(url: string) {
  return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
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

const partners = JSON.parse(readFileSync(partnersPath, "utf8")) as Partner[];
const programmes = JSON.parse(readFileSync(programmesPath, "utf8")) as Programme[];
if (partners.length !== 298) {
  throw new Error(`Expected 298 British Business Bank partners, found ${partners.length}`);
}

const programmeLabelsByPartner = new Map<string, string[]>();
for (const programme of programmes) {
  for (const partner of programme.rows) {
    const labels = programmeLabelsByPartner.get(partner.id) ?? [];
    labels.push(programme.label);
    programmeLabelsByPartner.set(partner.id, labels);
  }
}

const includedRows = partners.filter((partner) => includedNames.has(partner.name));
const missingNames = [...includedNames].filter(
  (name) => !partners.some((partner) => partner.name === name),
);
if (missingNames.length) {
  throw new Error(`Included British Business Bank names not found: ${missingNames.join(", ")}`);
}

const grouped = new Map<string, Partner[]>();
for (const partner of includedRows) {
  const domain = domainFor(partner.website);
  const group = grouped.get(domain) ?? [];
  group.push(partner);
  grouped.set(domain, group);
}

const organizations = JSON.parse(
  readFileSync(organizationsPath, "utf8"),
) as EcosystemOrganization[];
const byDomain = new Map(
  organizations.map((organization) => [domainFor(organization.website), organization]),
);
const knownIds = new Set(organizations.map((organization) => organization.id));
let created = 0;
let updated = 0;

for (const [domain, partnerRows] of grouped) {
  const first = partnerRows[0];
  const programmeLabels = [
    ...new Set(partnerRows.flatMap((partner) => programmeLabelsByPartner.get(partner.id) ?? [])),
  ];
  const aliases = partnerRows.map((partner) => partner.name);
  const name = operatingNames.get(domain) ?? first.name;
  const evidence = {
    url: DIRECTORY_URL,
    title: "British Business Bank partners",
    publisher: "British Business Bank",
    sourceClass: "government_registry" as const,
    checkedAt: CHECKED_AT,
    supports: ["current partner status", "equity or angel programme participation", "official website"],
  };
  const existing = byDomain.get(domain);
  if (existing) {
    existing.aliases = [...new Set([...existing.aliases, ...aliases.filter((alias) => alias !== existing.name)])];
    existing.affiliations = [
      ...new Set([
        ...(existing.affiliations ?? []),
        ...programmeLabels.map((label) => `British Business Bank: ${label}`),
      ]),
    ];
    if (!existing.evidence.some((item) => item.url === DIRECTORY_URL)) {
      existing.evidence.push(evidence);
    }
    if (!existing.serviceMarkets.some((market) => market.marketCode === "GB")) {
      existing.serviceMarkets.push({ marketCode: "GB", serviceMode: "remote" });
    }
    if (
      partnerRows.some((partner) => ventureDebtNames.has(partner.name)) &&
      !existing.categories.includes("venture_debt")
    ) {
      existing.categories.push("venture_debt");
    }
    if (
      partnerRows.some((partner) => angelNetworkNames.has(partner.name)) &&
      !existing.categories.includes("angel_network")
    ) {
      existing.categories.push("angel_network");
    }
    updated += 1;
    continue;
  }

  const baseId = `bbb-${slugify(name)}`;
  let id = baseId;
  let suffix = 2;
  while (knownIds.has(id)) id = `${baseId}-${suffix++}`;
  knownIds.add(id);

  const categories: EcosystemOrganization["categories"] = ["vc_firm"];
  if (partnerRows.some((partner) => ventureDebtNames.has(partner.name))) {
    categories.push("venture_debt");
  }
  if (partnerRows.some((partner) => angelNetworkNames.has(partner.name))) {
    categories.push("angel_network");
  }

  const website = new URL(first.website).toString();
  organizations.push({
    id,
    kind: "organization",
    name,
    aliases: [...new Set(aliases.filter((alias) => alias !== name))],
    categories,
    description: `${name} is a current British Business Bank partner providing founder-relevant equity, patient capital, angel syndication, or venture debt through ${programmeLabels.join(", ")}.`,
    status: "active",
    publicationState: "published",
    website,
    logoUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    foundedYear: null,
    serviceMarkets: [{ marketCode: "GB", serviceMode: "remote" }],
    sectors: ["sector_agnostic"],
    stages: ["pre_seed", "seed", "series_a", "series_b_plus", "growth"],
    supportCapabilities: ["seed_funding", "investor_access"],
    investmentThesis:
      "Invests in or arranges capital for high-growth UK companies; founders should use the official website for current sector, stage, geography, and cheque-size criteria.",
    investmentRange: null,
    investmentPreference: null,
    portfolioUrl: null,
    applicationUrl: website,
    contactEmail: null,
    linkedinUrl: null,
    affiliations: programmeLabels.map((label) => `British Business Bank: ${label}`),
    registrations: [],
    managedVehicles: [],
    locations: [],
    evidence: [
      evidence,
      {
        url: website,
        title: `${name} official website`,
        publisher: name,
        sourceClass: "official_website",
        checkedAt: CHECKED_AT,
        supports: ["operating identity", "founder contact path"],
      },
    ],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  });
  created += 1;
}

writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);
console.log(
  `Resolved 298 British Business Bank partners: ${includedRows.length} relevant rows under ${grouped.size} operating organizations (${created} created, ${updated} updated), ${298 - includedRows.length} excluded.`,
);
