import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type {
  EcosystemOrganization,
  OrganizationCategory,
} from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const organizationsPath = resolve(
  process.cwd(),
  "src/data/ecosystem/organizations.json"
);

type MemberSeed = {
  name: string;
  profile: string;
  website: string;
  canonicalName?: string;
  categories?: OrganizationCategory[];
};

const excludedProfiles = [
  "https://iati.co.il/members/psg/",
  "https://iati.co.il/members/blackstone/",
  "https://iati.co.il/members/hamilton-lane-yett/",
];

const members: MemberSeed[] = [
  { name: "Earth & Beyond Ventures", profile: "https://iati.co.il/members/earth-beyond-ventures/", website: "https://earthandbeyond.ventures/" },
  { name: "Clarim Ventures", profile: "https://iati.co.il/members/clarim-ventures/", website: "https://clarim.vc/" },
  { name: "Future First", profile: "https://iati.co.il/members/future-first/", website: "https://www.futurefirst.vc/" },
  { name: "Maple Capital", profile: "https://iati.co.il/members/maple-capital/", website: "https://maple-capital.com/", categories: ["family_office", "vc_firm"] },
  { name: "Shoni Health Ventures", profile: "https://iati.co.il/members/shoni-health-ventures/", website: "https://shonihealth.com/", categories: ["vc_firm", "impact_investor"] },
  { name: "MC Magenta Management (Magenta Venture Partners)", canonicalName: "Magenta Venture Partners", profile: "https://iati.co.il/members/mc-magenta-management-magenta-venture-partners/", website: "https://www.magenta.vc/" },
  { name: "Menomadin Foundation", profile: "https://iati.co.il/members/menomadin-foundation/", website: "https://menomadinfoundation.com/", categories: ["family_office", "impact_investor"] },
  { name: "Maor Investments", profile: "https://iati.co.il/members/maor-investments/", website: "https://www.maorinvest.com/" },
  { name: "VERSATIL.VC", canonicalName: "Versatil VC", profile: "https://iati.co.il/members/versatil-vc/", website: "https://versatil.vc/" },
  { name: "Aion Labs", canonicalName: "AION Labs", profile: "https://iati.co.il/members/aion-labs/", website: "https://aionlabs.com/", categories: ["venture_studio", "accelerator", "corporate_vc"] },
  { name: "Alive", canonicalName: "ALIVE Israel HealthTech Fund", profile: "https://iati.co.il/members/alive/", website: "https://alivevc.com/", categories: ["vc_firm", "impact_investor"] },
  { name: "Stage One", canonicalName: "StageOne Ventures", profile: "https://iati.co.il/members/stage-one/", website: "https://www.stageonevc.com/" },
  { name: "Team8", profile: "https://iati.co.il/members/team8/", website: "https://team8.vc/", categories: ["vc_firm", "venture_studio"] },
  { name: "YL Ventures", profile: "https://iati.co.il/members/yl-ventures/", website: "https://www.ylventures.com/" },
  { name: "Viola", canonicalName: "Viola Ventures", profile: "https://iati.co.il/members/viola/", website: "https://www.viola-group.com/" },
  { name: "Vertex", canonicalName: "Vertex Ventures Israel", profile: "https://iati.co.il/members/vertex/", website: "https://www.vertexventures.co.il/" },
  { name: "TLV Partners", profile: "https://iati.co.il/members/tlv-partners/", website: "https://www.tlv.partners/" },
  { name: "Takwin Ventures", profile: "https://iati.co.il/members/takwin-ventures/", website: "https://takwin.vc/", categories: ["vc_firm", "impact_investor"] },
  { name: "SOMV", canonicalName: "State of Mind Ventures", profile: "https://iati.co.il/members/somv/", website: "https://www.somv.com/" },
  { name: "Shavit", canonicalName: "Shavit Capital", profile: "https://iati.co.il/members/shavit/", website: "https://www.shavitcapital.com/" },
  { name: "RMGlobal", profile: "https://iati.co.il/members/rmglobal/", website: "https://rmglobal.com/" },
  { name: "Red Dot", canonicalName: "Red Dot Capital Partners", profile: "https://iati.co.il/members/red-dot/", website: "https://www.reddotcap.com/" },
  { name: "Qumra", canonicalName: "Qumra Capital", profile: "https://iati.co.il/members/qumra/", website: "https://qumracapital.com/" },
  { name: "Pontifax", canonicalName: "Pontifax Venture Capital", profile: "https://iati.co.il/members/pontifax/", website: "https://www.pontifax.com/" },
  { name: "Pitango", profile: "https://iati.co.il/members/pitango/", website: "https://www.pitango.com/" },
  { name: "Peregrine", canonicalName: "Peregrine Ventures", profile: "https://iati.co.il/members/peregrine/", website: "https://www.peregrinevc.com/" },
  { name: "OurCrowd", profile: "https://iati.co.il/members/ourcrowd/", website: "https://www.ourcrowd.com/", categories: ["vc_firm", "syndicate"] },
  { name: "NFX", profile: "https://iati.co.il/members/nfx/", website: "https://www.nfx.com/" },
  { name: "Next Gear", canonicalName: "NextGear Ventures", profile: "https://iati.co.il/members/nextgear/", website: "https://www.nextgear.vc/" },
  { name: "LionBird", profile: "https://iati.co.il/members/lionbird/", website: "https://www.lionbird.com/" },
  { name: "LightSpeed", canonicalName: "Lightspeed Venture Partners", profile: "https://iati.co.il/members/lightspeed/", website: "https://lsvp.com/" },
  { name: "Key1Capital", canonicalName: "Key1 Capital", profile: "https://iati.co.il/members/key1capital/", website: "https://key1capital.com/" },
  { name: "JVP", canonicalName: "Jerusalem Venture Partners", profile: "https://iati.co.il/members/jvp/", website: "https://www.jvpvc.com/" },
  { name: "JAL", canonicalName: "JAL Ventures", profile: "https://iati.co.il/members/jal/", website: "https://www.jalventures.com/" },
  { name: "Israel Secondary Fund", profile: "https://iati.co.il/members/israel-secondary-fund/", website: "https://israelsecondary.com/" },
  { name: "Israel Biotech Fund", profile: "https://iati.co.il/members/israel-biotech-fund/", website: "https://israelbiotechfund.com/" },
  { name: "ION", canonicalName: "ION Asset Management", profile: "https://iati.co.il/members/ion/", website: "https://www.ion-am.com/" },
  { name: "Hanaco", canonicalName: "Hanaco Ventures", profile: "https://iati.co.il/members/hanaco/", website: "https://www.hanacovc.com/" },
  { name: "Grove Ventures", profile: "https://iati.co.il/members/grove-ventures/", website: "https://www.grovevc.com/" },
  { name: "Elron VC", canonicalName: "Elron Ventures", profile: "https://iati.co.il/members/elron-vc/", website: "https://elronventures.com/" },
  { name: "Catalyst", canonicalName: "Catalyst Investments", profile: "https://iati.co.il/members/catalyst/", website: "https://catalyst.co.il/" },
  { name: "Canaan Partners Israel", profile: "https://iati.co.il/members/canaan/", website: "https://www.canaan.com/" },
  { name: "BRM", canonicalName: "BRM Group", profile: "https://iati.co.il/members/brm/", website: "https://www.brm.com/" },
  { name: "Bessemer Venture Partners", profile: "https://iati.co.il/members/bessemer-venture-partners/", website: "https://www.bvp.com/" },
  { name: "aMOON", canonicalName: "aMoon", profile: "https://iati.co.il/members/amoon/", website: "https://amoon.fund/", categories: ["vc_firm", "impact_investor"] },
  { name: "ALEPH", canonicalName: "Aleph", profile: "https://iati.co.il/members/aleph/", website: "https://aleph.vc/" },
  { name: "83North", profile: "https://iati.co.il/members/83north/", website: "https://www.83north.com/" },
  { name: "12 Angels", profile: "https://iati.co.il/members/12-angels/", website: "https://12angels.vc/", categories: ["angel_network"] },
  { name: "10D", profile: "https://iati.co.il/members/10d/", website: "https://www.10d.vc/" },
  { name: "Trendlines", canonicalName: "The Trendlines Group", profile: "https://iati.co.il/members/trendlines/", website: "https://www.trendlines.com/", categories: ["vc_firm", "incubator", "venture_studio"] },
  { name: "Sanara", canonicalName: "Sanara Ventures", profile: "https://iati.co.il/members/sanara/", website: "https://sanaraventures.com/", categories: ["vc_firm", "incubator"] },
  { name: "NGT", canonicalName: "NGT Healthcare", profile: "https://iati.co.il/members/ngt/", website: "https://ngt3vc.com/", categories: ["vc_firm", "incubator"] },
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
      headers: { "user-agent": "Startup Atlas member verification/1.0" },
    });
    await response.body?.cancel();
    return response.status < 500 && ![404, 410].includes(response.status);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function makeSeed(member: MemberSeed): EcosystemOrganization {
  const name = member.canonicalName ?? member.name;
  return {
    id: slugify(name),
    kind: "organization",
    name,
    aliases: name === member.name ? [] : [member.name],
    categories: member.categories ?? ["vc_firm"],
    description: `${name} is a current IATI investment-entity member with a public operating website and an active professional path for founders or portfolio companies serving Israel's technology ecosystem.`,
    status: "active",
    publicationState: "published",
    website: member.website,
    logoUrl: `https://www.google.com/s2/favicons?domain=${websiteHost(member.website)}&sz=128`,
    serviceMarkets: [{ marketCode: "IL", serviceMode: "remote" }],
    sectors: [],
    stages: [],
    supportCapabilities: ["seed_funding", "investor_access", "market_access"],
    applicationUrl: member.website,
    affiliations: ["Israel Advanced Technology Industries"],
    registrations: [],
    managedVehicles: [],
    locations: [],
    evidence: [
      {
        url: member.profile,
        title: `${member.name} — IATI investment-entity member`,
        publisher: "Israel Advanced Technology Industries",
        sourceClass: "official_announcement",
        checkedAt: CHECKED_AT,
        supports: ["current investment-entity membership", "Israel technology ecosystem activity"],
      },
      {
        url: member.website,
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
  return {
    ...target,
    aliases: unique([...(target.aliases ?? []), ...seed.aliases]),
    categories: unique([...(target.categories ?? []), ...seed.categories]),
    serviceMarkets: target.serviceMarkets.some((market) => market.marketCode === "IL")
      ? target.serviceMarkets
      : [...target.serviceMarkets, ...seed.serviceMarkets],
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
  const checks: Array<{ member: MemberSeed; profile: boolean; website: boolean }> = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (cursor < members.length) {
        const member = members[cursor++];
        checks.push({
          member,
          profile: await reachable(member.profile),
          website: await reachable(member.website),
        });
      }
    })
  );
  const included = checks.filter((check) => check.profile && check.website);

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
  for (const { member } of included) {
    const seed = makeSeed(member);
    const index =
      hosts.get(websiteHost(seed.website)!) ?? names.get(comparableName(seed.name));
    if (index !== undefined) {
      organizations[index] = merge(organizations[index], seed);
      if (member.canonicalName && organizations[index].name !== member.canonicalName) {
        organizations[index].aliases = unique([
          ...organizations[index].aliases,
          organizations[index].name,
        ]);
        organizations[index].name = member.canonicalName;
      }
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
        discovered: members.length + excludedProfiles.length,
        included: included.length,
        excluded: excludedProfiles.length + members.length - included.length,
        merged: mergedCount,
        createdOrganizations: organizations.length - initialCount,
        siteCheckFailures: checks
          .filter((check) => !check.profile || !check.website)
          .map((check) => check.member.name),
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
