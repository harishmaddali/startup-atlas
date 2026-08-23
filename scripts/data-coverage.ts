import { getProgramStatus } from "../src/lib/program-status";
import { loadData } from "./data-utils";

const data = loadData();
const now = new Date();
const livePrograms = data.programs.filter(
  (program) => getProgramStatus(program, now) !== "closed"
);

console.log("Startup Atlas target-market ecosystem coverage");
console.log(`Organizations: ${data.organizations.filter((item) => item.publicationState === "published").length}`);
console.log(`Active angels: ${data.people.filter((item) => item.publicationState === "published").length}`);
console.log(`Live programs: ${livePrograms.length}`);
console.log("");

for (const area of [...data.coverageAreas].sort(
  (a, b) => a.marketCode.localeCompare(b.marketCode) || a.sequence - b.sequence
)) {
  console.log(
    `${area.marketCode} ${area.sequence}. ${area.name}: ${area.status}; ${area.counts.organizations} organizations, ${area.counts.angels} angels, ${area.counts.livePrograms} live programs; ${area.unresolvedLeads} unresolved leads`
  );
}
