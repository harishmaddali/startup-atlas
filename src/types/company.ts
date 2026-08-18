export interface Founder {
  name: string;
  /** Founder's own LinkedIn profile, when known -- not researched for every company yet. */
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  contactEmail: string | null;
  founders: Founder[];
  yearFounded: number;
  logoUrl: string | null;
  /** YC batch label when applicable, e.g. "S22". */
  ycBatch?: string;
  website?: string;
  description?: string;
  /** Company status at time of data collection, e.g. "Active", "Public", "Acquired". */
  status?: string;
  /**
   * "verified" = confirmed HQ/office from a primary or authoritative source.
   * "approximate" = city/area-level placement; exact street address not publicly listed.
   */
  dataConfidence: "verified" | "approximate";
}
