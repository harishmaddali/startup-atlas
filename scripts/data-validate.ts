import { loadData, daysBetween } from "./data-utils";

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

const organizationIds = new Set(data.organizations.map((item) => item.id));
const locationIds = data.organizations.flatMap((organization) =>
  organization.locations.map((location) => location.id)
);
for (const duplicate of duplicates(locationIds)) {
  errors.push(`Duplicate location id: ${duplicate}`);
}
const knownLocationIds = new Set(locationIds);

for (const program of data.programs) {
  for (const organizerId of program.organizerIds) {
    if (!organizationIds.has(organizerId)) {
      errors.push(`${program.id}: unknown organizer ${organizerId}`);
    }
  }
  for (const locationId of program.locationIds) {
    if (!knownLocationIds.has(locationId)) {
      errors.push(`${program.id}: unknown location ${locationId}`);
    }
  }
}

for (const person of data.people) {
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
}

for (const coverageArea of data.coverageAreas) {
  if (coverageArea.status === "published" && coverageArea.unresolvedLeads > 0) {
    errors.push(`${coverageArea.id}: published coverage area still has unresolved leads`);
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${data.companies.length} startups, ${data.researchQueue.length} queued startup leads, ${data.organizations.length} organizations, ${data.people.length} angels, ${data.programs.length} programs, and ${data.coverageAreas.length} coverage areas.`
);
