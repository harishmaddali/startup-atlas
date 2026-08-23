import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { EcosystemOrganization, EcosystemProgram } from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const PROGRAM_REVIEW_AT = "2026-09-07";
const DIRECTORY_REVIEW_AT = "2026-12-22";
const organizationsPath = resolve(process.cwd(), "src/data/ecosystem/organizations.json");
const programsPath = resolve(process.cwd(), "src/data/ecosystem/programs.json");

const organizations = JSON.parse(readFileSync(organizationsPath, "utf8")) as EcosystemOrganization[];
const programs = JSON.parse(readFileSync(programsPath, "utf8")) as EcosystemProgram[];
const organizationIds = new Set(organizations.map((item) => item.id));
const programIds = new Set(programs.map((item) => item.id));

const organizerSeeds: EcosystemOrganization[] = [
  {
    id: "australian-business-grants-hub",
    kind: "organization",
    name: "Australian Government Business Grants Hub",
    aliases: ["business.gov.au Grants and Programs"],
    categories: ["government_agency"],
    description: "The Australian Government's official business grants and programs service, publishing eligibility, application windows, and direct application paths for national opportunities.",
    status: "active",
    publicationState: "published",
    website: "https://business.gov.au/grants-and-programs",
    logoUrl: "https://www.google.com/s2/favicons?domain=business.gov.au&sz=128",
    serviceMarkets: [{ marketCode: "AU", serviceMode: "remote" }],
    sectors: [],
    stages: ["idea", "pre_seed", "seed", "series_a", "growth"],
    supportCapabilities: ["grants", "regulatory_support"],
    applicationUrl: "https://business.gov.au/grants-and-programs",
    affiliations: ["Australian Government"],
    registrations: [],
    managedVehicles: [],
    locations: [],
    evidence: [{
      url: "https://business.gov.au/grants-and-programs",
      title: "Grants and programs finder",
      publisher: "Australian Government",
      sourceClass: "government_registry",
      checkedAt: CHECKED_AT,
      supports: ["current national program directory", "eligibility", "application links"],
    }],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: DIRECTORY_REVIEW_AT,
  },
  {
    id: "screen-australia",
    kind: "organization",
    name: "Screen Australia",
    aliases: [],
    categories: ["government_agency"],
    description: "Australia's federal screen agency, providing development and production support including targeted funding for independent Australian game creators.",
    status: "active",
    publicationState: "published",
    website: "https://www.screenaustralia.gov.au/",
    logoUrl: "https://www.google.com/s2/favicons?domain=screenaustralia.gov.au&sz=128",
    serviceMarkets: [{ marketCode: "AU", serviceMode: "hybrid" }],
    sectors: ["gaming", "creative industries"],
    stages: ["idea", "pre_seed", "seed"],
    supportCapabilities: ["grants", "mentorship"],
    applicationUrl: "https://www.screenaustralia.gov.au/funding-and-support/games",
    affiliations: ["Australian Government"],
    registrations: [],
    managedVehicles: [],
    locations: [],
    evidence: [{
      url: "https://business.gov.au/grants-and-programs/emerging-gamemakers-fund",
      title: "Emerging Gamemakers Fund",
      publisher: "Australian Government",
      sourceClass: "government_registry",
      checkedAt: CHECKED_AT,
      supports: ["current activity", "gamemaker funding", "application deadline"],
    }],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: DIRECTORY_REVIEW_AT,
  },
  {
    id: "csiro",
    kind: "organization",
    name: "CSIRO",
    aliases: ["Commonwealth Scientific and Industrial Research Organisation"],
    categories: ["government_agency", "incubator"],
    description: "Australia's national science agency, operating research commercialization and SME innovation-support programs including the sector-specific Innovate to Grow program.",
    status: "active",
    publicationState: "published",
    website: "https://www.csiro.au/",
    logoUrl: "https://www.google.com/s2/favicons?domain=csiro.au&sz=128",
    serviceMarkets: [{ marketCode: "AU", serviceMode: "hybrid" }],
    sectors: ["deeptech", "research and development"],
    stages: ["idea", "pre_seed", "seed", "series_a", "growth"],
    supportCapabilities: ["labs", "mentorship", "grants", "ip_support"],
    applicationUrl: "https://www.csiro.au/en/work-with-us/funding-programs/programs/innovate-to-grow",
    affiliations: ["Australian Government"],
    registrations: [],
    managedVehicles: [],
    locations: [],
    evidence: [{
      url: "https://business.gov.au/grants-and-programs/innovate-to-grow",
      title: "Innovate to Grow",
      publisher: "Australian Government",
      sourceClass: "government_registry",
      checkedAt: CHECKED_AT,
      supports: ["current program operator", "rolling sector intakes", "SME eligibility"],
    }],
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: DIRECTORY_REVIEW_AT,
  },
];

for (const organization of organizerSeeds) {
  if (!organizationIds.has(organization.id)) organizations.push(organization);
}

const evidence = (url: string, title: string, supports: string[]) => [{
  url,
  title,
  publisher: "Australian Government",
  sourceClass: "government_registry" as const,
  checkedAt: CHECKED_AT,
  supports,
}];

const programSeeds: EcosystemProgram[] = [
  {
    id: "emerging-gamemakers-fund-2026",
    kind: "program",
    name: "Emerging Gamemakers Fund 2026",
    aliases: [],
    programType: "grant",
    organizerIds: ["screen-australia"],
    description: "Funding for Australian independent gamemakers to create or complete an original micro-scale game at ideation or pre-production stage.",
    publicationState: "published",
    deliveryMode: "remote",
    locationIds: [],
    eligibleMarketCodes: ["AU"],
    marketWideCodes: ["AU"],
    sectors: ["gaming", "creative industries"],
    stages: ["idea", "pre_seed"],
    eligibility: "Australian citizens, permanent residents, or incorporated Australian companies developing an eligible original game with a budget up to AUD 500,000.",
    benefits: ["Up to AUD 30,000 in project funding"],
    funding: { min: 0, max: 30000, currency: "AUD", asStated: "Funding up to AUD 30,000" },
    equityTerms: "No equity stated",
    applicationUrl: "https://business.gov.au/grants-and-programs/emerging-gamemakers-fund",
    applicationCloseAt: "2026-08-27T23:59:59+10:00",
    rolling: false,
    evidence: evidence("https://business.gov.au/grants-and-programs/emerging-gamemakers-fund", "Emerging Gamemakers Fund", ["open status", "27 August 2026 deadline", "funding", "eligibility"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: PROGRAM_REVIEW_AT,
  },
  {
    id: "defence-industry-development-grants",
    kind: "program",
    name: "Defence Industry Development Grants Program",
    aliases: ["DIDG"],
    programType: "grant",
    organizerIds: ["australian-business-grants-hub"],
    description: "Four grant streams supporting Australian defence-industry SMEs with sovereign capability, exports, security, and workforce skilling projects.",
    publicationState: "published",
    deliveryMode: "remote",
    locationIds: [],
    eligibleMarketCodes: ["AU"],
    marketWideCodes: ["AU"],
    sectors: ["defence", "manufacturing", "cybersecurity"],
    stages: ["seed", "series_a", "series_b_plus", "growth"],
    eligibility: "Australian incorporated, GST-registered SMEs with fewer than 200 employees and an eligible Australian defence-industry project; the Skilling stream also accepts eligible defence industry associations.",
    benefits: ["Grants from AUD 5,000 to AUD 1,000,000 depending on stream", "Up to 50% of eligible expenditure"],
    funding: { min: 5000, max: 1000000, currency: "AUD", asStated: "AUD 5,000–1,000,000 depending on stream; up to 50% of eligible expenditure" },
    equityTerms: "No equity stated",
    applicationUrl: "https://business.gov.au/grants-and-programs/defence-industry-development-grants-program",
    rolling: true,
    evidence: evidence("https://business.gov.au/grants-and-programs/defence-industry-development-grants-program", "Defence Industry Development Grants Program", ["open status", "batched rolling applications", "stream deadlines", "funding", "eligibility"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: PROGRAM_REVIEW_AT,
  },
  {
    id: "innovate-to-grow-australia",
    kind: "program",
    name: "Innovate to Grow",
    aliases: [],
    programType: "incubation_intake",
    organizerIds: ["csiro"],
    description: "A free eight-week, sector-specific program helping Australian SMEs refine R&D opportunities, validate innovation challenges, and prepare a stronger research and funding case.",
    publicationState: "published",
    deliveryMode: "remote",
    locationIds: [],
    eligibleMarketCodes: ["AU"],
    marketWideCodes: ["AU"],
    sectors: ["research and development", "deeptech"],
    stages: ["idea", "pre_seed", "seed", "series_a", "growth"],
    eligibility: "Australian registered and operating SMEs with fewer than 200 employees that are exploring R&D opportunities in the sector advertised for an open intake.",
    benefits: ["Free eight-week R&D support", "R&D coaching and confidential feedback", "Networking and funding-application preparation"],
    equityTerms: "No equity stated",
    applicationUrl: "https://business.gov.au/grants-and-programs/innovate-to-grow",
    rolling: true,
    evidence: evidence("https://business.gov.au/grants-and-programs/innovate-to-grow", "Innovate to Grow", ["open status", "monthly sector intakes", "program benefits", "eligibility"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: PROGRAM_REVIEW_AT,
  },
  {
    id: "powering-regions-safeguard-transformation-round-2",
    kind: "program",
    name: "Powering the Regions Fund — Safeguard Transformation Stream Round 2",
    aliases: ["PRF STS Round 2"],
    programType: "grant",
    organizerIds: ["australian-business-grants-hub"],
    description: "Competitive funding for eligible Australian trade-exposed Safeguard facilities to reduce emissions through equipment, process, and workforce-transformation projects.",
    publicationState: "published",
    deliveryMode: "remote",
    locationIds: [],
    eligibleMarketCodes: ["AU"],
    marketWideCodes: ["AU"],
    sectors: ["climate", "energy", "industrial decarbonization"],
    stages: ["growth"],
    eligibility: "Owners or operators of eligible Australian trade-exposed Safeguard Mechanism facilities, excluding new or expanded coal or gas production facilities.",
    benefits: ["AUD 500,000–50,000,000 grant", "Up to 50% of eligible project expenditure"],
    funding: { min: 500000, max: 50000000, currency: "AUD", asStated: "AUD 500,000–50,000,000; up to 50% of eligible expenditure" },
    equityTerms: "No equity stated",
    applicationUrl: "https://business.gov.au/grants-and-programs/powering-the-regions-fund-safeguard-transformation-stream-round-2",
    applicationCloseAt: "2026-11-05T17:00:00+10:00",
    rolling: false,
    evidence: evidence("https://business.gov.au/grants-and-programs/powering-the-regions-fund-safeguard-transformation-stream-round-2", "Powering the Regions Fund — Safeguard Transformation Stream Round 2", ["open status", "5 November 2026 batch deadline", "funding", "eligibility"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: PROGRAM_REVIEW_AT,
  },
];

for (const program of programSeeds) {
  if (!programIds.has(program.id)) programs.push(program);
}

organizations.sort((a, b) => a.name.localeCompare(b.name));
programs.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);
writeFileSync(programsPath, `${JSON.stringify(programs, null, 2)}\n`);
console.log(`Resolved ${programSeeds.length} Australian government-program leads.`);
