import { createReadStream, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";

import type { EcosystemOrganization } from "../src/types/ecosystem";

const CHECKED_AT = "2026-08-24";
const NEXT_REVIEW_AT = "2026-12-22";
const DIRECTORY_URL =
  "https://www.sba.gov/funding-programs/investment-capital/sbic-directory";

const workspace = process.cwd();
const csvPath = process.argv[2] ?? "/tmp/sbic.csv";
const geonamesPath = process.argv[3] ?? "/tmp/geonames-us/US.txt";
const adminCodesPath = process.argv[4] ?? "/tmp/admin1CodesASCII.txt";
const organizationsPath = path.join(
  workspace,
  "src/data/ecosystem/organizations.json",
);

function parseCsv(source: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function domainFor(url: string) {
  return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
}

const operatingNames = new Map<string, string>([
  ["aeroequity.com", "AE Industrial Partners"],
  ["ballastpointventures.com", "Ballast Point Ventures"],
  ["cambridgecapitalmgmt.com", "Cambridge Capital Management"],
  ["canapi.com", "Canapi Ventures"],
  ["cultivationcapital.com", "Cultivation Capital"],
  ["wearefirstin.com", "First In"],
  ["americasfrontier.org", "America's Frontier Fund"],
  ["kvci.com", "Konza Valley Capital"],
  ["lvcpartners.com", "LongueVue Capital"],
  ["onebowriver.com", "ONE Bow River Capital"],
  ["run.vc", "Signal Peak Ventures"],
]);

type SbicRow = Record<string, string>;

async function main() {
  const parsed = parseCsv(readFileSync(csvPath, "utf8"));
  const headers = parsed[0];
  const rows: SbicRow[] = parsed.slice(1).map((values) =>
    Object.fromEntries(values.map((value, index) => [headers[index], value])),
  );

  if (rows.length !== 397) {
    throw new Error(`Expected 397 SBIC vehicles, found ${rows.length}`);
  }

  const includedRows = rows.filter(
    (row) =>
      row["Making New Investments?"] === "Yes" &&
      ["Venture", "Growth Equity"].includes(row["Fund Style"]),
  );
  if (includedRows.length !== 33) {
    throw new Error(`Expected 33 active venture/growth vehicles, found ${includedRows.length}`);
  }

  const stateNames = new Map<string, string>();
  for (const line of readFileSync(adminCodesPath, "utf8").split("\n")) {
    const [code, name] = line.split("\t");
    if (code?.startsWith("US.") && name) stateNames.set(code.slice(3), name);
  }

  const desired = new Map<string, { city: string; stateCode: string }>();
  for (const row of includedRows) {
    desired.set(`${row.City.toLowerCase()}|${row.State}`, {
      city: row.City,
      stateCode: row.State,
    });
  }

  const geocodes = new Map<string, { lat: number; lng: number; population: number }>();
  const lines = createInterface({
    input: createReadStream(geonamesPath),
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    const fields = line.split("\t");
    if (fields[6] !== "P") continue;
    const key = `${fields[1].toLowerCase()}|${fields[10]}`;
    if (!desired.has(key)) continue;
    const candidate = {
      lat: Number(fields[4]),
      lng: Number(fields[5]),
      population: Number(fields[14] || 0),
    };
    const current = geocodes.get(key);
    if (!current || candidate.population > current.population) {
      geocodes.set(key, candidate);
    }
  }

  const grouped = new Map<string, SbicRow[]>();
  for (const row of includedRows) {
    const emailDomain = row["Investor Relations Email"].split("@")[1]?.toLowerCase();
    if (!emailDomain) throw new Error(`Missing institutional email domain for ${row.Name}`);
    const group = grouped.get(emailDomain) ?? [];
    group.push(row);
    grouped.set(emailDomain, group);
  }
  if (grouped.size !== 28) {
    throw new Error(`Expected 28 operating managers, found ${grouped.size}`);
  }

  const organizations = JSON.parse(
    readFileSync(organizationsPath, "utf8"),
  ) as EcosystemOrganization[];
  const byDomain = new Map(
    organizations.map((organization) => [domainFor(organization.website), organization]),
  );
  const knownIds = new Set(organizations.map((organization) => organization.id));
  let created = 0;
  let updated = 0;

  for (const [emailDomain, managerRows] of grouped) {
    const sample = managerRows[0];
    const vehicles = [...new Set(managerRows.map((row) => row.Name))];
    const existing = byDomain.get(emailDomain);
    const sbicEvidence = {
      url: DIRECTORY_URL,
      title: "SBIC directory",
      publisher: "U.S. Small Business Administration",
      sourceClass: "regulator" as const,
      checkedAt: CHECKED_AT,
      supports: [
        "licensed fund vehicles",
        "operating manager",
        "making new investments",
        "fund style",
        "public office city",
      ],
    };

    if (existing) {
      existing.managedVehicles = [...new Set([...existing.managedVehicles, ...vehicles])];
      existing.affiliations = [
        ...new Set([...existing.affiliations, "U.S. SBA SBIC program"]),
      ];
      if (!existing.evidence.some((evidence) => evidence.url === DIRECTORY_URL)) {
        existing.evidence.push(sbicEvidence);
      }
      updated += 1;
      continue;
    }

    const name = operatingNames.get(emailDomain) ?? sample.Manager;
    const baseId = `sbic-${slugify(name)}`;
    let id = baseId;
    let suffix = 2;
    while (knownIds.has(id)) id = `${baseId}-${suffix++}`;
    knownIds.add(id);

    const website = `https://${emailDomain}/`;
    const locationKey = `${sample.City.toLowerCase()}|${sample.State}`;
    const geocode = geocodes.get(locationKey);
    const stateName = stateNames.get(sample.State);
    const averageInvestments = managerRows
      .map((row) => Number(row["Average Investment"]))
      .filter((amount) => Number.isFinite(amount) && amount > 0);
    const amountText = averageInvestments.length
      ? `; the directory reports vehicle average investments from US$${Math.min(...averageInvestments).toLocaleString("en-US")} to US$${Math.max(...averageInvestments).toLocaleString("en-US")}`
      : "";

    organizations.push({
      id,
      kind: "organization",
      name,
      aliases: name === sample.Manager ? [] : [sample.Manager],
      categories: ["vc_firm"],
      description: `${name} manages one or more active SBA-licensed venture or growth-equity SBIC vehicles from ${sample.City}, ${sample.State}${amountText}.`,
      status: "active",
      publicationState: "published",
      website,
      logoUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(emailDomain)}&sz=128`,
      foundedYear: null,
      serviceMarkets: [{ marketCode: "US", serviceMode: geocode ? "physical" : "remote" }],
      sectors: ["sector_agnostic"],
      stages: ["seed", "series_a", "series_b_plus", "growth"],
      supportCapabilities: [],
      investmentThesis:
        "Makes new venture or growth-equity investments through an SBA-licensed Small Business Investment Company vehicle; founders should confirm current fit on the official website.",
      investmentRange: null,
      investmentPreference: null,
      portfolioUrl: null,
      applicationUrl: website,
      contactEmail: sample["Investor Relations Email"],
      linkedinUrl: null,
      affiliations: ["U.S. SBA SBIC program"],
      registrations: [],
      managedVehicles: vehicles,
      locations:
        geocode && stateName
          ? [
              {
                id: `${id}-${slugify(sample.City)}`,
                role: "headquarters",
                label: `${sample.City} public office city`,
                address: null,
                city: sample.City,
                district: null,
                state: stateName,
                postalCode: null,
                marketCode: "US",
                countryCode: "US",
                coordinates: { lat: geocode.lat, lng: geocode.lng },
                precision: "city",
                evidenceUrl: DIRECTORY_URL,
                verifiedAt: CHECKED_AT,
              },
            ]
          : [],
      evidence: [
        sbicEvidence,
        {
          url: website,
          title: `${name} official website`,
          publisher: name,
          sourceClass: "official_website",
          checkedAt: CHECKED_AT,
          supports: ["operating identity", "founder contact path"],
        },
      ],
      lastVerifiedAt: CHECKED_AT,
      nextReviewAt: NEXT_REVIEW_AT,
    });
    created += 1;
  }

  writeFileSync(organizationsPath, `${JSON.stringify(organizations, null, 2)}\n`);
  console.log(
    `Resolved 397 SBIC vehicles: 33 included under 28 managers (${created} created, ${updated} updated), 364 excluded.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
