import companiesJson from "@/data/companies.json";
import organizationsJson from "@/data/ecosystem/organizations.json";
import peopleJson from "@/data/ecosystem/people.json";
import programsJson from "@/data/ecosystem/programs.json";
import coverageJson from "@/data/ecosystem/coverage.json";
import { companiesSchema } from "@/types/company-schema";
import {
  coverageAreasSchema,
  ecosystemOrganizationsSchema,
  ecosystemPeopleSchema,
  ecosystemProgramsSchema,
  type EcosystemOrganization,
  type CoverageSummary,
  type MapLocation,
  type MapEntity,
  type MapItem,
  type MapLayer,
  type OrganizationCategory,
} from "@/types/ecosystem";
import { getProgramStatus, isLiveProgram } from "@/lib/program-status";

const investorCategories = new Set<OrganizationCategory>([
  "vc_firm",
  "micro_vc",
  "corporate_vc",
  "impact_investor",
  "venture_debt",
  "family_office",
  "angel_network",
  "syndicate",
]);

const supportCategories = new Set<OrganizationCategory>([
  "accelerator",
  "incubator",
  "venture_studio",
  "government_agency",
  "university_center",
]);

export const companies = companiesSchema.parse(companiesJson);
export const organizations = ecosystemOrganizationsSchema.parse(organizationsJson);
export const people = ecosystemPeopleSchema.parse(peopleJson);
export const programs = ecosystemProgramsSchema.parse(programsJson);
export const coverageAreas = coverageAreasSchema.parse(coverageJson);

const organizationsById = new Map(organizations.map((item) => [item.id, item]));
const peopleById = new Map(people.map((item) => [item.id, item]));
const programsById = new Map(programs.map((item) => [item.id, item]));
const companiesById = new Map(companies.map((item) => [item.id, item]));

function getOrganizationLayers(organization: EcosystemOrganization): MapLayer[] {
  const layers: MapLayer[] = [];
  if (organization.categories.some((category) => investorCategories.has(category))) {
    layers.push("investor");
  }
  if (organization.categories.some((category) => supportCategories.has(category))) {
    layers.push("support");
  }
  return layers;
}

function searchText(parts: Array<string | string[] | null | undefined>) {
  return parts
    .flatMap((part) => (Array.isArray(part) ? part : part ? [part] : []))
    .join(" ")
    .toLocaleLowerCase("en-IN");
}

function getChequeBand(maximumInr: number | null | undefined): MapItem["chequeBand"] {
  if (maximumInr == null) return null;
  if (maximumInr < 5_000_000) return "under_50l";
  if (maximumInr < 20_000_000) return "50l_2cr";
  if (maximumInr < 100_000_000) return "2cr_10cr";
  return "10cr_plus";
}

function startupMapItems(): MapItem[] {
  return companies.map((company) => ({
    key: `startup:${company.id}:primary`,
    entityId: company.id,
    entityKind: "startup",
    layers: ["startup"],
    subtypes: company.ycBatch ? ["yc_startup"] : ["startup"],
    name: company.name,
    aliases: [],
    description: null,
    logoUrl: company.logoUrl,
    pin: {
      locationId: "primary",
      label: company.address,
      lat: company.location.lat,
      lng: company.location.lng,
      precision: company.dataConfidence === "verified" ? "building" : "city",
      city: company.address,
      state: "",
    },
    indiaWide: false,
    sectors: company.sector ? [company.sector.toLocaleLowerCase("en-IN")] : [],
    stages: [],
    capabilities: [],
    chequeBand: null,
    deliveryModes: [],
    programStatus: null,
    searchText: searchText([
      company.name,
      company.address,
      company.sector,
    ]),
    lastVerifiedAt: null,
  }));
}

function organizationMapItems(): MapItem[] {
  return organizations
    .filter((organization) =>
      organization.status === "active" && organization.publicationState === "published"
    )
    .flatMap((organization): MapItem[] => {
      const layers = getOrganizationLayers(organization);
      const base: Omit<MapItem, "key" | "pin"> = {
        entityId: organization.id,
        entityKind: "organization" as const,
        layers,
        subtypes: organization.categories,
        name: organization.name,
        aliases: organization.aliases,
        description: organization.description,
        logoUrl: organization.logoUrl ?? null,
        indiaWide: organization.locations.length === 0,
        sectors: organization.sectors,
        stages: organization.stages,
        capabilities: organization.supportCapabilities,
        chequeBand: getChequeBand(organization.investmentRange?.approximateMaxInr),
        deliveryModes: [],
        programStatus: null,
        searchText: searchText([
          organization.name,
          organization.aliases,
          organization.description,
          organization.categories,
          organization.sectors,
          organization.stages,
          organization.supportCapabilities,
          organization.locations.map((location) => `${location.city} ${location.state}`),
        ]),
        lastVerifiedAt: organization.lastVerifiedAt,
      };

      if (organization.locations.length === 0) {
        return [{ ...base, key: `organization:${organization.id}:india-wide`, pin: null }];
      }

      return organization.locations.map((location) => ({
        ...base,
        key: `organization:${organization.id}:${location.id}`,
        pin: {
          locationId: location.id,
          label: location.label,
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
          precision: location.precision,
          city: location.city,
          state: location.state,
        },
      }));
    });
}

function peopleMapItems(): MapItem[] {
  return people
    .filter((person) => person.publicationState === "published")
    .map((person) => ({
      key: `person:${person.id}:${person.professionalLocation?.id ?? "india-wide"}`,
      entityId: person.id,
      entityKind: "person" as const,
      layers: ["angel" as const],
      subtypes: ["angel"],
      name: person.name,
      aliases: person.aliases,
      description: person.description,
      logoUrl: null,
      pin: person.professionalLocation
        ? {
            locationId: person.professionalLocation.id,
            label: person.professionalLocation.label,
            lat: person.professionalLocation.coordinates.lat,
            lng: person.professionalLocation.coordinates.lng,
            precision: person.professionalLocation.precision,
            city: person.professionalLocation.city,
            state: person.professionalLocation.state,
          }
        : null,
      indiaWide: !person.professionalLocation,
      sectors: person.sectors,
      stages: person.stages,
      capabilities: [],
      chequeBand: getChequeBand(person.investmentRange?.approximateMaxInr),
      deliveryModes: [],
      programStatus: null,
      searchText: searchText([
        person.name,
        person.aliases,
        person.description,
        person.sectors,
        person.stages,
        person.notableInvestments,
        person.professionalLocation?.city,
      ]),
      lastVerifiedAt: person.lastVerifiedAt,
    }));
}

function programMapItems(now = new Date()): MapItem[] {
  const locations = new Map(
    organizations.flatMap((organization) =>
      organization.locations.map((location) => [location.id, location] as const)
    )
  );

  return programs.filter((program) => isLiveProgram(program, now)).flatMap((program): MapItem[] => {
    const organizerNames = program.organizerIds
      .map((id) => organizationsById.get(id)?.name)
      .filter((name): name is string => Boolean(name));
    const organizerLogo = program.organizerIds
      .map((id) => organizationsById.get(id)?.logoUrl)
      .find((logo): logo is string => Boolean(logo));
    const base: Omit<MapItem, "key" | "pin"> = {
      entityId: program.id,
      entityKind: "program" as const,
      layers: ["program" as const],
      subtypes: [program.programType],
      name: program.name,
      aliases: program.aliases,
      description: program.description,
      logoUrl: organizerLogo ?? null,
      indiaWide: program.panIndia,
      sectors: program.sectors,
      stages: program.stages,
      capabilities: program.benefits,
      chequeBand: getChequeBand(program.funding?.approximateMaxInr),
      deliveryModes: [program.deliveryMode],
      programStatus: getProgramStatus(program, now) as "upcoming" | "open" | "rolling",
      searchText: searchText([
        program.name,
        program.aliases,
        program.description,
        program.programType,
        program.sectors,
        program.stages,
        program.benefits,
        organizerNames,
      ]),
      lastVerifiedAt: program.lastVerifiedAt,
    };
    const pins = program.locationIds
      .map((id) => locations.get(id))
      .filter((location): location is MapLocation => Boolean(location));

    if (pins.length === 0) {
      return [{ ...base, key: `program:${program.id}:india-wide`, pin: null }];
    }

    return pins.map((location) => ({
      ...base,
      key: `program:${program.id}:${location.id}`,
      pin: {
        locationId: location.id,
        label: location.label,
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        precision: location.precision,
        city: location.city,
        state: location.state,
      },
    }));
  });
}

export function getMapItems(now = new Date()): MapItem[] {
  return [
    ...startupMapItems(),
    ...organizationMapItems(),
    ...peopleMapItems(),
    ...programMapItems(now),
  ];
}

export function getCoverageSummaries(): CoverageSummary[] {
  return coverageAreas.map((area) => ({
    id: area.id,
    name: area.name,
    status: area.status,
    unresolvedLeads: area.unresolvedLeads,
    lastSweepAt: area.lastSweepAt,
    nextReviewAt: area.nextReviewAt,
  }));
}

export function getMapEntity(kind: string, id: string): MapEntity | null {
  if (kind === "startup") {
    const data = companiesById.get(id);
    return data ? { kind, data } : null;
  }
  if (kind === "organization") {
    const data = organizationsById.get(id);
    return data
      ? {
          kind,
          data,
          relatedPrograms: programs.filter(
            (program) => program.organizerIds.includes(id) && isLiveProgram(program)
          ),
        }
      : null;
  }
  if (kind === "person") {
    const data = peopleById.get(id);
    return data
      ? {
          kind,
          data,
          organizations: data.organizationIds
            .map((organizationId) => organizationsById.get(organizationId))
            .filter((item): item is EcosystemOrganization => Boolean(item)),
        }
      : null;
  }
  if (kind === "program") {
    const data = programsById.get(id);
    return data
      ? {
          kind,
          data,
          organizers: data.organizerIds
            .map((organizerId) => organizationsById.get(organizerId))
            .filter((item): item is EcosystemOrganization => Boolean(item)),
        }
      : null;
  }
  return null;
}
