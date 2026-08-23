import type { MarketCode } from "@/types/ecosystem";

export interface MarketDefinition {
  code: MarketCode;
  label: string;
  shortLabel: string;
  countryCode: string;
  center: { lat: number; lng: number };
  zoom: number;
}

export const MARKETS: MarketDefinition[] = [
  { code: "IN", label: "India", shortLabel: "India", countryCode: "IN", center: { lat: 22.8, lng: 79.1 }, zoom: 5 },
  { code: "US", label: "United States", shortLabel: "US", countryCode: "US", center: { lat: 39.5, lng: -98.35 }, zoom: 4 },
  { code: "GB", label: "United Kingdom", shortLabel: "UK", countryCode: "GB", center: { lat: 54.5, lng: -3.4 }, zoom: 6 },
  { code: "AE-DU", label: "Dubai", shortLabel: "Dubai", countryCode: "AE", center: { lat: 25.2048, lng: 55.2708 }, zoom: 10 },
  { code: "SG", label: "Singapore", shortLabel: "Singapore", countryCode: "SG", center: { lat: 1.3521, lng: 103.8198 }, zoom: 11 },
  { code: "AU", label: "Australia", shortLabel: "Australia", countryCode: "AU", center: { lat: -25.27, lng: 133.78 }, zoom: 4 },
  { code: "NZ", label: "New Zealand", shortLabel: "New Zealand", countryCode: "NZ", center: { lat: -41.2, lng: 172.5 }, zoom: 5 },
  { code: "IL", label: "Israel", shortLabel: "Israel", countryCode: "IL", center: { lat: 31.7, lng: 34.9 }, zoom: 8 },
];

export const MARKET_BY_CODE = new Map(MARKETS.map((market) => [market.code, market]));

const US_CITY_LABELS = new Set([
  "san francisco",
  "new york city",
  "los angeles",
  "boston",
  "seattle",
  "austin",
  "philadelphia",
  "chicago",
  "miami",
  "denver",
]);

export function marketFromStartupAddress(address: string): {
  marketCode: MarketCode | null;
  countryCode: string | null;
} {
  const normalized = address.trim().toLocaleLowerCase("en");
  const suffix = normalized.split(",").at(-1)?.trim() ?? normalized;

  if (normalized.includes("india")) return { marketCode: "IN", countryCode: "IN" };
  if (normalized.includes("dubai") && normalized.includes("united arab emirates")) {
    return { marketCode: "AE-DU", countryCode: "AE" };
  }
  if (normalized === "singapore") return { marketCode: "SG", countryCode: "SG" };
  if (normalized.includes("australia")) return { marketCode: "AU", countryCode: "AU" };
  if (
    normalized.endsWith(", uk") ||
    normalized === "london" ||
    normalized === "oxford" ||
    normalized === "cambridge"
  ) {
    return { marketCode: "GB", countryCode: "GB" };
  }
  if (normalized.includes("new zealand")) return { marketCode: "NZ", countryCode: "NZ" };
  if (normalized.includes("israel")) return { marketCode: "IL", countryCode: "IL" };
  if (normalized.includes("usa") || US_CITY_LABELS.has(suffix)) {
    return { marketCode: "US", countryCode: "US" };
  }
  return { marketCode: null, countryCode: null };
}

export function marketLabel(code: MarketCode | null) {
  return code ? MARKET_BY_CODE.get(code)?.label ?? code : "Other market";
}
