import companiesJson from "../src/data/companies.json";
import organizationsJson from "../src/data/ecosystem/organizations.json";
import peopleJson from "../src/data/ecosystem/people.json";
import programsJson from "../src/data/ecosystem/programs.json";
import coverageJson from "../src/data/ecosystem/coverage.json";
import researchQueueJson from "../src/data/research-queue.json";
import { companiesSchema, researchQueueSchema } from "../src/types/company-schema";
import {
  coverageAreasSchema,
  ecosystemOrganizationsSchema,
  ecosystemPeopleSchema,
  ecosystemProgramsSchema,
} from "../src/types/ecosystem";

export function loadData() {
  return {
    companies: companiesSchema.parse(companiesJson),
    organizations: ecosystemOrganizationsSchema.parse(organizationsJson),
    people: ecosystemPeopleSchema.parse(peopleJson),
    programs: ecosystemProgramsSchema.parse(programsJson),
    coverageAreas: coverageAreasSchema.parse(coverageJson),
    researchQueue: researchQueueSchema.parse(researchQueueJson),
  };
}

export function daysBetween(earlier: string, later = new Date()) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(earlier)
    ? new Date(`${earlier}T23:59:59Z`)
    : new Date(earlier);
  return Math.floor((later.getTime() - date.getTime()) / 86_400_000);
}
