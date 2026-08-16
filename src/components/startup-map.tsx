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

function buildMarkerIcon(isActive: boolean) {
  return L.divIcon({
    className: "",
    html: `<span class="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg ring-2 ring-primary/30 transition-transform duration-200 ${
      isActive ? "scale-125 -translate-y-1" : ""
    }"><span class="h-2.5 w-2.5 rounded-full bg-white"></span></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Built once and reused across all markers -- with thousands of markers,
// constructing a new L.divIcon per marker on every hover/select re-render
// is measurably slow, and every inactive marker looks identical anyway.
const INACTIVE_ICON = buildMarkerIcon(false);
const ACTIVE_ICON = buildMarkerIcon(true);

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
      <aside className="z-10 hidden w-96 shrink-0 flex-col border-r bg-background/95 backdrop-blur md:flex">
        <CompanyList
          items={visible}
          totalInView={inView.length}
          selectedId={selected?.id ?? null}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={selectCompany}
        />
      </aside>

      <div className="relative flex-1">
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
                  icon={isActive ? ACTIVE_ICON : INACTIVE_ICON}
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
