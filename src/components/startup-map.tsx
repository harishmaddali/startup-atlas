"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AttributionControl,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { LatLngBounds } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { AnimatePresence, motion } from "motion/react";
import { ListFilter, MapPinned } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { EntitySheet } from "@/components/entity-sheet";
import { MapDirectory } from "@/components/map-directory";
import {
  ALL_LAYERS,
  DEFAULT_MAP_FILTERS,
  entityKey,
  matchesMapFilters,
  primaryLayer,
  uniqueEntities,
  type MapFilters,
} from "@/lib/map-filtering";
import {
  USER_LOCATION_ZOOM,
  WORLD_CENTER,
  WORLD_DEFAULT_ZOOM,
} from "@/lib/geo";
import { MARKETS, MARKET_BY_CODE } from "@/lib/markets";
import {
  fetchApproximateUserLocation,
  hasInitialMapView,
  markInitialMapViewSet,
} from "@/lib/user-location";
import type { CoverageSummary, MapItem, MapLayer, MarketCode, StartupStage } from "@/types/ecosystem";

const LIST_CAP = 200;
const LIGHT_TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const DARK_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const VALID_CHEQUE_BANDS = ["under_50k_usd", "50k_250k_usd", "250k_1m_usd", "1m_plus_usd"] as const;
const VALID_MARKETS = MARKETS.map((market) => market.code);
const VALID_STAGES: StartupStage[] = [
  "idea",
  "pre_seed",
  "seed",
  "series_a",
  "series_b_plus",
  "growth",
];

const markerPresentation: Record<
  MapLayer,
  { color: string; radius: string; glyph: string }
> = {
  startup: { color: "#2563eb", radius: "9999px", glyph: "S" },
  investor: { color: "#7c3aed", radius: "7px", glyph: "$" },
  support: { color: "#0f766e", radius: "2px", glyph: "+" },
  angel: { color: "#d97706", radius: "9999px", glyph: "A" },
  program: { color: "#059669", radius: "9px 2px 9px 2px", glyph: "P" },
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] ?? character
  );
}

const iconCache = new Map<string, L.DivIcon>();

function getMarkerIcon(item: MapItem, isActive: boolean) {
  const layer = primaryLayer(item);
  const presentation = markerPresentation[layer];
  const key = `${item.key}:${layer}:${isActive ? 1 : 0}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const size = isActive ? 48 : 38;
  const borderWidth = isActive ? 4 : 3;
  const inner = item.logoUrl
    ? `<img src="${escapeHtml(item.logoUrl)}" alt="" style="width:100%;height:100%;object-fit:contain;padding:${Math.round(size * 0.11)}px;box-sizing:border-box;background:white;" />`
    : `<span style="font-size:${Math.round(size * 0.36)}px;font-weight:800;color:${presentation.color};">${escapeHtml(presentation.glyph)}</span>`;

  const icon = L.divIcon({
    className: "",
    html: `<span role="img" aria-label="${escapeHtml(layer)}: ${escapeHtml(item.name)}" style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:${presentation.radius};background:#fff;border:${borderWidth}px solid ${presentation.color};box-shadow:${isActive ? `0 0 0 4px ${presentation.color}35,0 5px 15px rgba(0,0,0,.32)` : "0 2px 7px rgba(0,0,0,.28)"};overflow:hidden;transform:${layer === "investor" ? "rotate(45deg)" : "none"};"><span style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;transform:${layer === "investor" ? "rotate(-45deg)" : "none"};">${inner}</span></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  iconCache.set(key, icon);
  return icon;
}

function clusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count < 25 ? 48 : count < 100 ? 56 : 66;
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:#18181b;color:#fff;border:3px solid #fff;box-shadow:0 0 0 2px rgba(24,24,27,.3),0 2px 8px rgba(0,0,0,.35);font-size:${size <= 48 ? 14 : 16}px;font-weight:700;">${count}</span>`,
    iconSize: [size, size],
  });
}

function InitialViewController() {
  const map = useMap();

  useEffect(() => {
    if (hasInitialMapView()) return;
    let cancelled = false;
    void (async () => {
      const location = await fetchApproximateUserLocation();
      if (cancelled) return;
      if (location) {
        map.flyTo([location.lat, location.lng], USER_LOCATION_ZOOM, { duration: 1.2 });
      }
      markInitialMapViewSet();
    })();
    return () => {
      cancelled = true;
    };
  }, [map]);

  return null;
}

function MapController({
  selected,
  marketZoomRequest,
  onBoundsChange,
}: {
  selected: MapItem | null;
  marketZoomRequest: { sequence: number; marketCode: MarketCode };
  onBoundsChange: (bounds: LatLngBounds) => void;
}) {
  const map = useMapEvents({ moveend: () => onBoundsChange(map.getBounds()) });

  useEffect(() => {
    map.invalidateSize();
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  useEffect(() => {
    if (!selected?.pin) return;
    map.flyTo([selected.pin.lat, selected.pin.lng], 13, { duration: 0.8 });
  }, [map, selected]);

  useEffect(() => {
    if (marketZoomRequest.sequence === 0) return;
    const market = MARKET_BY_CODE.get(marketZoomRequest.marketCode);
    if (!market) return;
    map.flyTo([market.center.lat, market.center.lng], market.zoom, {
      duration: 0.9,
    });
  }, [marketZoomRequest, map]);

  return null;
}

function initialFilters(): MapFilters {
  if (typeof window === "undefined") return DEFAULT_MAP_FILTERS;
  const params = new URLSearchParams(window.location.search);
  const requestedLayers = (params.get("layers") ?? "")
    .split(",")
    .filter((layer): layer is MapLayer => ALL_LAYERS.includes(layer as MapLayer));
  const requestedStage = params.get("stage") ?? "";
  const requestedChequeBand = params.get("cheque") ?? "";
  const requestedMarket = params.get("market") ?? "";

  return {
    query: params.get("search") ?? "",
    layers: requestedLayers.length > 0 ? requestedLayers : ALL_LAYERS,
    market: VALID_MARKETS.includes(requestedMarket as MarketCode)
      ? (requestedMarket as MarketCode)
      : "",
    sector: params.get("sector") ?? "",
    stage: VALID_STAGES.includes(requestedStage as StartupStage)
      ? (requestedStage as StartupStage)
      : "",
    city: params.get("city") ?? "",
    state: params.get("state") ?? "",
    subtype: params.get("type") ?? "",
    capability: params.get("support") ?? "",
    chequeBand: VALID_CHEQUE_BANDS.includes(
      requestedChequeBand as (typeof VALID_CHEQUE_BANDS)[number]
    )
      ? (requestedChequeBand as (typeof VALID_CHEQUE_BANDS)[number])
      : "",
    deliveryMode: (["onsite", "hybrid", "remote"] as const).includes(
      params.get("delivery") as "onsite" | "hybrid" | "remote"
    )
      ? (params.get("delivery") as "onsite" | "hybrid" | "remote")
      : "",
    programStatus: (["open", "rolling", "upcoming"] as const).includes(
      params.get("status") as "open" | "rolling" | "upcoming"
    )
      ? (params.get("status") as "open" | "rolling" | "upcoming")
      : "",
  };
}

function selectedFromUrl(items: MapItem[]) {
  if (typeof window === "undefined") return null;
  const selectedKey = new URLSearchParams(window.location.search).get("entity");
  return selectedKey
    ? items.find((item) => entityKey(item) === selectedKey) ?? null
    : null;
}

function syncUrl(filters: MapFilters, selected: MapItem | null) {
  const params = new URLSearchParams();
  if (filters.query) params.set("search", filters.query);
  if (filters.layers.length !== ALL_LAYERS.length) params.set("layers", filters.layers.join(","));
  if (filters.market) params.set("market", filters.market);
  if (filters.sector) params.set("sector", filters.sector);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.city) params.set("city", filters.city);
  if (filters.state) params.set("state", filters.state);
  if (filters.subtype) params.set("type", filters.subtype);
  if (filters.capability) params.set("support", filters.capability);
  if (filters.chequeBand) params.set("cheque", filters.chequeBand);
  if (filters.deliveryMode) params.set("delivery", filters.deliveryMode);
  if (filters.programStatus) params.set("status", filters.programStatus);
  if (selected) params.set("entity", entityKey(selected));
  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

export function StartupMap({
  items,
  coverage,
}: {
  items: MapItem[];
  coverage: CoverageSummary[];
}) {
  const { resolvedTheme } = useTheme();
  const tileUrl = resolvedTheme === "dark" ? DARK_TILE_URL : LIGHT_TILE_URL;
  const [filters, setFilters] = useState<MapFilters>(initialFilters);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [selected, setSelected] = useState<MapItem | null>(() => selectedFromUrl(items));
  const [hoveredEntityKey, setHoveredEntityKey] = useState<string | null>(null);
  const [mobileDirectoryOpen, setMobileDirectoryOpen] = useState(false);
  const [marketZoomRequest, setMarketZoomRequest] = useState<{
    sequence: number;
    marketCode: MarketCode;
  }>({ sequence: 0, marketCode: "IN" });

  useEffect(() => {
    syncUrl(filters, selected);
  }, [filters, selected]);

  const matching = useMemo(
    () => items.filter((item) => matchesMapFilters(item, filters)),
    [filters, items]
  );
  const matchingPins = useMemo(
    () => matching.filter((item): item is MapItem & { pin: NonNullable<MapItem["pin"]> } => Boolean(item.pin)),
    [matching]
  );
  const inView = useMemo(
    () =>
      bounds
        ? matchingPins.filter((item) => bounds.contains([item.pin.lat, item.pin.lng]))
        : matchingPins,
    [bounds, matchingPins]
  );
  const visible = useMemo(() => uniqueEntities(inView).slice(0, LIST_CAP), [inView]);
  const visibleEntityKeys = useMemo(() => new Set(visible.map(entityKey)), [visible]);
  const marketWideItems = useMemo(
    () =>
      uniqueEntities(
        matching.filter(
          (item) =>
            item.marketWideCodes.length > 0 &&
            (!filters.market || item.marketWideCodes.includes(filters.market)) &&
            !visibleEntityKeys.has(entityKey(item))
        )
      ).slice(0, LIST_CAP),
    [filters.market, matching, visibleEntityKeys]
  );

  const selectItem = useCallback((item: MapItem) => {
    setSelected(item);
    setMobileDirectoryOpen(false);
  }, []);
  const closeEntity = useCallback(() => setSelected(null), []);
  const setMapBounds = useCallback((nextBounds: LatLngBounds) => setBounds(nextBounds), []);

  const directoryProps = {
    allItems: items,
    coverage,
    items: visible,
    marketWideItems,
    totalMatchingPins: matchingPins.length,
    filters,
    selectedEntityKey: selected ? entityKey(selected) : null,
    hoveredEntityKey,
    onFiltersChange: setFilters,
    onSelect: selectItem,
    onHover: setHoveredEntityKey,
    onMarketZoom: (marketCode: MarketCode) =>
      setMarketZoomRequest((request) => ({
        sequence: request.sequence + 1,
        marketCode,
      })),
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <aside className="z-10 hidden h-full min-h-0 w-[26rem] shrink-0 border-r md:block">
        <MapDirectory {...directoryProps} />
      </aside>

      <div className="relative min-h-0 flex-1">
        <MapContainer
          center={[WORLD_CENTER.lat, WORLD_CENTER.lng]}
          zoom={WORLD_DEFAULT_ZOOM}
          scrollWheelZoom
          zoomControl={false}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={tileUrl}
          />
          <AttributionControl position="bottomleft" />
          <InitialViewController />
          <MapController
            selected={selected}
            marketZoomRequest={marketZoomRequest}
            onBoundsChange={setMapBounds}
          />
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            iconCreateFunction={clusterIcon}
          >
            {matchingPins.map((item) => {
              const key = entityKey(item);
              const active = (selected && entityKey(selected) === key) || hoveredEntityKey === key;
              return (
                <Marker
                  key={item.key}
                  position={[item.pin.lat, item.pin.lng]}
                  icon={getMarkerIcon(item, Boolean(active))}
                  title={`${item.name} · ${item.pin.label}`}
                  eventHandlers={{
                    click: () => selectItem(item),
                    mouseover: () => setHoveredEntityKey(key),
                    mouseout: () => setHoveredEntityKey(null),
                  }}
                />
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>

        <div className="absolute left-3 top-3 z-20 flex gap-2 md:hidden">
          <Button
            onClick={() => setMobileDirectoryOpen(true)}
            className="h-11 rounded-xl bg-background text-foreground shadow-lg hover:bg-muted"
            aria-label="Open search and filters"
          >
            <ListFilter /> Explore
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-11 rounded-xl bg-background shadow-lg"
            onClick={() =>
              setMarketZoomRequest((request) => ({
                sequence: request.sequence + 1,
                marketCode: filters.market || "IN",
              }))
            }
            aria-label={`Zoom map to ${MARKET_BY_CODE.get(filters.market || "IN")?.label}`}
          >
            <MapPinned />
          </Button>
        </div>

        <AnimatePresence>
          {mobileDirectoryOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-0 z-40 md:hidden"
            >
              <MapDirectory
                {...directoryProps}
                onClose={() => setMobileDirectoryOpen(false)}
              />
            </motion.div>
          )}
          {selected && (
            <EntitySheet
              key={entityKey(selected)}
              item={selected}
              onClose={closeEntity}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
