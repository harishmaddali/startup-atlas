"use server";

import companiesData from "@/data/companies.json";
import type { Company } from "@/types/company";

// The map only shows recent startups worldwide. companies.json retains
// companies of all years so the cutoff can be adjusted without deleting data.
const MIN_YEAR_FOUNDED = 2022;

export async function getCompanies(): Promise<Company[]> {
  // TODO: swap this for a database query (e.g. Prisma) once persistence is added.
  // TODO: read the session (e.g. via next/headers) and filter/authorize here
  // once accounts exist, instead of returning the full dataset to everyone.
  return (companiesData as Company[]).filter(
    (company) => company.yearFounded >= MIN_YEAR_FOUNDED
  );
}
