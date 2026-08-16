"use server";

import companiesData from "@/data/companies.json";
import type { Company } from "@/types/company";

// Worldwide, the map only shows recent startups. India is the exception:
// every YC company headquartered there is shown, so cities without a
// dedicated YC location page (Chennai, Kolkata, Surat, etc.) still appear.
// companies.json keeps the full historical dataset regardless.
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
