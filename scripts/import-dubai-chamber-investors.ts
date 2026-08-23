import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type {
  EcosystemOrganization,
  OrganizationCategory,
  StartupStage,
} from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const GUIDE_URL =
  "https://www.dubaichambers.com/documents/20119/0/the-entrepreneurs-guide-2023%2B%281%29.pdf/f259198f-23fd-edf4-5714-7fd1e968c213?t=1722947398189";
const organizationsPath = resolve(
  process.cwd(),
  "src/data/ecosystem/organizations.json"
);

type MatrixSeed = {
  name: string;
  website: string;
  stages: StartupStage[];
  canonicalName?: string;
  categories?: OrganizationCategory[];
  physicalDubaiFacility?: boolean;
};

const excludedMatrixEntries = [
  "Gulf Islamic Investments",
  "Gulf Capital",
  "Morgan Stanley",
  "Standard Chartered",
];

const preSeed: StartupStage[] = ["pre_seed"];
const seed: StartupStage[] = ["seed"];
const seriesA: StartupStage[] = ["series_a"];
const seriesB: StartupStage[] = ["series_b_plus"];
const growth: StartupStage[] = ["growth"];

const matrix: MatrixSeed[] = [
  { name: "VentureSouq", website: "https://www.venturesouq.com/", stages: [...preSeed, ...seed] },
  { name: "Middle East Venture Partners", canonicalName: "MEVP", website: "https://www.mevp.com/", stages: [...preSeed, ...seed, ...growth] },
  { name: "Cypher Capital", website: "https://cyphercapital.com/", stages: [...preSeed, ...seed] },
  { name: "FasterCapital", website: "https://fastercapital.com/", stages: [...preSeed, ...seed], categories: ["vc_firm", "accelerator"] },
  { name: "Nuwa Capital", website: "https://nuwacapital.io/", stages: [...preSeed, ...seed, ...seriesA] },
  { name: "iMENA", website: "https://imena.com/", stages: [...preSeed] },
  { name: "GINCO Investments", website: "https://gincogroup.com/", stages: [...preSeed, ...seed] },
  { name: "Dubai Angel Investors", website: "https://www.dubaiangelinvestors.me/", stages: [...preSeed, ...seed, ...seriesA], categories: ["angel_network"] },
  { name: "NUMU Capital", website: "https://www.numucapital.com/", stages: [...preSeed, ...seed] },
  { name: "MENA Moonshots", website: "https://menamoonshots.com/", stages: [...preSeed, ...seed] },
  { name: "e& capital", website: "https://eand.com/en/capital.html", stages: [...seed, ...seriesA, ...seriesB, ...growth], categories: ["corporate_vc"] },
  { name: "EQ2 Ventures", website: "https://eq2ventures.com/", stages: [...seed, ...seriesA] },
  { name: "Dtec Ventures", canonicalName: "Dubai Technology Entrepreneur Campus", website: "https://dtec.ae/", stages: [...seed, ...seriesA], categories: ["corporate_vc", "incubator", "accelerator"], physicalDubaiFacility: true },
  { name: "BECO Capital", website: "https://www.becocapital.com/", stages: [...seed, ...seriesA] },
  { name: "500", canonicalName: "500 Global", website: "https://500.co/", stages: [...seed], categories: ["vc_firm", "accelerator"] },
  { name: "Wamda Capital", website: "https://wamdacapital.com/", stages: [...seed, ...seriesA, ...seriesB, ...growth] },
  { name: "ASA Ventures", website: "https://asaventures.com/", stages: [...seed, ...seriesA], categories: ["vc_firm", "venture_studio"] },
  { name: "NewTribe Capital", website: "https://newtribecapital.com/", stages: [...seed] },
  { name: "Jabbar", canonicalName: "Jabbar Internet Group", website: "https://www.jabbar.com/", stages: [...seed] },
  { name: "Prime Venture Partners", website: "https://primevp.com/", stages: [...seed, ...seriesA, ...seriesB] },
  { name: "Enabling Future", website: "https://enablingfuture.com/", stages: [...seed, ...seriesA, ...seriesB] },
  { name: "NB Ventures", website: "https://nbventures.com/", stages: [...seed, ...seriesA] },
  { name: "Global Ventures", website: "https://www.global.vc/", stages: [...seed] },
  { name: "Morningstar Ventures", website: "https://www.morningstar.ventures/", stages: [...seed] },
  { name: "Dale Ventures", website: "https://daleventures.co/", stages: [...seed, ...seriesA, ...seriesB, ...growth] },
  { name: "Vision Ventures", website: "https://visionventures.com.sa/", stages: [...seed, ...seriesA] },
  { name: "STC Ventures", website: "https://stcventures.com/", stages: [...seed, ...seriesA, ...seriesB, ...growth], categories: ["corporate_vc"] },
  { name: "Dubai Future District Fund", website: "https://dfdf.vc/", stages: [...seed, ...seriesA, ...seriesB], categories: ["vc_firm", "government_agency"] },
  { name: "Shorooq Partners", canonicalName: "Shorooq", website: "https://www.shorooq.com/", stages: [...seed, ...seriesA] },
  { name: "Dubai Silicon Oasis", website: "https://www.dso.ae/", stages: [...seed, ...seriesA], categories: ["government_agency", "incubator", "corporate_vc"], physicalDubaiFacility: true },
  { name: "Empede Capital", website: "https://empedecapital.com/", stages: [...seed, ...seriesA] },
  { name: "Village Capital", website: "https://vilcap.com/", stages: [...seed], categories: ["vc_firm", "accelerator", "impact_investor"] },
  { name: "Vy Capital", website: "https://vycapital.com/", stages: [...seed, ...seriesA, ...seriesB] },
  { name: "Mindshift Capital", website: "https://mindshiftcapital.com/", stages: [...seriesA] },
  { name: "Arzan Venture Capital", website: "https://arzanvc.com/", stages: [...seriesA, ...seriesB] },
  { name: "Iliad Partners", website: "https://iliadpartners.com/", stages: [...seriesA, ...seriesB] },
  { name: "Turmeric Capital", website: "https://turmericcapital.com/", stages: [...seriesA, ...seriesB] },
  { name: "Woodstock", canonicalName: "Woodstock Fund", website: "https://woodstockfund.com/", stages: [...seriesA, ...seriesB] },
  { name: "Silicon Badia", website: "https://siliconbadia.com/", stages: [...seriesA] },
  { name: "DIFC FinTech Hive", canonicalName: "DIFC Innovation Hub", website: "https://www.innovationhub.difc.ae/", stages: [...seriesA, ...seriesB], categories: ["government_agency", "incubator", "accelerator"], physicalDubaiFacility: true },
  { name: "Phoenix CryptoVC", website: "https://phoenixcrypto.vc/", stages: [...seriesA] },
  { name: "Knuru", website: "https://knuru.com/", stages: [...seriesA, ...seriesB, ...growth], categories: ["family_office", "vc_firm"] },
  { name: "AB Invest", canonicalName: "Al Arabi Investment Group", website: "https://abinvest.ae/", stages: [...seriesA, ...seriesB] },
  { name: "MBC Ventures", website: "https://mbcventures.com/", stages: [...seriesA], categories: ["corporate_vc"] },
];

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function comparableName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function websiteHost(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

async function reachable(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "Startup Atlas guide verification/1.0" },
    });
    await response.body?.cancel();
    return response.status < 500 && ![404, 410].includes(response.status);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function makeSeed(item: MatrixSeed): EcosystemOrganization {
  const name = item.canonicalName ?? item.name;
  const id = slugify(name);
  const categories = item.categories ?? ["vc_firm"];
  return {
    id,
    kind: "organization",
    name,
    aliases: name === item.name ? [] : [item.name],
    categories,
    description: `${name} is listed in Dubai Chamber Digital Economy's founder funding matrix and maintains a current official operating website for startup investment or support across the published ${item.stages.join(", ")} stages.`,
    status: "active",
    publicationState: "published",
    website: item.website,
    logoUrl: `https://www.google.com/s2/favicons?domain=${websiteHost(item.website)}&sz=128`,
    serviceMarkets: [
      { marketCode: "AE-DU", serviceMode: item.physicalDubaiFacility ? "hybrid" : "remote" },
    ],
    sectors: [],
    stages: item.stages,
    supportCapabilities: categories.some((category) =>
      ["incubator", "accelerator", "venture_studio"].includes(category)
    )
      ? ["seed_funding", "mentorship", "market_access", "investor_access"]
      : ["seed_funding", "investor_access"],
    applicationUrl: item.website,
    affiliations: ["Dubai Chamber Digital Economy funding ecosystem"],
    registrations: [],
    managedVehicles: [],
    locations: item.physicalDubaiFacility
      ? [
          {
            id: `${id}-dubai-guide`,
            role: "incubation_facility",
            label: `${name} — Dubai`,
            address: null,
            city: "Dubai",
            district: null,
            state: "Dubai",
            postalCode: null,
            marketCode: "AE-DU",
            countryCode: "AE",
            coordinates: { lat: 25.2048, lng: 55.2708 },
            precision: "city",
            evidenceUrl: GUIDE_URL,
            verifiedAt: CHECKED_AT,
          },
        ]
      : [],
    evidence: [
      {
        url: GUIDE_URL,
        title: "The Entrepreneur's Guide 2023 — Dubai's Funding Ecosystem: Investors",
        publisher: "Dubai Chamber Digital Economy",
        sourceClass: "official_announcement",
        checkedAt: CHECKED_AT,
        supports: ["Dubai startup relevance", "published investment stages", "capital-provider identity"],
      },
      {
        url: item.website,
        title: `${name} — official website`,
        publisher: name,
        sourceClass: "official_website",
        checkedAt: CHECKED_AT,
        supports: ["reachable official website", "current public founder or contact path"],
      },
    ],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  };
}

function merge(target: EcosystemOrganization, seed: EcosystemOrganization) {
  const evidence = [...(target.evidence ?? []), ...seed.evidence];
  const hasDubaiLocation = target.locations.some((item) => item.marketCode === "AE-DU");
  return {
    ...target,
    aliases: unique([...(target.aliases ?? []), ...seed.aliases]),
    categories: unique([...(target.categories ?? []), ...seed.categories]),
    serviceMarkets: target.serviceMarkets.some((market) => market.marketCode === "AE-DU")
      ? target.serviceMarkets
      : [...target.serviceMarkets, ...seed.serviceMarkets],
    stages: unique([...(target.stages ?? []), ...seed.stages]),
    supportCapabilities: unique([
      ...(target.supportCapabilities ?? []),
      ...seed.supportCapabilities,
    ]),
    affiliations: unique([...(target.affiliations ?? []), ...seed.affiliations]),
    locations: hasDubaiLocation ? target.locations : [...target.locations, ...seed.locations],
    evidence: unique(evidence.map((item) => item.url)).map(
      (url) => evidence.find((item) => item.url === url)!
    ),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt:
      target.nextReviewAt < NEXT_REVIEW_AT ? target.nextReviewAt : NEXT_REVIEW_AT,
  } satisfies EcosystemOrganization;
}

async function main() {
  const checks: Array<{ item: MatrixSeed; reachable: boolean }> = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (cursor < matrix.length) {
        const item = matrix[cursor++];
        checks.push({ item, reachable: await reachable(item.website) });
      }
    })
  );
  const included = checks.filter((check) => check.reachable);

  const organizations = JSON.parse(
    readFileSync(organizationsPath, "utf8")
  ) as EcosystemOrganization[];
  const initialCount = organizations.length;
  const names = new Map<string, number>();
  const hosts = new Map<string, number>();
  organizations.forEach((organization, index) => {
    names.set(comparableName(organization.name), index);
    for (const alias of organization.aliases ?? []) names.set(comparableName(alias), index);
    const host = websiteHost(organization.website);
    if (host) hosts.set(host, index);
  });

  let mergedCount = 0;
  for (const { item } of included) {
    const seed = makeSeed(item);
    const index =
      hosts.get(websiteHost(seed.website)!) ?? names.get(comparableName(seed.name));
    if (index !== undefined) {
      organizations[index] = merge(organizations[index], seed);
      mergedCount += 1;
      continue;
    }
    organizations.push(seed);
    const newIndex = organizations.length - 1;
    names.set(comparableName(seed.name), newIndex);
    hosts.set(websiteHost(seed.website)!, newIndex);
  }

  organizations.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        discovered: matrix.length + excludedMatrixEntries.length,
        included: included.length,
        excluded:
          excludedMatrixEntries.length + matrix.length - included.length,
        merged: mergedCount,
        createdOrganizations: organizations.length - initialCount,
        siteCheckFailures: checks
          .filter((check) => !check.reachable)
          .map((check) => check.item.name),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
