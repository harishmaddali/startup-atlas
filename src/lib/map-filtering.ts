import type { MapItem, MapLayer, StartupStage } from "@/types/ecosystem";

export const ALL_LAYERS: MapLayer[] = [
  "startup",
  "investor",
  "support",
  "angel",
  "program",
];

export interface MapFilters {
  query: string;
  layers: MapLayer[];
  sector: string;
  stage: StartupStage | "";
  city: string;
  state: string;
  subtype: string;
  capability: string;
  chequeBand: MapItem["chequeBand"] | "";
  deliveryMode: MapItem["deliveryModes"][number] | "";
  programStatus: NonNullable<MapItem["programStatus"]> | "";
}

export const DEFAULT_MAP_FILTERS: MapFilters = {
  query: "",
  layers: ALL_LAYERS,
  sector: "",
  stage: "",
  city: "",
  state: "",
  subtype: "",
  capability: "",
  chequeBand: "",
  deliveryMode: "",
  programStatus: "",
};

export function matchesMapFilters(item: MapItem, filters: MapFilters) {
  if (!item.layers.some((layer) => filters.layers.includes(layer))) return false;
  if (
    filters.query &&
    !item.searchText.includes(filters.query.trim().toLocaleLowerCase("en-IN"))
  ) {
    return false;
  }
  if (filters.sector && !item.sectors.includes(filters.sector)) return false;
  if (filters.stage && !item.stages.includes(filters.stage)) return false;
  if (filters.city && item.pin?.city !== filters.city) return false;
  if (filters.state && item.pin?.state !== filters.state) return false;
  if (filters.subtype && !item.subtypes.includes(filters.subtype)) return false;
  if (filters.capability && !item.capabilities.includes(filters.capability)) return false;
  if (filters.chequeBand && item.chequeBand !== filters.chequeBand) return false;
  if (filters.deliveryMode && !item.deliveryModes.includes(filters.deliveryMode)) return false;
  if (filters.programStatus && item.programStatus !== filters.programStatus) return false;
  return true;
}

export function entityKey(item: Pick<MapItem, "entityKind" | "entityId">) {
  return `${item.entityKind}:${item.entityId}`;
}

export function uniqueEntities(items: MapItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = entityKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function primaryLayer(item: MapItem): MapLayer {
  return item.layers[0] ?? "startup";
}

export function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
