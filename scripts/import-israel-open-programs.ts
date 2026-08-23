import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { EcosystemProgram } from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-09-07";
const programsPath = resolve(process.cwd(), "src/data/ecosystem/programs.json");

const evidence = (url: string, title: string, supports: string[]) => [{
  url,
  title,
  publisher: title.split(" — ")[0],
  sourceClass: "official_website" as const,
  checkedAt: CHECKED_AT,
  supports,
}];

const seeds: EcosystemProgram[] = [
  {
    id: "civiclabs-program",
    kind: "program",
    name: "CivicLabs Program",
    aliases: [],
    programType: "accelerator_cohort",
    organizerIds: ["civiclabs-israel"],
    description: "An open built-environment accelerator for early-stage startups and entrepreneurs combining mentorship, R&D and field access, business support, pilots, investor exposure, and possible funding.",
    publicationState: "published",
    deliveryMode: "hybrid",
    locationIds: ["civiclabs-israel-location"],
    eligibleMarketCodes: ["IL"],
    marketWideCodes: ["IL"],
    sectors: ["built environment", "construction", "infrastructure", "climate"],
    stages: ["idea", "pre_seed", "seed"],
    eligibility: "Early-stage founders and startups developing technology for construction, real estate, infrastructure, municipal services, utilities, or the wider built environment.",
    benefits: ["Mentorship and business guidance", "R&D, laboratory, and field access", "Pilot and corporate connections", "Investor network and funding consideration"],
    equityTerms: "Not disclosed",
    applicationUrl: "https://www.civic-labs.com/program",
    applicationsOpenAsOf: CHECKED_AT,
    rolling: false,
    evidence: evidence("https://www.civic-labs.com/program", "CivicLabs — Program", ["applications open", "startup eligibility", "program stages", "benefits"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  },
  {
    id: "northpreneur-iii",
    kind: "program",
    name: "NorthPreneur III",
    aliases: ["NorthPreneur"],
    programType: "accelerator_cohort",
    organizerIds: ["northmed-innovation-center"],
    description: "NorthMed's currently accepting entrepreneurship program for northern founders, combining health-technology and entrepreneurship learning, expert mentoring, clinical connections, and venture guidance.",
    publicationState: "published",
    deliveryMode: "hybrid",
    locationIds: ["northmed-innovation-center-location"],
    eligibleMarketCodes: ["IL"],
    marketWideCodes: ["IL"],
    sectors: ["healthcare", "medtech", "digital health"],
    stages: ["idea", "pre_seed", "seed"],
    eligibility: "Entrepreneurs and early-stage founders seeking to develop a healthcare or technology venture with support from the northern Israel ecosystem.",
    benefits: ["Expert health-tech and entrepreneurship sessions", "Mentoring", "Industry and clinical ecosystem access", "Founder community"],
    equityTerms: "Not disclosed",
    applicationUrl: "https://northmed.tech/",
    applicationsOpenAsOf: CHECKED_AT,
    rolling: false,
    evidence: evidence("https://northmed.tech/", "NorthMed — NorthPreneur III", ["accepting applications", "program focus", "mentoring", "founder support"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  },
  {
    id: "jinnovate-advanced-incubation-2026",
    kind: "program",
    name: "Jinnovate Advanced Incubation Program 2026",
    aliases: [],
    programType: "incubation_intake",
    organizerIds: ["jinnovate"],
    description: "A currently accepting Jerusalem health-tech incubation pathway supporting founders from ideation through company growth with clinical, technology, AI, mentoring, and investor preparation resources.",
    publicationState: "published",
    deliveryMode: "hybrid",
    locationIds: ["jinnovate-location"],
    eligibleMarketCodes: ["IL"],
    marketWideCodes: ["IL"],
    sectors: ["healthcare", "medtech", "artificial intelligence"],
    stages: ["idea", "pre_seed", "seed"],
    eligibility: "Aspiring or established entrepreneurs developing health-tech, medical-device, life-science, digital-health, or healthcare AI ventures.",
    benefits: ["Incubation and mentoring", "Clinical and technology partnerships", "Pitch and investor preparation", "Demo days and international connections"],
    equityTerms: "See participation agreement",
    applicationUrl: "https://jinnovate.tech/",
    applicationsOpenAsOf: CHECKED_AT,
    rolling: false,
    evidence: evidence("https://jinnovate.tech/", "Jinnovate — Advanced Incubation Program 2026", ["apply-now path", "2026 program", "eligibility", "program services"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  },
  {
    id: "hamitbah-buildtech-call",
    kind: "program",
    name: "Hamitbah BuildTech Call for Startups",
    aliases: [],
    programType: "corporate_pilot",
    organizerIds: ["hamitbah-western-negev"],
    description: "An open Western Negev call for construction-technology startups seeking pilots, industry validation, strategic partnerships, mentors, and tailored funding pathways.",
    publicationState: "published",
    deliveryMode: "hybrid",
    locationIds: ["hamitbah-western-negev-location"],
    eligibleMarketCodes: ["IL"],
    marketWideCodes: ["IL"],
    sectors: ["construction", "built environment", "robotics"],
    stages: ["pre_seed", "seed", "series_a", "series_b_plus"],
    eligibility: "Startups with a technology that can improve construction or the built environment and can participate in a Western Negev pilot or industry partnership.",
    benefits: ["Real-world pilot opportunities", "Industry and municipal connections", "Mentorship", "Investor and Innovation Authority pathways"],
    equityTerms: "Not disclosed",
    applicationUrl: "https://hamitbah.com/en/",
    applicationsOpenAsOf: CHECKED_AT,
    rolling: false,
    evidence: evidence("https://hamitbah.com/en/", "Hamitbah — BuildTech Call for Startups", ["applications open", "startup call", "pilot support", "program benefits"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  },
  {
    id: "hamitbah-connectivity-startup-call",
    kind: "program",
    name: "Hamitbah Connectivity Startup Call",
    aliases: [],
    programType: "corporate_pilot",
    organizerIds: ["hamitbah-western-negev"],
    description: "An open call for startups developing connectivity and communications infrastructure solutions that can be piloted against real operational needs in the Western Negev.",
    publicationState: "published",
    deliveryMode: "hybrid",
    locationIds: ["hamitbah-western-negev-location"],
    eligibleMarketCodes: ["IL"],
    marketWideCodes: ["IL"],
    sectors: ["telecommunications", "internet of things", "cybersecurity", "space"],
    stages: ["pre_seed", "seed", "series_a", "series_b_plus"],
    eligibility: "Technology startups with connectivity, communication infrastructure, satellite, IoT, edge, or related solutions suitable for a real-world regional pilot.",
    benefits: ["Real-world pilot opportunities", "Industry and public-sector partners", "Mentorship", "Funding and investor connections"],
    equityTerms: "Not disclosed",
    applicationUrl: "https://hamitbah.com/en/",
    applicationsOpenAsOf: CHECKED_AT,
    rolling: false,
    evidence: evidence("https://hamitbah.com/en/", "Hamitbah — Connectivity Startup Call", ["applications open", "startup call", "program sectors", "pilot and partner access"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  },
  {
    id: "darom-boostcamp",
    kind: "program",
    name: "DAROM Boostcamp",
    aliases: [],
    programType: "accelerator_cohort",
    organizerIds: ["darom-innovation-center"],
    description: "A currently accepting Eastern Negev bootcamp for validating early-stage solutions and preparing ventures for market readiness, pilots, industry collaboration, and further acceleration.",
    publicationState: "published",
    deliveryMode: "hybrid",
    locationIds: ["darom-innovation-center-location"],
    eligibleMarketCodes: ["IL"],
    marketWideCodes: ["IL"],
    sectors: ["climate", "energy", "manufacturing", "robotics", "artificial intelligence"],
    stages: ["idea", "pre_seed", "seed"],
    eligibility: "Early-stage founders and ventures developing solutions aligned with green industry, energy, climate resilience, industrial AI, advanced manufacturing, or ground robotics.",
    benefits: ["Solution validation", "Mentoring and R&D support", "Testing-site and industry access", "Pilot and acceleration preparation"],
    equityTerms: "Not disclosed",
    applicationUrl: "https://darom.life/",
    applicationsOpenAsOf: CHECKED_AT,
    rolling: false,
    evidence: evidence("https://darom.life/", "DAROM Innovation Center — Boostcamp", ["registration open", "bootcamp activity", "focus areas", "program support"]),
    lastVerifiedAt: CHECKED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
  },
];

const programs = JSON.parse(readFileSync(programsPath, "utf8")) as EcosystemProgram[];
const programIndex = new Map(programs.map((item, index) => [item.id, index]));
let created = 0;
for (const seed of seeds) {
  const index = programIndex.get(seed.id);
  if (index === undefined) {
    programs.push(seed);
    programIndex.set(seed.id, programs.length - 1);
    created += 1;
  } else {
    programs[index] = seed;
  }
}
programs.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(programsPath, `${JSON.stringify(programs, null, 2)}\n`);
console.log(`Published ${created} currently open Israeli centre programmes.`);
