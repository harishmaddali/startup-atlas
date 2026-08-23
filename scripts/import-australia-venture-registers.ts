import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { JSDOM } from "jsdom";

import type {
  EcosystemOrganization,
  StartupStage,
} from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const ESVCLP_URL =
  "https://business.gov.au/grants-and-programs/early-stage-venture-capital-limited-partnerships/list-of-early-stage-venture-capital-limited-partnerships";
const VCLP_URL =
  "https://business.gov.au/Grants-and-Programs/Venture-Capital-Limited-Partnerships/List-of-Venture-Capital-Partnerships";
const AFOF_URL =
  "https://business.gov.au/grants-and-programs/australian-venture-capital-fund-of-funds/list-of-australian-venture-capital-fund-of-funds";
const organizationsPath = resolve(
  process.cwd(),
  "src/data/ecosystem/organizations.json"
);

type RegisterKind = "esvclp" | "vclp" | "afof";
type RegisterRow = {
  kind: RegisterKind;
  sourceUrl: string;
  registered: boolean;
  vehicle: string;
  registrationNumber: string;
  manager: string;
  emailDomain: string | null;
  target: string;
  contact: string;
  eligibleDirect: boolean;
};

type WebsiteCheck = { url: string; title: string | null };

const canonicalNamesByHost: Record<string, string> = {
  "acorncapital.com.au": "Acorn Capital",
  "adamantem.com.au": "Adamantem Capital",
  "archangel.vc": "Archangel Ventures",
  "armitage.com.au": "Armitage Associates",
  "aufund.com.au": "Australia Venture Capital",
  "beatenzone.vc": "Beaten Zone Venture Partners",
  "billfolda.vc": "Billfolda Ventures",
  "bondipartners.com": "Bondi Partners",
  "carthonacapital.com": "Carthona Capital",
  "centerstone.capital": "Centerstone Capital",
  "cloudtechgroup.com.au": "Consensus Ventures",
  "coact.vc": "Co:Act Capital",
  "cpecapital.com": "CPE Capital",
  "crescentcap.com.au": "Crescent Capital Partners",
  "edisongrowthfund.com.au": "Edison Growth Fund",
  "futurefamilyoffice.com": "Constant Innovation",
  "futurenowcapital.com": "Future Now Capital",
  "happenco.com": "Happenco",
  "ipgroupplc.com": "IP Group Australia",
  "investible.com.au": "Investible",
  "kingriver.co": "King River Capital",
  "mseq.vc": "Main Sequence",
  "one-ventures.com.au": "OneVentures",
  "one-ventures.com": "OneVentures",
  "parccapital.com.au": "Parc Capital",
  "phillipcapital.com.au": "Bioscience Managers",
  "reinventure.com.au": "Reinventure",
  "rightclickcapital.com": "Right Click Capital",
  "rocp.com": "ROC Partners",
  "rydercapital.com.au": "Ryder Capital",
  "ramgroup.com": "RAM Group",
  "salus.vc": "Salus Ventures",
  "sapiengroup.co": "Sapien Ventures",
  "springcapital.com.au": "SpringCapital",
  "squarepeg.vc": "Square Peg",
  "stbcapitalpartners.com.au": "StB Capital Partners",
  "tanarra.com": "Tanarra Capital",
  "tarongagroup.com": "Taronga Ventures",
  "thepharm.bio": "SYNthesis BioVentures",
  "tidalvc.com": "Tidal Ventures",
  "leovian.com.au": "Leovian",
  "blacknova.vc": "Black Nova Venture Capital",
  "potentiacap.com": "Potentia Capital",
  "whiteoak.com": "Whiteoak",
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
    .replace(
      /\b(pty\.? ltd\.?|proprietary limited|limited|ltd\.?|management partnership|general partner|vcmp|i\.?l\.?p\.?|l\.?p\.?)\b/g,
      ""
    )
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function websiteHost(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function contactLines(cell: Element) {
  const fragment = cell.innerHTML
    .split(/<br\s*\/?\s*>/i)
    .map((line) => tidy(new JSDOM(`<body>${line}</body>`).window.document.body.textContent))
    .filter(Boolean);
  return fragment;
}

function managerFromContact(lines: string[], vehicle: string) {
  const emailIndex = lines.findIndex((line) => /@/.test(line));
  if (emailIndex > 0) return lines[emailIndex - 1];
  return lines[1] ?? lines[0] ?? vehicle;
}

function emailDomain(lines: string[]) {
  const match = lines.join(" ").match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i);
  if (!match) return null;
  const host = match[1].toLowerCase().replace(/^www\./, "");
  if (
    ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "bigpond.com"].includes(
      host
    )
  ) {
    return null;
  }
  return host;
}

function startupFocusedVclp(target: string) {
  const value = target.toLowerCase();
  const earlySignal =
    /startup|start-up|early[ -]stage|seed|series a|venture|technology|tech-enabled|software|life science|biotech|healthtech|climate tech|innovation/.test(
      value
    );
  const privateEquityOnly =
    /private equity|management buyout|buy-out|buyout|established businesses|mature businesses|mid-market transactions/.test(
      value
    ) && !/startup|start-up|early[ -]stage|seed|series a/.test(value);
  return earlySignal && !privateEquityOnly;
}

function parseRegister(html: string, kind: RegisterKind, sourceUrl: string) {
  const document = new JSDOM(html).window.document;
  const result: RegisterRow[] = [];
  [...document.querySelectorAll("table")].forEach((table, tableIndex) => {
    const registered = tableIndex === 0;
    for (const row of [...table.querySelectorAll("tbody tr")]) {
      const cells = [...row.querySelectorAll("td")];
      if (cells.length < 4) continue;
      const partnership = tidy(cells[0].textContent);
      const registrationNumber =
        partnership.match(/\[([^\]]+)\]\s*$/)?.[1] ?? `unlisted-${slugify(partnership)}`;
      const vehicle = tidy(partnership.replace(/\s*\[[^\]]+\]\s*$/, ""));
      const lines = contactLines(cells[1]);
      const target = tidy(cells[2].textContent);
      result.push({
        kind,
        sourceUrl,
        registered,
        vehicle,
        registrationNumber,
        manager: managerFromContact(lines, vehicle),
        emailDomain: emailDomain(lines),
        target,
        contact: lines.join(" · "),
        eligibleDirect:
          registered &&
          (kind === "esvclp" || (kind === "vclp" && startupFocusedVclp(target))),
      });
    }
  });
  return result;
}

function cleanWebsiteTitle(raw: string) {
  const decoded = tidy(
    new JSDOM(`<title>${raw}</title>`).window.document.querySelector("title")?.textContent
  );
  const candidates = decoded
    .split(/\s+(?:[|–—-])\s+/)
    .map(tidy)
    .filter(
      (value) =>
        value.length >= 2 &&
        value.length <= 70 &&
        !/^(home|homepage|welcome|official site)$/i.test(value)
    );
  return candidates.sort((a, b) => a.length - b.length)[0] ?? null;
}

async function inspectWebsite(host: string): Promise<WebsiteCheck | null> {
  for (const protocol of ["https", "http"]) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(`${protocol}://${host}/`, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "Startup Atlas register verification/1.0" },
      });
      if (response.status >= 500 || [404, 410].includes(response.status)) continue;
      const reader = response.body?.getReader();
      let text = "";
      if (reader) {
        const decoder = new TextDecoder();
        while (text.length < 65_536) {
          const chunk = await reader.read();
          if (chunk.done) break;
          text += decoder.decode(chunk.value, { stream: true });
        }
        await reader.cancel();
      }
      const title = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
      const cleanedTitle = cleanWebsiteTitle(title);
      if (cleanedTitle && /for sale|domain (?:is )?parked/i.test(cleanedTitle)) {
        return null;
      }
      return {
        url: response.url || `${protocol}://${host}/`,
        title:
          cleanedTitle &&
          !/attention required|dns points|access denied|not found|making finance accessible/i.test(
            cleanedTitle
          )
            ? cleanedTitle
            : null,
      };
    } catch {
      // Try the other protocol.
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}

function cleanManagerName(value: string) {
  return tidy(
    value
      .replace(/,?\s+(Pty\.? Ltd\.?|Proprietary Limited|I\.?L\.?P\.?|L\.?P\.?)$/i, "")
      .replace(/\s+(Management Partnership|General Partner|VCMP)(?:\s.*)?$/i, "")
  );
}

function organizationName(rows: RegisterRow[], site: WebsiteCheck, host: string) {
  const canonicalName =
    canonicalNamesByHost[host.replace(/^www\./, "")] ??
    canonicalNamesByHost[websiteHost(site.url)?.replace(/^www\./, "") ?? ""];
  if (canonicalName) return canonicalName;
  const title = site.title;
  if (
    title &&
    !/venture capital (australia|fund)|investment manager|private equity|home page/i.test(title)
  ) {
    return title;
  }
  return rows
    .map((row) => cleanManagerName(row.manager))
    .filter((name) => name.length >= 2)
    .sort((a, b) => a.length - b.length)[0];
}

function stages(targets: string): StartupStage[] {
  const value = targets.toLowerCase();
  const result: StartupStage[] = [];
  if (/pre[ -]seed/.test(value)) result.push("pre_seed");
  if (/\bseed\b/.test(value)) result.push("seed");
  if (/series a|early expansion|early-stage|early stage/.test(value)) result.push("series_a");
  if (/series b|expansion|scale-up|scale up/.test(value)) result.push("series_b_plus");
  if (/growth|later stage|pre-ipo/.test(value)) result.push("growth");
  return unique(result);
}

function sectors(targets: string) {
  const value = targets.toLowerCase();
  const vocabulary = [
    "software",
    "artificial intelligence",
    "cybersecurity",
    "defence",
    "space",
    "healthcare",
    "life sciences",
    "biotechnology",
    "climate",
    "clean technology",
    "agriculture",
    "food",
    "fintech",
    "education",
    "consumer",
    "manufacturing",
  ];
  return vocabulary.filter((sector) => value.includes(sector));
}

const metroLocations = [
  { state: "NSW", min: 2000, max: 2234, city: "Sydney", lat: -33.8688, lng: 151.2093 },
  { state: "VIC", min: 3000, max: 3207, city: "Melbourne", lat: -37.8136, lng: 144.9631 },
  { state: "QLD", min: 4000, max: 4207, city: "Brisbane", lat: -27.4698, lng: 153.0251 },
  { state: "WA", min: 6000, max: 6199, city: "Perth", lat: -31.9523, lng: 115.8613 },
  { state: "SA", min: 5000, max: 5199, city: "Adelaide", lat: -34.9285, lng: 138.6007 },
  { state: "ACT", min: 2600, max: 2620, city: "Canberra", lat: -35.2809, lng: 149.13 },
  { state: "TAS", min: 7000, max: 7053, city: "Hobart", lat: -42.8821, lng: 147.3272 },
  { state: "NT", min: 800, max: 836, city: "Darwin", lat: -12.4634, lng: 130.8456 },
] as const;

function location(rows: RegisterRow[], id: string, name: string) {
  for (const row of rows) {
    const match = row.contact.match(/\b(NSW|VIC|QLD|WA|SA|ACT|TAS|NT)\s+(\d{4})\b/);
    if (!match) continue;
    const postcode = Number(match[2]);
    const metro = metroLocations.find(
      (item) => item.state === match[1] && postcode >= item.min && postcode <= item.max
    );
    if (!metro) continue;
    return [
      {
        id: `${id}-${metro.city.toLowerCase()}-register`,
        role: "office" as const,
        label: `${name} — ${metro.city} metro`,
        address: null,
        city: metro.city,
        district: null,
        state: metro.state,
        postalCode: match[2],
        marketCode: "AU" as const,
        countryCode: "AU",
        coordinates: { lat: metro.lat, lng: metro.lng },
        precision: "city" as const,
        evidenceUrl: row.sourceUrl,
        verifiedAt: CHECKED_AT,
      },
    ];
  }
  return [];
}

function makeSeed(
  rows: RegisterRow[],
  site: WebsiteCheck,
  host: string
): EcosystemOrganization {
  const name = organizationName(rows, site, host);
  const id = slugify(name);
  const targets = unique(rows.map((row) => row.target)).join(" ");
  const locations = location(rows, id, name);
  const sourceUrls = unique(rows.map((row) => row.sourceUrl));
  return {
    id,
    kind: "organization",
    name,
    aliases: unique(rows.map((row) => cleanManagerName(row.manager))).filter(
      (alias) => comparableName(alias) !== comparableName(name)
    ),
    categories: ["vc_firm"],
    description: `An Australian venture manager registered for startup or technology investment through Innovation and Science Australia. ${unique(
      rows.map((row) => row.target)
    )
      .join(" ")
      .slice(0, 800)}`,
    status: "active",
    publicationState: "published",
    website: site.url,
    logoUrl: `https://www.google.com/s2/favicons?domain=${websiteHost(site.url)}&sz=128`,
    serviceMarkets: [
      { marketCode: "AU", serviceMode: locations.length > 0 ? "hybrid" : "remote" },
    ],
    sectors: sectors(targets),
    stages: stages(targets),
    supportCapabilities: ["seed_funding", "investor_access"],
    investmentThesis: unique(rows.map((row) => row.target)).join(" ").slice(0, 900),
    investmentPreference: "both",
    portfolioUrl: site.url,
    applicationUrl: site.url,
    affiliations: ["Innovation and Science Australia venture-capital programs"],
    registrations: rows.map((row) => ({
      authority: "Innovation and Science Australia",
      registrationNumber: row.registrationNumber,
      vehicleName: row.vehicle,
    })),
    managedVehicles: unique(rows.map((row) => row.vehicle)),
    locations,
    evidence: [
      ...sourceUrls.map((url) => ({
        url,
        title:
          url === ESVCLP_URL
            ? "List of Early Stage Venture Capital Limited Partnerships"
            : url === VCLP_URL
              ? "List of Venture Capital Limited Partnerships"
              : "List of Australian Venture Capital Fund of Funds",
        publisher: "Australian Government — business.gov.au",
        sourceClass: "government_registry" as const,
        checkedAt: CHECKED_AT,
        supports: [
          "current registered fund vehicles",
          "operating manager",
          "target investment",
          "public professional office",
        ],
      })),
      {
        url: site.url,
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
    serviceMarkets: target.serviceMarkets.some((market) => market.marketCode === "AU")
      ? target.serviceMarkets
      : [...target.serviceMarkets, ...seed.serviceMarkets],
    sectors: unique([...(target.sectors ?? []), ...seed.sectors]),
    stages: unique([...(target.stages ?? []), ...seed.stages]),
    supportCapabilities: unique([
      ...(target.supportCapabilities ?? []),
      ...seed.supportCapabilities,
    ]),
    affiliations: unique([...(target.affiliations ?? []), ...seed.affiliations]),
    registrations: unique([
      ...(target.registrations ?? []).map((item) => JSON.stringify(item)),
      ...seed.registrations.map((item) => JSON.stringify(item)),
    ]).map((item) => JSON.parse(item)),
    managedVehicles: unique([...(target.managedVehicles ?? []), ...seed.managedVehicles]),
    locations: target.locations.some((item) => item.marketCode === "AU")
      ? target.locations
      : [...target.locations, ...seed.locations],
    evidence: unique(evidence.map((item) => item.url)).map(
      (url) => evidence.find((item) => item.url === url)!
    ),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt:
      target.nextReviewAt < NEXT_REVIEW_AT ? target.nextReviewAt : NEXT_REVIEW_AT,
  } satisfies EcosystemOrganization;
}

async function main() {
  const pages = await Promise.all(
    [ESVCLP_URL, VCLP_URL, AFOF_URL].map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${url} returned ${response.status}`);
      return response.text();
    })
  );
  const rows = [
    ...parseRegister(pages[0], "esvclp", ESVCLP_URL),
    ...parseRegister(pages[1], "vclp", VCLP_URL),
    ...parseRegister(pages[2], "afof", AFOF_URL),
  ];
  const directRows = rows.filter((row) => row.eligibleDirect && row.emailDomain);
  const directHosts = unique(directRows.map((row) => row.emailDomain!));
  const siteChecks = new Map<string, WebsiteCheck>();
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 16 }, async () => {
      while (cursor < directHosts.length) {
        const host = directHosts[cursor++];
        const site = await inspectWebsite(host);
        if (site) siteChecks.set(host, site);
      }
    })
  );
  const includedDirectHosts = new Set(siteChecks.keys());
  const includedRows = rows.filter(
    (row) =>
      row.registered &&
      row.emailDomain &&
      includedDirectHosts.has(row.emailDomain) &&
      (row.eligibleDirect || row.kind === "afof")
  );
  const grouped = new Map<string, RegisterRow[]>();
  for (const row of includedRows) {
    grouped.set(row.emailDomain!, [...(grouped.get(row.emailDomain!) ?? []), row]);
  }
  const validPublishedHosts = new Set([
    ...grouped.keys(),
    ...[...siteChecks.values()]
      .map((site) => websiteHost(site.url))
      .filter((host): host is string => Boolean(host)),
  ]);

  let organizations = JSON.parse(
    readFileSync(organizationsPath, "utf8")
  ) as EcosystemOrganization[];
  const registerAffiliation = "Innovation and Science Australia venture-capital programs";
  organizations = organizations.filter((organization) => {
    const imported = organization.affiliations?.includes(registerAffiliation);
    const australiaOnly =
      organization.serviceMarkets.length === 1 &&
      organization.serviceMarkets[0].marketCode === "AU";
    const host = websiteHost(organization.website);
    return !imported || !australiaOnly || Boolean(host && validPublishedHosts.has(host));
  });
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
  for (const [host, managerRows] of grouped) {
    const seed = makeSeed(managerRows, siteChecks.get(host)!, host);
    const index = hosts.get(host) ?? names.get(comparableName(seed.name));
    if (index !== undefined) {
      const previousName = organizations[index].name;
      organizations[index] = merge(organizations[index], seed);
      if (organizations[index].affiliations.includes(registerAffiliation)) {
        organizations[index].name = seed.name;
        if (previousName !== seed.name) {
          organizations[index].aliases = unique([
            ...organizations[index].aliases,
            previousName,
          ]);
        }
      }
      mergedCount += 1;
      continue;
    }
    let id = seed.id;
    if (organizations.some((organization) => organization.id === id)) {
      id = `${id}-australia`;
      seed.id = id;
      seed.locations = seed.locations.map((item) => ({
        ...item,
        id: item.id.replace(/^[^-]+/, id),
      }));
    }
    organizations.push(seed);
    const newIndex = organizations.length - 1;
    hosts.set(host, newIndex);
    names.set(comparableName(seed.name), newIndex);
  }

  for (const organization of organizations) {
    if (!organization.affiliations?.includes(registerAffiliation)) continue;
    const host = websiteHost(organization.website)?.replace(/^www\./, "") ?? "";
    const canonicalName = canonicalNamesByHost[host];
    if (!canonicalName || canonicalName === organization.name) continue;
    const previousName = organization.name;
    organization.name = canonicalName;
    organization.aliases = unique([...(organization.aliases ?? []), previousName]);
    organization.locations = organization.locations.map((item) => ({
      ...item,
      label: item.label.replace(previousName, canonicalName),
    }));
  }

  const deduplicated: EcosystemOrganization[] = [];
  const dedupeNameIndex = new Map<string, number>();
  const dedupeHostIndex = new Map<string, number>();
  for (const organization of organizations) {
    const nameKey = comparableName(organization.name);
    const hostKey = websiteHost(organization.website);
    const registerBacked = organization.affiliations?.includes(registerAffiliation);
    const existingIndex = registerBacked
      ? (hostKey ? dedupeHostIndex.get(hostKey) : undefined) ??
        dedupeNameIndex.get(nameKey)
      : undefined;
    if (existingIndex !== undefined && registerBacked) {
      deduplicated[existingIndex] = merge(deduplicated[existingIndex], organization);
      continue;
    }
    dedupeNameIndex.set(nameKey, deduplicated.length);
    if (hostKey) dedupeHostIndex.set(hostKey, deduplicated.length);
    deduplicated.push(organization);
  }
  organizations = deduplicated;

  organizations.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);

  const outcomes = Object.fromEntries(
    (["esvclp", "vclp", "afof"] as const).map((kind) => {
      const kindRows = rows.filter((row) => row.kind === kind);
      const included = kindRows.filter((row) => includedRows.includes(row)).length;
      return [kind, { discovered: kindRows.length, included, excluded: kindRows.length - included }];
    })
  );
  console.log(
    JSON.stringify(
      {
        outcomes,
        includedManagers: grouped.size,
        mergedManagers: mergedCount,
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
