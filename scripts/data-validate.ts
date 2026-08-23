import { loadData, daysBetween } from "./data-utils";
import { isLiveProgram } from "../src/lib/program-status";

const data = loadData();
const errors: string[] = [];

function duplicates(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  });
}

for (const duplicate of duplicates(data.companies.map((item) => item.id))) {
  errors.push(`Duplicate startup id: ${duplicate}`);
}
for (const duplicate of duplicates(data.researchQueue.map((item) => item.id))) {
  errors.push(`Duplicate research queue id: ${duplicate}`);
}
const publishedStartupIds = new Set(data.companies.map((item) => item.id));
for (const queuedItem of data.researchQueue) {
  if (publishedStartupIds.has(queuedItem.id)) {
    errors.push(`${queuedItem.id}: startup cannot be both published and in the research queue`);
  }
}
for (const duplicate of duplicates(data.organizations.map((item) => item.id))) {
  errors.push(`Duplicate organization id: ${duplicate}`);
}
for (const duplicate of duplicates(data.people.map((item) => item.id))) {
  errors.push(`Duplicate person id: ${duplicate}`);
}
for (const duplicate of duplicates(data.programs.map((item) => item.id))) {
  errors.push(`Duplicate program id: ${duplicate}`);
}
for (const duplicate of duplicates(data.coverageAreas.map((item) => item.id))) {
  errors.push(`Duplicate coverage area id: ${duplicate}`);
}

const organizationIds = new Set(data.organizations.map((item) => item.id));
const locationIds = data.organizations.flatMap((organization) =>
  organization.locations.map((location) => location.id)
);
for (const duplicate of duplicates(locationIds)) {
  errors.push(`Duplicate location id: ${duplicate}`);
}
const knownLocationIds = new Set(locationIds);

for (const organization of data.organizations) {
  const serviceMarketCodes = organization.serviceMarkets.map(
    (market) => market.marketCode
  );
  for (const duplicate of duplicates(serviceMarketCodes)) {
    errors.push(`${organization.id}: duplicate service market ${duplicate}`);
  }
  for (const location of organization.locations) {
    if (!serviceMarketCodes.includes(location.marketCode)) {
      errors.push(`${organization.id}: location ${location.id} is outside its service markets`);
    }
  }
}

for (const program of data.programs) {
  for (const duplicate of duplicates(program.eligibleMarketCodes)) {
    errors.push(`${program.id}: duplicate eligible market ${duplicate}`);
  }
  for (const organizerId of program.organizerIds) {
    if (!organizationIds.has(organizerId)) {
      errors.push(`${program.id}: unknown organizer ${organizerId}`);
    }
  }
  for (const locationId of program.locationIds) {
    if (!knownLocationIds.has(locationId)) {
      errors.push(`${program.id}: unknown location ${locationId}`);
    }
    const location = data.organizations
      .flatMap((organization) => organization.locations)
      .find((candidate) => candidate.id === locationId);
    if (location && !program.eligibleMarketCodes.includes(location.marketCode)) {
      errors.push(`${program.id}: location ${locationId} is outside its eligible markets`);
    }
  }
}

for (const person of data.people) {
  const serviceMarketCodes = person.serviceMarkets.map(
    (market) => market.marketCode
  );
  for (const duplicate of duplicates(serviceMarketCodes)) {
    errors.push(`${person.id}: duplicate service market ${duplicate}`);
  }
  for (const organizationId of person.organizationIds) {
    if (!organizationIds.has(organizationId)) {
      errors.push(`${person.id}: unknown organization ${organizationId}`);
    }
  }
  if (person.publicationState === "published" && daysBetween(person.lastInvestmentActivityAt) > 730) {
    errors.push(`${person.id}: angel activity is older than 24 months`);
  }
  if (person.professionalLocation?.address) {
    errors.push(`${person.id}: angels may only publish professional city-level locations`);
  }
  if (
    person.professionalLocation &&
    !serviceMarketCodes.includes(person.professionalLocation.marketCode)
  ) {
    errors.push(`${person.id}: professional location is outside service markets`);
  }
}

for (const coverageArea of data.coverageAreas) {
  const deferredLeads = coverageArea.leadBatches.reduce(
    (sum, batch) => sum + batch.deferredCount,
    0
  );
  if (
    coverageArea.leadBatches.length > 0 &&
    deferredLeads !== coverageArea.unresolvedLeads
  ) {
    errors.push(
      `${coverageArea.id}: unresolvedLeads ${coverageArea.unresolvedLeads} does not match deferred batch total ${deferredLeads}`
    );
  }
  for (const batch of coverageArea.leadBatches) {
    const outcomes = batch.includedCount + batch.excludedCount + batch.deferredCount;
    if (outcomes !== batch.discoveredCount) {
      errors.push(
        `${coverageArea.id}: ${batch.label} outcomes ${outcomes} do not match discovered ${batch.discoveredCount}`
      );
    }
  }
  if (coverageArea.status === "published" && coverageArea.unresolvedLeads > 0) {
    errors.push(`${coverageArea.id}: published coverage area still has unresolved leads`);
  }

  if (
    coverageArea.marketCode !== "IN" &&
    ["emirate", "national_cluster"].includes(coverageArea.scope) &&
    coverageArea.lastSweepAt
  ) {
    const snapshotAt = new Date(`${coverageArea.lastSweepAt}T12:00:00Z`);
    const expectedCounts = {
      organizations: data.organizations.filter(
        (organization) =>
          organization.status === "active" &&
          organization.publicationState === "published" &&
          organization.serviceMarkets.some(
            (market) => market.marketCode === coverageArea.marketCode
          )
      ).length,
      angels: data.people.filter(
        (person) =>
          person.publicationState === "published" &&
          person.serviceMarkets.some(
            (market) => market.marketCode === coverageArea.marketCode
          )
      ).length,
      livePrograms: data.programs.filter(
        (program) =>
          program.eligibleMarketCodes.includes(coverageArea.marketCode) &&
          isLiveProgram(program, snapshotAt)
      ).length,
    };

    for (const category of ["organizations", "angels", "livePrograms"] as const) {
      if (coverageArea.counts[category] !== expectedCounts[category]) {
        errors.push(
          `${coverageArea.id}: ${category} count ${coverageArea.counts[category]} does not match ${expectedCounts[category]} published at the ${coverageArea.lastSweepAt} snapshot`
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${data.companies.length} startups, ${data.researchQueue.length} queued startup leads, ${data.organizations.length} organizations, ${data.people.length} angels, ${data.programs.length} programs, and ${data.coverageAreas.length} coverage areas.`
);
