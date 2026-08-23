import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { JSDOM } from "jsdom";

import type {
  EcosystemOrganization,
  OrganizationCategory,
  StartupStage,
  SupportCapability,
} from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const DIRECTORY_URL = "https://www.nzgcp.co.nz/start-up-resources/start-up-investors";
const organizationsPath = resolve(
  process.cwd(),
  "src/data/ecosystem/organizations.json"
);

type DirectoryCard = {
  category: string;
  name: string;
  description: string;
  url: string;
};

const excludedNames = new Set([
  "Direct Capital",
  "K1W1",
  "Migrant Investors and Entrepreneurs",
]);

const canonicalNames: Record<string, string> = {
  "AANZ: Investor Resources": "Angel Association New Zealand",
  "Angel Association New Zealand members": "Angel Association New Zealand",
  "Blackbird Ventures": "Blackbird",
  "Callaghan Innovation Founder Incubator": "Callaghan Innovation",
  "Callaghan Innovation Technology Incubator": "Callaghan Innovation",
  "Creative HQ: The Incubator": "Creative HQ",
  "Finistere Aotearoa Fund": "Finistere Ventures",
  "Global from Day One (GD1)": "GD1",
  "NZGCP Elevate fund": "New Zealand Growth Capital Partners",
  "NZTE: Live deals": "New Zealand Trade and Enterprise",
  "Startup Dunedin: The Distiller Incubator": "Startup Dunedin",
  "UniServices (University of Auckland)": "Auckland UniServices",
};

const canonicalWebsites: Record<string, string> = {
  "NZGCP Elevate fund": "https://www.nzgcp.co.nz/elevate-nz-venture-fund",
};

function tidy(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

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
  return value
    .toLowerCase()
    .replace(/\b(limited|ltd\.?|llp|llc|inc\.?)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWebsite(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function websiteHost(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function stages(description: string): StartupStage[] {
  const value = description.toLowerCase();
  const result: StartupStage[] = [];
  if (value.includes("pre-seed") || value.includes("pre seed")) result.push("pre_seed");
  if (value.includes("seed")) result.push("seed");
  if (value.includes("series a")) result.push("series_a");
  if (value.includes("series b") || value.includes("expansion")) {
    result.push("series_b_plus");
  }
  if (value.includes("growth") || value.includes("pre-ipo")) result.push("growth");
  return unique(result);
}

function categories(card: DirectoryCard): OrganizationCategory[] {
  const description = card.description.toLowerCase();
  if (card.name.includes("Angel Association")) return ["angel_network"];
  if (card.category === "Tech Incubator Investor") {
    const result: OrganizationCategory[] = ["incubator", "accelerator"];
    if (card.name.startsWith("Callaghan")) result.push("government_agency");
    if (card.name.includes("UniServices")) result.push("university_center");
    return result;
  }
  if (card.category.includes("Support")) return ["government_agency", "accelerator"];
  const result: OrganizationCategory[] = ["vc_firm"];
  if (description.includes("impact") || description.includes("social") || description.includes("environment")) {
    result.push("impact_investor");
  }
  if (card.name.includes("UniServices")) result.push("university_center");
  return result;
}

function capabilities(card: DirectoryCard): SupportCapability[] {
  if (card.category === "Early-stage Venture Capital Investor") {
    return ["seed_funding", "investor_access"];
  }
  return ["mentorship", "market_access", "investor_access"];
}

async function reachable(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "Startup Atlas directory verification/1.0" },
    });
    await response.body?.cancel();
    return response.status < 500 && ![404, 410].includes(response.status);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function makeSeed(card: DirectoryCard): EcosystemOrganization {
  const name = canonicalNames[card.name] ?? card.name;
  const website = canonicalWebsites[card.name] ?? card.url;
  const id = slugify(name);
  const isInvestor = card.category === "Early-stage Venture Capital Investor";
  return {
    id,
    kind: "organization",
    name,
    aliases: name === card.name ? [] : [card.name],
    categories: categories(card),
    description: card.description,
    status: "active",
    publicationState: "published",
    website,
    logoUrl: `https://www.google.com/s2/favicons?domain=${websiteHost(website)}&sz=128`,
    serviceMarkets: [{ marketCode: "NZ", serviceMode: "remote" }],
    sectors: [],
    stages: stages(card.description),
    supportCapabilities: capabilities(card),
    investmentThesis: isInvestor ? card.description : undefined,
    investmentPreference: isInvestor ? "both" : undefined,
    portfolioUrl: isInvestor ? website : undefined,
    applicationUrl: website,
    affiliations: ["NZGCP startup-investor directory"],
    registrations: [],
    managedVehicles: [],
    locations: [],
    evidence: [
      {
        url: DIRECTORY_URL,
        title: "Start-up Investors",
        publisher: "New Zealand Growth Capital Partners",
        sourceClass: "government_registry",
        checkedAt: CHECKED_AT,
        supports: ["current directory category", "startup focus", "official website"],
      },
      {
        url: website,
        title: `${name} — official website`,
        publisher: name,
        sourceClass: "official_website",
        checkedAt: CHECKED_AT,
        supports: ["reachable official website", "current public contact path"],
      },
    ],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  };
}

function merge(target: EcosystemOrganization, seed: EcosystemOrganization) {
  const evidence = [...(target.evidence ?? []), ...seed.evidence];
  return {
    ...target,
    aliases: unique([...(target.aliases ?? []), ...seed.aliases]),
    categories: unique([...(target.categories ?? []), ...seed.categories]),
    serviceMarkets: target.serviceMarkets.some((market) => market.marketCode === "NZ")
      ? target.serviceMarkets
      : [...target.serviceMarkets, ...seed.serviceMarkets],
    stages: unique([...(target.stages ?? []), ...seed.stages]),
    supportCapabilities: unique([
      ...(target.supportCapabilities ?? []),
      ...seed.supportCapabilities,
    ]),
    affiliations: unique([...(target.affiliations ?? []), ...seed.affiliations]),
    evidence: unique(evidence.map((item) => item.url)).map(
      (url) => evidence.find((item) => item.url === url)!
    ),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt:
      target.nextReviewAt < NEXT_REVIEW_AT ? target.nextReviewAt : NEXT_REVIEW_AT,
  } satisfies EcosystemOrganization;
}

async function main() {
  const response = await fetch(DIRECTORY_URL);
  if (!response.ok) throw new Error(`NZGCP directory returned ${response.status}`);
  const document = new JSDOM(await response.text()).window.document;
  const cards = [...document.querySelectorAll<HTMLElement>(".card.h-100")].map(
    (card): DirectoryCard => ({
      category: tidy(card.querySelector("span")?.textContent),
      name: tidy(card.querySelector("h4")?.textContent),
      description: tidy(card.querySelector("p")?.textContent),
      url: tidy(card.querySelector("a")?.getAttribute("href")),
    })
  );

  const candidates = cards
    .filter((card) => !excludedNames.has(card.name))
    .map((card) => ({
      ...card,
      url: canonicalWebsites[card.name] ?? card.url,
    }))
    .filter((card) => Boolean(normalizeWebsite(card.url)));

  const siteChecks = new Map<string, boolean>();
  await Promise.all(
    unique(candidates.map((card) => card.url)).map(async (url) => {
      siteChecks.set(url, await reachable(url));
    })
  );
  const included = candidates.filter((card) => siteChecks.get(card.url));

  const organizations = JSON.parse(
    readFileSync(organizationsPath, "utf8")
  ) as EcosystemOrganization[];
  const initialCount = organizations.length;
  const names = new Map<string, number>();
  const hosts = new Map<string, number>();
  organizations.forEach((organization, index) => {
    names.set(comparableName(organization.name), index);
    for (const alias of organization.aliases ?? []) {
      names.set(comparableName(alias), index);
    }
    const host = websiteHost(organization.website);
    if (host) hosts.set(host, index);
  });

  let mergedCount = 0;
  for (const card of included) {
    const seed = makeSeed(card);
    const index =
      names.get(comparableName(seed.name)) ?? hosts.get(websiteHost(seed.website)!);
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
        discovered: cards.length,
        included: included.length,
        excluded: cards.length - included.length,
        merged: mergedCount,
        createdOrganizations: organizations.length - initialCount,
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
