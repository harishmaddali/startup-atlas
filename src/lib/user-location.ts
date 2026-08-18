import type { LatLng } from "@/lib/geo";

const INITIAL_MAP_VIEW_KEY = "startup-atlas:initial-map-view";

export function hasInitialMapView(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(INITIAL_MAP_VIEW_KEY) === "1";
  } catch {
    return true;
  }
}

export function markInitialMapViewSet(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INITIAL_MAP_VIEW_KEY, "1");
  } catch {
    // Ignore quota / private-mode errors.
  }
}

/**
 * City-level approximate coordinates from the visitor's public IP.
 * No browser permission prompt — suitable for a silent first-visit center.
 */
export async function fetchApproximateUserLocation(): Promise<LatLng | null> {
  try {
    const response = await fetch("https://ipwho.is/", {
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      success?: boolean;
      latitude?: number;
      longitude?: number;
    };

    if (
      data.success &&
      typeof data.latitude === "number" &&
      typeof data.longitude === "number"
    ) {
      return { lat: data.latitude, lng: data.longitude };
    }
  } catch {
    // Network, timeout, or blocked third-party request — fall back to world view.
  }

  return null;
}
