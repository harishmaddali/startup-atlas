"use server";

import companiesData from "@/data/companies.json";
import type { Company } from "@/types/company";

export async function getCompanies(): Promise<Company[]> {
  // TODO: swap this for a database query (e.g. Prisma) once persistence is added.
  // TODO: read the session (e.g. via next/headers) and filter/authorize here
  // once accounts exist, instead of returning the full dataset to everyone.
  return companiesData as Company[];
}
