"use client";

import dynamic from "next/dynamic";
import type { Company } from "@/types/company";

const StartupMap = dynamic(
  () => import("@/components/startup-map").then((m) => m.StartupMap),
  { ssr: false }
);

export function StartupMapLoader({ companies }: { companies: Company[] }) {
  return <StartupMap companies={companies} />;
}
