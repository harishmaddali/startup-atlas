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
    expect(ecosystemOrganizationsSchema.parse(organizationsJson)).toHaveLength(14);
    expect(ecosystemPeopleSchema.parse(peopleJson)).toHaveLength(3);
    expect(ecosystemProgramsSchema.parse(programsJson)).toHaveLength(6);
  });

  it("rejects out-of-India coordinates and missing evidence", () => {
    const organization = structuredClone(organizationsJson[0]);
    organization.locations[0].coordinates.lat = 51.5;
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
});
