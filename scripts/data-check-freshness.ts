import { getProgramStatus } from "../src/lib/program-status";
import { daysBetween, loadData } from "./data-utils";

const data = loadData();
const stale: string[] = [];

for (const organization of data.organizations) {
  if (organization.publicationState === "published" && daysBetween(organization.lastVerifiedAt) > 120) {
    stale.push(`${organization.id}: organization verification is older than 120 days`);
  }
}

for (const person of data.people) {
  if (person.publicationState === "published" && daysBetween(person.lastVerifiedAt) > 120) {
    stale.push(`${person.id}: angel verification is older than 120 days`);
  }
}

for (const program of data.programs) {
  if (getProgramStatus(program) !== "closed" && daysBetween(program.lastVerifiedAt) > 14) {
    stale.push(`${program.id}: live program verification is older than 14 days`);
  }
}

if (stale.length > 0) {
  console.error(stale.map((message) => `- ${message}`).join("\n"));
  process.exit(1);
}

console.log("All published ecosystem records are within their freshness windows.");
