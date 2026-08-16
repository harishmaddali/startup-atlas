"use client";

import dynamic from "next/dynamic";

const StartupMap = dynamic(
  () => import("@/components/startup-map").then((m) => m.StartupMap),
  { ssr: false }
);

export function StartupMapLoader() {
  return <StartupMap />;
}
