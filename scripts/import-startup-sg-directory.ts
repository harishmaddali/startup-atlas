import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type {
  EcosystemOrganization,
  OrganizationCategory,
  StartupStage,
  SupportCapability,
} from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const API_ROOT = "https://www.startupsg.gov.sg/api/v0";
const DIRECTORY_ROOT = "https://www.startupsg.gov.sg/profiles";
const organizationsPath = resolve(
  process.cwd(),
  "src/data/ecosystem/organizations.json"
);

type DirectoryTerm = { id?: string; name?: string };
type DirectoryProfile = {
  id: string;
  profileType: "venture_capital" | "multiplier" | "individual";
  displayName: string;
  registeredName?: string | null;
  descriptor?: string | null;
  description?: string | null;
  website?: { url?: string | null } | null;
  yearEstablishedComputed?: number | null;
  address?: { country?: string | null; isPublic?: boolean | null } | null;
  otherProfiles?: Array<{ type?: string | null }>;
  ventureCapitalType?: DirectoryTerm[];
  incubatorType?: DirectoryTerm[];
  incubationModel?: DirectoryTerm[];
  stageFocus?: DirectoryTerm[] | null;
  sectorFocus?: DirectoryTerm[] | null;
  tags?: DirectoryTerm[];
  adminTags?: DirectoryTerm[];
  hasProgram?: boolean | null;
  isInactive?: boolean | null;
};

type DirectoryResponse = { total: number; data: DirectoryProfile[] };

function tidy(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
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
    .replace(/\b(pte\.? ltd\.?|private limited|limited|ltd\.?|llp|llc|inc\.?)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWebsite(value: string | null | undefined) {
  const raw = tidy(value);
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (
      [
        "facebook.com",
        "instagram.com",
        "linkedin.com",
        "twitter.com",
        "x.com",
      ].some((domain) => host === domain || host.endsWith(`.${domain}`))
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function websiteHost(value: string | null | undefined) {
  const website = normalizeWebsite(value);
  return website ? new URL(website).hostname.replace(/^www\./, "").toLowerCase() : null;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function mapStages(terms: DirectoryTerm[] | null | undefined): StartupStage[] {
  const result: StartupStage[] = [];
  for (const term of terms ?? []) {
    const name = tidy(term.name).toLowerCase();
    if (name.includes("pre-seed") || name.includes("pre seed")) result.push("pre_seed");
    else if (name === "seed") result.push("seed");
    else if (name.includes("pre-series a") || name.includes("series a")) result.push("series_a");
    else if (name.includes("series b") || name.includes("series c")) result.push("series_b_plus");
    else if (name.includes("growth") || name.includes("late")) result.push("growth");
  }
  return unique(result);
}

function sectors(profile: DirectoryProfile) {
  return unique(
    [...(profile.sectorFocus ?? []), ...(profile.tags ?? []), ...(profile.adminTags ?? [])]
      .map((term) => tidy(term.name).toLowerCase())
      .filter((term) => term.length >= 2)
  ).slice(0, 20);
}

function investorCategories(profile: DirectoryProfile): OrganizationCategory[] {
  const types = (profile.ventureCapitalType ?? []).map((term) =>
    tidy(term.name).toLowerCase()
  );
  const result: OrganizationCategory[] = [];
  if (types.some((type) => type.includes("corporate"))) result.push("corporate_vc");
  if (types.some((type) => type.includes("family"))) result.push("family_office");
  if (types.some((type) => type === "vc" || type.includes("government") || type.includes("ihl"))) {
    result.push("vc_firm");
  }
  return result.length > 0 ? unique(result) : ["vc_firm"];
}

function supportCategories(profile: DirectoryProfile): OrganizationCategory[] {
  const types = (profile.incubatorType ?? []).map((term) =>
    tidy(term.name).toLowerCase()
  );
  const model = (profile.incubationModel ?? [])
    .map((term) => tidy(term.name).toLowerCase())
    .join(" ");
  const description = `${profile.displayName} ${profile.descriptor ?? ""} ${
    profile.description ?? ""
  }`.toLowerCase();
  const result: OrganizationCategory[] = ["accelerator"];
  if (description.includes("incubat")) result.push("incubator");
  if (description.includes("venture studio")) result.push("venture_studio");
  if (types.some((type) => type.includes("higher learning"))) {
    result.push("university_center");
  }
  if (
    profile.otherProfiles?.some((item) => item.type === "venture_capital") ||
    types.some((type) => type.includes("vc-backed"))
  ) {
    result.push("vc_firm");
  }
  if (model.includes("corporate-driven")) result.push("corporate_vc");
  return unique(result);
}

function supportCapabilities(profile: DirectoryProfile): SupportCapability[] {
  const model = (profile.incubationModel ?? [])
    .map((term) => tidy(term.name).toLowerCase())
    .join(" ");
  const result: SupportCapability[] = ["mentorship", "market_access", "investor_access"];
  if (model.includes("corporate-driven")) result.push("corporate_pilots");
  return unique(result);
}

async function fetchDirectory(kind: "investor" | "multiplier") {
  const records: DirectoryProfile[] = [];
  let total = Number.POSITIVE_INFINITY;
  for (let from = 0; from < total; from += 100) {
    const response = await fetch(
      `${API_ROOT}/search/profiles/${kind}?type=listing&from=${from}&size=100&inactive[]=0`
    );
    if (!response.ok) throw new Error(`${kind} directory returned ${response.status}`);
    const page = (await response.json()) as DirectoryResponse;
    total = page.total;
    records.push(...page.data);
  }
  return records;
}

async function websiteIsReachable(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {
      method: "GET",
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

async function reachableProfiles(profiles: DirectoryProfile[]) {
  const output: DirectoryProfile[] = [];
  let cursor = 0;
  const workers = Array.from({ length: 16 }, async () => {
    while (cursor < profiles.length) {
      const profile = profiles[cursor++];
      const website = normalizeWebsite(profile.website?.url);
      if (website && (await websiteIsReachable(website))) output.push(profile);
    }
  });
  await Promise.all(workers);
  return output;
}

function profileDescription(profile: DirectoryProfile, label: string) {
  const description = tidy(profile.description) || tidy(profile.descriptor);
  if (description.length >= 20) return description.slice(0, 900);
  return `${profile.displayName} is listed by Startup SG as an active ${label} with a public Singapore profile and current official website.`;
}

function makeSeed(
  profile: DirectoryProfile,
  category: "investor" | "support"
): EcosystemOrganization {
  const website = normalizeWebsite(profile.website?.url)!;
  const id = slugify(profile.displayName) || `startup-sg-${profile.id}`;
  const directoryUrl = `${DIRECTORY_ROOT}/${profile.id}`;
  const categories =
    category === "investor" ? investorCategories(profile) : supportCategories(profile);
  const aliases = unique(
    [tidy(profile.registeredName)].filter(
      (name) => name && comparableName(name) !== comparableName(profile.displayName)
    )
  );
  return {
    id,
    kind: "organization",
    name: tidy(profile.displayName),
    aliases,
    categories,
    description: profileDescription(
      profile,
      category === "investor" ? "startup investor" : "accelerator or incubator"
    ),
    status: "active",
    publicationState: "published",
    website,
    logoUrl: `https://www.google.com/s2/favicons?domain=${websiteHost(website)}&sz=128`,
    foundedYear:
      profile.yearEstablishedComputed && profile.yearEstablishedComputed >= 1900
        ? profile.yearEstablishedComputed
        : undefined,
    serviceMarkets: [{ marketCode: "SG", serviceMode: "hybrid" }],
    sectors: sectors(profile),
    stages: mapStages(profile.stageFocus),
    supportCapabilities:
      category === "support"
        ? supportCapabilities(profile)
        : ["seed_funding", "investor_access", "market_access"],
    investmentThesis:
      category === "investor" ? profileDescription(profile, "startup investor") : undefined,
    investmentPreference: category === "investor" ? "both" : undefined,
    portfolioUrl: category === "investor" ? website : undefined,
    applicationUrl: website,
    affiliations: ["Startup SG Network"],
    registrations: [],
    managedVehicles: [],
    locations: [
      {
        id: `${id}-singapore-startup-sg`,
        role: "office",
        label: `${tidy(profile.displayName)} — Singapore`,
        address: null,
        city: "Singapore",
        district: null,
        state: "Singapore",
        postalCode: null,
        marketCode: "SG",
        countryCode: "SG",
        coordinates: { lat: 1.3521, lng: 103.8198 },
        precision: "city",
        evidenceUrl: directoryUrl,
        verifiedAt: CHECKED_AT,
      },
    ],
    evidence: [
      {
        url: directoryUrl,
        title: `${tidy(profile.displayName)} — Startup SG Network profile`,
        publisher: "Startup SG / Enterprise Singapore",
        sourceClass: "government_registry",
        checkedAt: CHECKED_AT,
        supports: [
          "current directory listing",
          "organization type",
          "public professional Singapore presence",
          "official website",
        ],
      },
      {
        url: website,
        title: `${tidy(profile.displayName)} — official website`,
        publisher: tidy(profile.displayName),
        sourceClass: "official_website",
        checkedAt: CHECKED_AT,
        supports: ["reachable official website", "current public contact path"],
      },
    ],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  };
}

function mergeSeed(
  target: EcosystemOrganization,
  seed: EcosystemOrganization
): EcosystemOrganization {
  const hasSingaporeLocation = target.locations.some(
    (location) => location.marketCode === "SG"
  );
  return {
    ...target,
    aliases: unique([...(target.aliases ?? []), ...seed.aliases]),
    categories: unique([...(target.categories ?? []), ...seed.categories]),
    serviceMarkets: target.serviceMarkets.some((market) => market.marketCode === "SG")
      ? target.serviceMarkets
      : [...target.serviceMarkets, ...seed.serviceMarkets],
    sectors: unique([...(target.sectors ?? []), ...seed.sectors]),
    stages: unique([...(target.stages ?? []), ...seed.stages]),
    supportCapabilities: unique([
      ...(target.supportCapabilities ?? []),
      ...seed.supportCapabilities,
    ]),
    affiliations: unique([...(target.affiliations ?? []), ...seed.affiliations]),
    locations: hasSingaporeLocation
      ? target.locations
      : [...target.locations, ...seed.locations],
    evidence: unique([...target.evidence, ...seed.evidence].map((item) => item.url)).map(
      (url) => [...target.evidence, ...seed.evidence].find((item) => item.url === url)!
    ),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt:
      target.nextReviewAt < NEXT_REVIEW_AT ? target.nextReviewAt : NEXT_REVIEW_AT,
  };
}

async function main() {
const [investorDirectory, multiplierDirectory] = await Promise.all([
  fetchDirectory("investor"),
  fetchDirectory("multiplier"),
]);

const investorCandidates = investorDirectory.filter((profile) => {
  if (profile.profileType !== "venture_capital" || profile.isInactive) return false;
  if (!normalizeWebsite(profile.website?.url) || !profile.address?.isPublic) return false;
  const types = (profile.ventureCapitalType ?? []).map((term) =>
    tidy(term.name).toLowerCase()
  );
  return !(
    types.length > 0 &&
    types.every((type) => type === "pe" || type.includes("crowdfunding"))
  );
});
const supportCandidates = multiplierDirectory.filter(
  (profile) =>
    profile.profileType === "multiplier" &&
    !profile.isInactive &&
    profile.hasProgram === true &&
    profile.address?.isPublic === true &&
    Boolean(normalizeWebsite(profile.website?.url))
);

const [reachableInvestors, reachableSupport] = await Promise.all([
  reachableProfiles(investorCandidates),
  reachableProfiles(supportCandidates),
]);

const organizations = JSON.parse(
  readFileSync(organizationsPath, "utf8")
) as EcosystemOrganization[];
const initialCount = organizations.length;
const names = new Map<string, number>();
const hosts = new Map<string, number>();
organizations.forEach((organization, index) => {
  names.set(comparableName(organization.name), index);
  for (const alias of organization.aliases) names.set(comparableName(alias), index);
  const host = websiteHost(organization.website);
  if (host) hosts.set(host, index);
});

let merged = 0;
for (const [profile, category] of [
  ...reachableInvestors.map((profile) => [profile, "investor"] as const),
  ...reachableSupport.map((profile) => [profile, "support"] as const),
]) {
  const seed = makeSeed(profile, category);
  const matchedIndex =
    names.get(comparableName(seed.name)) ?? hosts.get(websiteHost(seed.website)!);
  if (matchedIndex !== undefined) {
    organizations[matchedIndex] = mergeSeed(organizations[matchedIndex], seed);
    merged += 1;
    continue;
  }
  let id = seed.id;
  if (organizations.some((organization) => organization.id === id)) {
    id = `${id}-startup-sg-${profile.id}`;
    seed.id = id;
    seed.locations[0] = {
      ...seed.locations[0],
      id: `${id}-singapore-startup-sg`,
    };
  }
  organizations.push(seed);
  const index = organizations.length - 1;
  names.set(comparableName(seed.name), index);
  hosts.set(websiteHost(seed.website)!, index);
}

organizations.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      directory: {
        organizationInvestors: investorDirectory.filter(
          (profile) => profile.profileType === "venture_capital"
        ).length,
        individualInvestorProfiles: investorDirectory.filter(
          (profile) => profile.profileType === "individual"
        ).length,
        multipliers: multiplierDirectory.length,
      },
      included: {
        investors: reachableInvestors.length,
        support: reachableSupport.length,
        merged,
        createdOrganizations: organizations.length - initialCount,
      },
      excluded: {
        investors:
          investorDirectory.filter((profile) => profile.profileType === "venture_capital")
            .length - reachableInvestors.length,
        individualInvestorProfiles: investorDirectory.filter(
          (profile) => profile.profileType === "individual"
        ).length,
        multipliers: multiplierDirectory.length - reachableSupport.length,
      },
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
