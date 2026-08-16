"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { LatLngBounds } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { AnimatePresence } from "motion/react";
import type { Company } from "@/types/company";
import { WORLD_CENTER, WORLD_DEFAULT_ZOOM } from "@/lib/geo";
import { CompanySheet } from "@/components/company-sheet";
import { CompanyList } from "@/components/company-list";

const ACTIVE_COLOR = "#2563eb"; // blue-600 -- the one accent color on an otherwise black/white map

function escapeHtml(str: string) {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] ?? c
  );
}

// Keyed by `${company.id}:${isActive}` and built lazily -- with thousands of
// markers, constructing a new L.divIcon (and re-decoding the logo URL) per
// marker on every hover/select re-render is measurably slow, and each
// company's icon never changes shape once built.
const iconCache = new Map<string, L.DivIcon>();

function getMarkerIcon(company: Company, isActive: boolean): L.DivIcon {
  const key = `${company.id}:${isActive ? 1 : 0}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const size = isActive ? 40 : 32;
  const borderColor = isActive ? ACTIVE_COLOR : "#ffffff";
  const boxShadow = isActive
    ? `0 0 0 3px ${ACTIVE_COLOR}66, 0 4px 10px rgba(0,0,0,0.35)`
    : "0 2px 6px rgba(0,0,0,0.3)";
  const inner = company.logoUrl
    ? `<img src="${escapeHtml(
        company.logoUrl
      )}" alt="" style="width:100%;height:100%;object-fit:contain;padding:3px;box-sizing:border-box;" />`
    : `<span style="font-size:${Math.round(
        size * 0.42
      )}px;font-weight:700;color:#6b7280;">${escapeHtml(
        (company.name.trim().charAt(0) || "?").toUpperCase()
      )}</span>`;

  const icon = L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:#fff;border:2px solid ${borderColor};box-shadow:${boxShadow};overflow:hidden;">${inner}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  iconCache.set(key, icon);
  return icon;
}

function clusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count < 25 ? 40 : count < 100 ? 46 : 54;
  return L.divIcon({
    className: "",
    html: `<span class="flex items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-lg ring-2 ring-primary/30" style="width:${size}px;height:${size}px;font-size:${
      size <= 40 ? 12 : 13
    }px;font-weight:600;">${count}</span>`,
    iconSize: [size, size],
  });
}

function MapController({
  selected,
  onBoundsChange,
}: {
  selected: Company | null;
  onBoundsChange: (bounds: LatLngBounds) => void;
}) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
  });

  useEffect(() => {
    map.invalidateSize();
    onBoundsChange(map.getBounds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    map.flyTo([selected.location.lat, selected.location.lng], 14, {
      duration: 0.8,
    });
  }, [selected, map]);

  return null;
}

const LIST_CAP = 200;

interface StartupMapProps {
  companies: Company[];
}

export function StartupMap({ companies }: StartupMapProps) {
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [selected, setSelected] = useState<Company | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const inView = useMemo(() => {
    if (!bounds) return companies;
    return companies.filter((c) =>
      bounds.contains([c.location.lat, c.location.lng])
    );
  }, [bounds, companies]);

  const visible = useMemo(() => inView.slice(0, LIST_CAP), [inView]);

  const selectCompany = useCallback((company: Company) => {
    setSelected(company);
  }, []);

  return (
    <div className="relative flex h-full w-full">
      <aside className="z-10 hidden h-full min-h-0 w-96 shrink-0 flex-col border-r bg-background/95 backdrop-blur md:flex">
        <CompanyList
          items={visible}
          totalInView={inView.length}
          selectedId={selected?.id ?? null}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={selectCompany}
        />
      </aside>

      <div className="relative min-h-0 flex-1">
        <MapContainer
          center={[WORLD_CENTER.lat, WORLD_CENTER.lng]}
          zoom={WORLD_DEFAULT_ZOOM}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <MapController selected={selected} onBoundsChange={setBounds} />

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            iconCreateFunction={clusterIcon}
          >
            {companies.map((company) => {
              const isActive =
                selected?.id === company.id || hoveredId === company.id;
              return (
                <Marker
                  key={company.id}
                  position={[company.location.lat, company.location.lng]}
                  icon={getMarkerIcon(company, isActive)}
                  eventHandlers={{
                    click: () => setSelected(company),
                    mouseover: () => setHoveredId(company.id),
                    mouseout: () => setHoveredId(null),
                  }}
                />
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>

        <AnimatePresence>
          {selected && (
            <CompanySheet
              company={selected}
              onOpenChange={(open) => !open && setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
