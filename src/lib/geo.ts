export type LatLng = { lat: number; lng: number };

export const HYDERABAD_CENTER: LatLng = { lat: 17.385, lng: 78.4867 };
export const INDIA_CENTER: LatLng = { lat: 22.8, lng: 79.1 };
export const INDIA_DEFAULT_ZOOM = 5;

/** Default map view: zoomed out enough to show every covered region at once. */
export const WORLD_CENTER: LatLng = { lat: 20, lng: 10 };
export const WORLD_DEFAULT_ZOOM = 2;

/** City-level zoom when centering on a first-time visitor's approximate location. */
export const USER_LOCATION_ZOOM = 9;
