import { describe, expect, it } from "vitest";
import {
  DEFAULT_MAP_FILTERS,
  entityKey,
  matchesMapFilters,
  uniqueEntities,
} from "@/lib/map-filtering";
import {
  companies,
  getCoverageSummaries,
  getMapItemsForMarket,
} from "@/lib/ecosystem-repository";
import { marketFromStartupAddress } from "@/lib/markets";
import type { MapItem } from "@/types/ecosystem";

const item: MapItem = {
  key: "program:sample:location",
  entityId: "sample",
  entityKind: "program",
  layers: ["program"],
  subtypes: ["accelerator_cohort"],
  name: "Sample Climate Cohort",
  aliases: ["SCC"],
  description: "A sample founder program.",
  logoUrl: null,
  pin: {
    locationId: "location",
    label: "Campus",
    lat: 12.9,
    lng: 77.6,
    precision: "building",
    city: "Bengaluru",
    state: "Karnataka",
    marketCode: "IN",
    countryCode: "IN",
  },
  marketWideCodes: ["IN"],
  sectors: ["climate"],
  stages: ["seed"],
  capabilities: ["market_access"],
  chequeBand: "50k_250k_usd",
  deliveryModes: ["hybrid"],
  programStatus: "open",
  searchText: "sample climate cohort scc bengaluru",
  lastVerifiedAt: "2026-08-24",
};

describe("map filtering", () => {
  it("combines text, layer, geography, fit, delivery, and status facets", () => {
    expect(
      matchesMapFilters(item, {
        ...DEFAULT_MAP_FILTERS,
        query: "SCC",
        layers: ["program"],
        market: "IN",
        city: "Bengaluru",
        state: "Karnataka",
        sector: "climate",
        stage: "seed",
        subtype: "accelerator_cohort",
        capability: "market_access",
        chequeBand: "50k_250k_usd",
        deliveryMode: "hybrid",
        programStatus: "open",
      })
    ).toBe(true);
  });

  it("rejects a mismatch in any active facet", () => {
    expect(matchesMapFilters(item, { ...DEFAULT_MAP_FILTERS, city: "Mumbai" })).toBe(false);
    expect(matchesMapFilters(item, { ...DEFAULT_MAP_FILTERS, market: "US" })).toBe(false);
    expect(matchesMapFilters(item, { ...DEFAULT_MAP_FILTERS, programStatus: "upcoming" })).toBe(false);
  });

  it("deduplicates multiple pins into one profile card", () => {
    const secondPin = { ...item, key: "program:sample:second-location" };
    expect(uniqueEntities([item, secondPin])).toEqual([item]);
    expect(entityKey(item)).toBe("program:sample");
  });
});

describe("market-scoped map data", () => {
  it("returns only India pins and India-wide unpinned entries", () => {
    const items = getMapItemsForMarket("IN", new Date("2026-08-26T00:00:00.000Z"));

    expect(items.length).toBeGreaterThan(0);
    expect(
      items.every((entry) =>
        entry.pin
          ? entry.pin.marketCode === "IN"
          : entry.marketWideCodes.includes("IN")
      )
    ).toBe(true);
  });

  it("keeps the full startup dataset while selecting India records for the map", () => {
    expect(
      companies.some(
        (company) => marketFromStartupAddress(company.address).marketCode !== "IN"
      )
    ).toBe(true);
    expect(
      getMapItemsForMarket("IN").filter((entry) => entry.entityKind === "startup")
    ).toHaveLength(
      companies.filter(
        (company) => marketFromStartupAddress(company.address).marketCode === "IN"
      ).length
    );
  });

  it("limits coverage summaries to India", () => {
    expect(getCoverageSummaries("IN")).not.toHaveLength(0);
    expect(
      getCoverageSummaries("IN").every((area) => area.marketCode === "IN")
    ).toBe(true);
  });
});
