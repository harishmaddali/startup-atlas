import { describe, expect, it } from "vitest";
import programsJson from "@/data/ecosystem/programs.json";
import { getProgramStatus, isLiveProgram } from "@/lib/program-status";
import { ecosystemProgramsSchema, type EcosystemProgram } from "@/types/ecosystem";

const baseProgram = ecosystemProgramsSchema.parse(programsJson)[0];

function program(overrides: Partial<EcosystemProgram>): EcosystemProgram {
  return { ...baseProgram, ...overrides };
}

describe("program status", () => {
  it("keeps a fixed-deadline program open through the exact closing instant", () => {
    const subject = program({
      rolling: false,
      opensAt: "2026-08-01T00:00:00+05:30",
      applicationCloseAt: "2026-08-24T23:59:00+05:30",
    });

    expect(getProgramStatus(subject, new Date("2026-08-24T18:29:00Z"))).toBe("open");
    expect(getProgramStatus(subject, new Date("2026-08-24T18:29:00.001Z"))).toBe("closed");
  });

  it("only exposes an upcoming program inside the 90-day window", () => {
    const subject = program({
      rolling: false,
      opensAt: "2026-11-22T00:00:00+05:30",
      applicationCloseAt: "2026-12-01T23:59:00+05:30",
    });

    expect(getProgramStatus(subject, new Date("2026-08-24T00:00:00+05:30"))).toBe("upcoming");
    expect(getProgramStatus(subject, new Date("2026-08-23T23:59:59+05:30"))).toBe("closed");
  });

  it("treats published rolling programs as live", () => {
    const subject = program({ rolling: true, opensAt: null, applicationCloseAt: null });
    expect(getProgramStatus(subject)).toBe("rolling");
    expect(isLiveProgram(subject)).toBe(true);
  });

  it("does not expose archived records", () => {
    expect(getProgramStatus(program({ publicationState: "archived", rolling: true }))).toBe("closed");
  });
});
