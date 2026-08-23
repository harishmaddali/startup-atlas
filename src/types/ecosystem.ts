import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const dateTimeSchema = z.string().datetime({ offset: true });
const nullableUrlSchema = z.string().url().nullable().optional();

export const marketCodeSchema = z.enum([
  "IN",
  "US",
  "GB",
  "AE-DU",
  "SG",
  "AU",
  "NZ",
  "IL",
]);

export const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/);

export const serviceMarketSchema = z.object({
  marketCode: marketCodeSchema,
  serviceMode: z.enum(["physical", "hybrid", "remote"]),
}).strict();

export const sourceClassSchema = z.enum([
  "regulator",
  "government_registry",
  "official_website",
  "official_portfolio",
  "official_announcement",
  "reputable_news",
]);

export const sourceEvidenceSchema = z.object({
  url: z.string().url(),
  title: z.string().min(2),
  publisher: z.string().min(2),
  sourceClass: sourceClassSchema,
  checkedAt: dateSchema,
  supports: z.array(z.string().min(1)).min(1),
}).strict();

export const locationPrecisionSchema = z.enum([
  "building",
  "street",
  "neighborhood",
  "city",
  "none",
]);

export const mapLocationSchema = z.object({
  id: z.string().min(2),
  role: z.enum(["headquarters", "office", "campus", "incubation_facility"]),
  label: z.string().min(2),
  address: z.string().min(2).nullable(),
  city: z.string().min(2),
  district: z.string().min(2).nullable().optional(),
  state: z.string().min(2),
  postalCode: z.string().min(3).nullable().optional(),
  marketCode: marketCodeSchema,
  countryCode: countryCodeSchema,
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  precision: locationPrecisionSchema.exclude(["none"]),
  evidenceUrl: z.string().url(),
  verifiedAt: dateSchema,
}).strict();

export const startupStageSchema = z.enum([
  "idea",
  "pre_seed",
  "seed",
  "series_a",
  "series_b_plus",
  "growth",
]);

export const organizationCategorySchema = z.enum([
  "vc_firm",
  "micro_vc",
  "corporate_vc",
  "impact_investor",
  "venture_debt",
  "family_office",
  "angel_network",
  "syndicate",
  "accelerator",
  "incubator",
  "venture_studio",
  "government_agency",
  "university_center",
]);

export const supportCapabilitySchema = z.enum([
  "workspace",
  "labs",
  "mentorship",
  "grants",
  "seed_funding",
  "market_access",
  "corporate_pilots",
  "investor_access",
  "regulatory_support",
  "ip_support",
]);

export const investmentRangeSchema = z.object({
  min: z.number().nonnegative().nullable(),
  max: z.number().positive().nullable(),
  currency: z.string().length(3),
  asStated: z.string().min(2),
  approximateMinUsd: z.number().nonnegative().nullable().optional(),
  approximateMaxUsd: z.number().positive().nullable().optional(),
  fxAsOf: dateSchema.nullable().optional(),
}).strict();

export const ecosystemOrganizationSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.literal("organization"),
  name: z.string().min(2),
  aliases: z.array(z.string().min(2)).default([]),
  categories: z.array(organizationCategorySchema).min(1),
  description: z.string().min(20),
  status: z.enum(["active", "inactive", "unverified"]),
  publicationState: z.enum(["published", "archived", "research"]),
  website: z.string().url(),
  logoUrl: nullableUrlSchema,
  foundedYear: z.number().int().min(1900).max(2100).nullable().optional(),
  serviceMarkets: z.array(serviceMarketSchema).min(1),
  sectors: z.array(z.string().min(2)).default([]),
  stages: z.array(startupStageSchema).default([]),
  supportCapabilities: z.array(supportCapabilitySchema).default([]),
  investmentThesis: z.string().min(10).nullable().optional(),
  investmentRange: investmentRangeSchema.nullable().optional(),
  investmentPreference: z.enum(["lead", "follow", "both"]).nullable().optional(),
  portfolioUrl: nullableUrlSchema,
  applicationUrl: nullableUrlSchema,
  contactEmail: z.string().email().nullable().optional(),
  linkedinUrl: nullableUrlSchema,
  affiliations: z.array(z.string().min(2)).default([]),
  registrations: z
    .array(
      z.object({
        authority: z.string().min(2),
        registrationNumber: z.string().min(2),
        vehicleName: z.string().min(2),
      })
    )
    .default([]),
  managedVehicles: z.array(z.string().min(2)).default([]),
  locations: z.array(mapLocationSchema).default([]),
  evidence: z.array(sourceEvidenceSchema).min(1),
  lastVerifiedAt: dateSchema,
  nextReviewAt: dateSchema,
}).strict();

export const ecosystemPersonSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.literal("person"),
  role: z.literal("angel"),
  name: z.string().min(2),
  aliases: z.array(z.string().min(2)).default([]),
  description: z.string().min(20),
  publicationState: z.enum(["published", "archived", "research"]),
  professionalLocation: mapLocationSchema.nullable(),
  serviceMarkets: z.array(serviceMarketSchema).min(1),
  sectors: z.array(z.string().min(2)).default([]),
  stages: z.array(startupStageSchema).default([]),
  investmentRange: investmentRangeSchema.nullable().optional(),
  notableInvestments: z.array(z.string().min(2)).default([]),
  organizationIds: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  website: nullableUrlSchema,
  linkedinUrl: nullableUrlSchema,
  lastInvestmentActivityAt: dateSchema,
  evidence: z.array(sourceEvidenceSchema).min(2),
  lastVerifiedAt: dateSchema,
  nextReviewAt: dateSchema,
}).strict();

export const programTypeSchema = z.enum([
  "accelerator_cohort",
  "incubation_intake",
  "grant",
  "challenge",
  "fellowship",
  "government_scheme",
  "corporate_pilot",
]);

export const ecosystemProgramSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    kind: z.literal("program"),
    name: z.string().min(2),
    aliases: z.array(z.string().min(2)).default([]),
    programType: programTypeSchema,
    organizerIds: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
    description: z.string().min(20),
    publicationState: z.enum(["published", "archived", "research"]),
    deliveryMode: z.enum(["onsite", "hybrid", "remote"]),
    locationIds: z.array(z.string().min(2)).default([]),
    eligibleMarketCodes: z.array(marketCodeSchema).min(1),
    marketWideCodes: z.array(marketCodeSchema).default([]),
    sectors: z.array(z.string().min(2)).default([]),
    stages: z.array(startupStageSchema).default([]),
    eligibility: z.string().min(10),
    benefits: z.array(z.string().min(2)).min(1),
    funding: investmentRangeSchema.nullable().optional(),
    equityTerms: z.string().min(2).nullable().optional(),
    applicationUrl: z.string().url(),
    opensAt: dateTimeSchema.nullable().optional(),
    applicationCloseAt: dateTimeSchema.nullable().optional(),
    applicationsOpenAsOf: dateSchema.nullable().optional(),
    cohortStartsAt: dateTimeSchema.nullable().optional(),
    cohortEndsAt: dateTimeSchema.nullable().optional(),
    rolling: z.boolean(),
    evidence: z.array(sourceEvidenceSchema).min(1),
    lastVerifiedAt: dateSchema,
    nextReviewAt: dateSchema,
  }).strict()
  .superRefine((program, context) => {
    if (
      !program.rolling &&
      !program.opensAt &&
      !program.applicationCloseAt &&
      !program.applicationsOpenAsOf
    ) {
      context.addIssue({
        code: "custom",
        path: ["applicationCloseAt"],
        message:
          "A non-rolling program needs an opening date, closing date, or recently observed open status",
      });
    }
    if (program.rolling && program.applicationCloseAt) {
      context.addIssue({
        code: "custom",
        path: ["rolling"],
        message: "A rolling program cannot also have a fixed application deadline",
      });
    }
    if (
      program.applicationsOpenAsOf &&
      (program.rolling || program.opensAt || program.applicationCloseAt)
    ) {
      context.addIssue({
        code: "custom",
        path: ["applicationsOpenAsOf"],
        message:
          "A source-observed open status cannot be combined with rolling or fixed application dates",
      });
    }
    for (const marketCode of program.marketWideCodes) {
      if (!program.eligibleMarketCodes.includes(marketCode)) {
        context.addIssue({
          code: "custom",
          path: ["marketWideCodes"],
          message: `${marketCode} cannot be market-wide without being eligible`,
        });
      }
    }
  });

export const coverageAreaSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  marketCode: marketCodeSchema,
  name: z.string().min(2),
  scope: z.enum(["city", "metro", "emirate", "national_cluster"]),
  wave: z.number().int().min(1).max(4),
  sequence: z.number().int().positive(),
  includedDistricts: z.array(z.string().min(2)).min(1),
  status: z.enum(["planned", "researching", "review", "published"]),
  sourcesSwept: z.array(z.string().url()).default([]),
  leadBatches: z.array(z.object({
    label: z.string().min(2),
    sourceUrl: z.string().url(),
    discoveredCount: z.number().int().nonnegative(),
    includedCount: z.number().int().nonnegative(),
    excludedCount: z.number().int().nonnegative(),
    deferredCount: z.number().int().nonnegative(),
    notes: z.string().min(2).nullable().optional(),
  }).strict()).default([]),
  unresolvedLeads: z.number().int().nonnegative(),
  counts: z.object({
    organizations: z.number().int().nonnegative(),
    angels: z.number().int().nonnegative(),
    livePrograms: z.number().int().nonnegative(),
  }),
  lastSweepAt: dateSchema.nullable(),
  nextReviewAt: dateSchema.nullable(),
  notes: z.string().min(2).nullable().optional(),
}).strict();

export const ecosystemOrganizationsSchema = z.array(ecosystemOrganizationSchema);
export const ecosystemPeopleSchema = z.array(ecosystemPersonSchema);
export const ecosystemProgramsSchema = z.array(ecosystemProgramSchema);
export const coverageAreasSchema = z.array(coverageAreaSchema);

export type SourceEvidence = z.infer<typeof sourceEvidenceSchema>;
export type MarketCode = z.infer<typeof marketCodeSchema>;
export type MapLocation = z.infer<typeof mapLocationSchema>;
export type StartupStage = z.infer<typeof startupStageSchema>;
export type OrganizationCategory = z.infer<typeof organizationCategorySchema>;
export type SupportCapability = z.infer<typeof supportCapabilitySchema>;
export type InvestmentRange = z.infer<typeof investmentRangeSchema>;
export type EcosystemOrganization = z.infer<typeof ecosystemOrganizationSchema>;
export type EcosystemPerson = z.infer<typeof ecosystemPersonSchema>;
export type EcosystemProgram = z.infer<typeof ecosystemProgramSchema>;
export type CoverageArea = z.infer<typeof coverageAreaSchema>;

export type MapEntityKind = "startup" | "organization" | "person" | "program";
export type MapLayer = "startup" | "investor" | "support" | "angel" | "program";

export interface MapItem {
  key: string;
  entityId: string;
  entityKind: MapEntityKind;
  layers: MapLayer[];
  subtypes: string[];
  name: string;
  aliases: string[];
  description: string | null;
  logoUrl: string | null;
  pin: {
    locationId: string;
    label: string;
    lat: number;
    lng: number;
    precision: z.infer<typeof locationPrecisionSchema>;
    city: string;
    state: string;
    marketCode: MarketCode | null;
    countryCode: string | null;
  } | null;
  marketWideCodes: MarketCode[];
  sectors: string[];
  stages: StartupStage[];
  capabilities: string[];
  chequeBand:
    | "under_50k_usd"
    | "50k_250k_usd"
    | "250k_1m_usd"
    | "1m_plus_usd"
    | null;
  deliveryModes: Array<"onsite" | "hybrid" | "remote">;
  programStatus: "upcoming" | "open" | "rolling" | null;
  searchText: string;
  lastVerifiedAt: string | null;
}

export interface CoverageSummary {
  id: string;
  marketCode: MarketCode;
  name: string;
  scope: CoverageArea["scope"];
  status: CoverageArea["status"];
  unresolvedLeads: number;
  lastSweepAt: string | null;
  nextReviewAt: string | null;
}

export type MapEntity =
  | { kind: "startup"; data: import("@/types/company").Company }
  | { kind: "organization"; data: EcosystemOrganization; relatedPrograms: EcosystemProgram[] }
  | { kind: "person"; data: EcosystemPerson; organizations: EcosystemOrganization[] }
  | { kind: "program"; data: EcosystemProgram; organizers: EcosystemOrganization[] };
