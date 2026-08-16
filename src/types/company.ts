export interface Company {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  contactEmail: string | null;
  founders: string[];
  yearFounded: number;
  logoUrl: string;
  /** YC batch label, e.g. "S22" */
  ycBatch?: string;
  website?: string;
  description?: string;
  /** YC status at time of data collection, e.g. "Active", "Public", "Acquired" */
  status?: string;
  /**
   * "verified" = confirmed HQ/office location from primary source (YC profile).
   * "approximate" = city/area-level placement; exact street address not publicly listed.
   */
  dataConfidence: "verified" | "approximate";
}
