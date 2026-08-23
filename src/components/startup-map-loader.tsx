"use client";

import dynamic from "next/dynamic";
import type { CoverageSummary, MapItem } from "@/types/ecosystem";

const StartupMap = dynamic(
  () => import("@/components/startup-map").then((m) => m.StartupMap),
  { ssr: false }
);

export function StartupMapLoader({
  items,
  coverage,
}: {
  items: MapItem[];
  coverage: CoverageSummary[];
}) {
  return <StartupMap items={items} coverage={coverage} />;
}
