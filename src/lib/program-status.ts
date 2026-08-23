import type { EcosystemProgram } from "@/types/ecosystem";

export type ProgramStatus = "upcoming" | "open" | "rolling" | "closed";

const UPCOMING_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
const OBSERVED_OPEN_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export function getProgramStatus(
  program: EcosystemProgram,
  now = new Date()
): ProgramStatus {
  if (program.publicationState !== "published") return "closed";
  if (program.rolling) return "rolling";

  const nowMs = now.getTime();
  const opensAt = program.opensAt ? Date.parse(program.opensAt) : null;
  const closesAt = program.applicationCloseAt
    ? Date.parse(program.applicationCloseAt)
    : null;
  const applicationsOpenAsOf = program.applicationsOpenAsOf
    ? Date.parse(`${program.applicationsOpenAsOf}T23:59:59.999Z`)
    : null;

  if (closesAt !== null && nowMs > closesAt) return "closed";
  if (
    applicationsOpenAsOf !== null &&
    (nowMs < applicationsOpenAsOf - 24 * 60 * 60 * 1000 ||
      nowMs > applicationsOpenAsOf + OBSERVED_OPEN_WINDOW_MS)
  ) {
    return "closed";
  }
  if (opensAt !== null && nowMs < opensAt) {
    return opensAt - nowMs <= UPCOMING_WINDOW_MS ? "upcoming" : "closed";
  }
  return "open";
}

export function isLiveProgram(program: EcosystemProgram, now = new Date()) {
  return getProgramStatus(program, now) !== "closed";
}
