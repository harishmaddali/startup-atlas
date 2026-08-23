import { getProgramStatus } from "../src/lib/program-status";
import { loadData } from "./data-utils";

const data = loadData();
const now = new Date();
const livePrograms = data.programs.filter(
  (program) => getProgramStatus(program, now) !== "closed"
);

console.log("Startup Atlas India ecosystem coverage");
console.log(`Organizations: ${data.organizations.filter((item) => item.publicationState === "published").length}`);
console.log(`Active angels: ${data.people.filter((item) => item.publicationState === "published").length}`);
console.log(`Live programs: ${livePrograms.length}`);
console.log("");

for (const area of [...data.coverageAreas].sort((a, b) => a.sequence - b.sequence)) {
  console.log(
    `${area.sequence}. ${area.name}: ${area.status}; ${area.counts.organizations} organizations, ${area.counts.angels} angels, ${area.counts.livePrograms} live programs; ${area.unresolvedLeads} unresolved leads`
  );
}
