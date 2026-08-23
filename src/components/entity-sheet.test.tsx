import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EntitySheet } from "@/components/entity-sheet";
import { getMapEntity, getMapItems } from "@/lib/ecosystem-repository";

describe("EntitySheet", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads a full profile on demand and exposes its verified sources", async () => {
    const item = getMapItems().find(
      (candidate) =>
        candidate.entityKind === "organization" && candidate.entityId === "3one4-capital"
    );
    const entity = getMapEntity("organization", "3one4-capital");
    expect(item).toBeDefined();
    expect(entity).not.toBeNull();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => entity,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<EntitySheet item={item!} onClose={() => undefined} />);

    expect(screen.getByText("Loading verified details…")).toBeInTheDocument();
    expect(await screen.findByText("Investment thesis")).toBeInTheDocument();
    expect(screen.getByText(/Sources · verified/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /3one4/i }).length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/map-entities/organization/3one4-capital",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("renders a useful error state when the profile request fails", async () => {
    const item = getMapItems().find((candidate) => candidate.entityKind === "person");
    expect(item).toBeDefined();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(<EntitySheet item={item!} onClose={() => undefined} />);

    expect(await screen.findByText(/could not be loaded/i)).toBeInTheDocument();
  });
});
