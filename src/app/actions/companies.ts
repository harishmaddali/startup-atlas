"use server";

import companiesData from "@/data/companies.json";
import type { Company } from "@/types/company";

// Worldwide, the map only shows recent startups. India is the exception:
// the historical YC set (after verified shutdown removals) and independently
// verified ecosystem additions are shown, so cities without a dedicated YC
// location page still appear. companies.json retains companies of all years.
const MIN_YEAR_FOUNDED = 2022;

function isIndiaCompany(company: Company): boolean {
  return /(?:^|,\s*)India$/i.test(company.address.trim());
}

export async function getCompanies(): Promise<Company[]> {
  // TODO: swap this for a database query (e.g. Prisma) once persistence is added.
  // TODO: read the session (e.g. via next/headers) and filter/authorize here
  // once accounts exist, instead of returning the full dataset to everyone.
  return (companiesData as Company[]).filter(
    (c) => c.yearFounded >= MIN_YEAR_FOUNDED || isIndiaCompany(c)
  );
}
