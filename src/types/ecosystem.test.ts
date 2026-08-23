import { describe, expect, it } from "vitest";
import organizationsJson from "@/data/ecosystem/organizations.json";
import peopleJson from "@/data/ecosystem/people.json";
import programsJson from "@/data/ecosystem/programs.json";
import {
  ecosystemOrganizationSchema,
  ecosystemOrganizationsSchema,
  ecosystemPeopleSchema,
  ecosystemProgramSchema,
  ecosystemProgramsSchema,
} from "@/types/ecosystem";

describe("ecosystem schemas", () => {
  it("accepts every committed organization, angel, and program", () => {
    expect(ecosystemOrganizationsSchema.parse(organizationsJson)).toHaveLength(
      organizationsJson.length
    );
    expect(ecosystemPeopleSchema.parse(peopleJson)).toHaveLength(peopleJson.length);
    expect(ecosystemProgramsSchema.parse(programsJson)).toHaveLength(programsJson.length);
  });

  it("rejects out-of-range coordinates and missing evidence", () => {
    const organization = structuredClone(
      ecosystemOrganizationSchema.parse(organizationsJson[0])
    );
    organization.locations[0].coordinates.lat = 95;
    organization.evidence = [];
    expect(ecosystemOrganizationSchema.safeParse(organization).success).toBe(false);
  });

  it("rejects private angel contact fields", () => {
    const angel = { ...structuredClone(peopleJson[0]), personalPhone: "+91 99999 99999" };
    expect(ecosystemPeopleSchema.safeParse([angel]).success).toBe(false);
  });

  it("rejects rolling programs that also publish a fixed deadline", () => {
    const program = { ...structuredClone(programsJson[0]), rolling: true };
    expect(ecosystemProgramSchema.safeParse(program).success).toBe(false);
  });

  it("accepts a recently observed open call without mislabeling it as rolling", () => {
    const program = {
      ...structuredClone(programsJson[0]),
      rolling: false,
      opensAt: null,
      applicationCloseAt: null,
      applicationsOpenAsOf: "2026-08-24",
    };
    expect(ecosystemProgramSchema.safeParse(program).success).toBe(true);
  });
});
