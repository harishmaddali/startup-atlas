"use server";

import companiesData from "@/data/companies.json";
import type { Company } from "@/types/company";
import { companiesSchema } from "@/types/company-schema";

const companies = companiesSchema.parse(companiesData);

export async function getCompanies(): Promise<Company[]> {
  // Compatibility accessor for server code that still needs the startup-only layer.
  // The schema-validated repository JSON remains the sole source of truth.
  return companies satisfies Company[];
}
