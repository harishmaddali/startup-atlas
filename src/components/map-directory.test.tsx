import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapDirectory } from "@/components/map-directory";
import { DEFAULT_MAP_FILTERS } from "@/lib/map-filtering";
import type { MapItem } from "@/types/ecosystem";

const program: MapItem = {
  key: "program:founder-program:market-wide",
  entityId: "founder-program",
  entityKind: "program",
  layers: ["program"],
  subtypes: ["accelerator_cohort"],
  name: "Founder Program",
  aliases: [],
  description: "A source-backed accelerator opportunity.",
  logoUrl: null,
  pin: null,
  marketWideCodes: ["IN"],
  sectors: ["healthcare"],
  stages: ["seed"],
  capabilities: ["mentorship"],
  chequeBand: null,
  deliveryModes: ["remote"],
  programStatus: "rolling",
  searchText: "founder program healthcare",
  lastVerifiedAt: "2026-08-24",
};

describe("MapDirectory", () => {
  it("shows layers, counts, market-wide results, and emits search/filter changes", () => {
    const onFiltersChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <MapDirectory
        allItems={[program]}
        coverage={[]}
        items={[]}
        marketWideItems={[program]}
        totalMatchingPins={0}
        filters={DEFAULT_MAP_FILTERS}
        selectedEntityKey={null}
        hoveredEntityKey={null}
        onFiltersChange={onFiltersChange}
        onSelect={onSelect}
        onHover={() => undefined}
        onMarketZoom={() => undefined}
      />
    );

    expect(screen.getByLabelText("Filter by market")).toHaveTextContent(
      "All marketsIndia"
    );
    expect(screen.queryByRole("option", { name: "Singapore" })).not.toBeInTheDocument();
    expect(screen.getByText("Available market-wide")).toBeInTheDocument();
    expect(screen.getByText("Founder Program")).toBeInTheDocument();
    expect(screen.getByText("0 matching pins")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search the startup ecosystem"), {
      target: { value: "healthcare" },
    });
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ query: "healthcare" })
    );

    fireEvent.click(screen.getByRole("button", { name: /Live programs/i }));
    expect(onFiltersChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ layers: expect.not.arrayContaining(["program"]) })
    );

    fireEvent.click(screen.getByRole("button", { name: /Founder Program/i }));
    expect(onSelect).toHaveBeenCalledWith(program);
  });
});
