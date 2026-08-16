"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AnimatePresence } from "motion/react";
import type { Company } from "@/types/company";
import { INDIA_CENTER, INDIA_DEFAULT_ZOOM } from "@/lib/geo";
import { CompanySheet } from "@/components/company-sheet";
import { CompanyList } from "@/components/company-list";

function markerIcon(isActive: boolean) {
  return L.divIcon({
    className: "",
    html: `<span class="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg ring-2 ring-primary/30 transition-transform duration-200 ${
      isActive ? "scale-125 -translate-y-1" : ""
    }"><span class="h-2.5 w-2.5 rounded-full bg-white"></span></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
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

interface StartupMapProps {
  companies: Company[];
}

export function StartupMap({ companies }: StartupMapProps) {
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [selected, setSelected] = useState<Company | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (!bounds) return companies;
    return companies.filter((c) =>
      bounds.contains([c.location.lat, c.location.lng])
    );
  }, [bounds, companies]);

  const selectCompany = useCallback((company: Company) => {
    setSelected(company);
  }, []);

  return (
    <div className="relative flex h-full w-full">
      <aside className="z-10 hidden w-96 shrink-0 flex-col border-r bg-background/95 backdrop-blur md:flex">
        <CompanyList
          items={visible}
          selectedId={selected?.id ?? null}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={selectCompany}
        />
      </aside>

      <div className="relative flex-1">
        <MapContainer
          center={[INDIA_CENTER.lat, INDIA_CENTER.lng]}
          zoom={INDIA_DEFAULT_ZOOM}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <MapController selected={selected} onBoundsChange={setBounds} />

          {companies.map((company) => {
            const isActive =
              selected?.id === company.id || hoveredId === company.id;
            return (
              <Marker
                key={company.id}
                position={[company.location.lat, company.location.lng]}
                icon={markerIcon(isActive)}
                eventHandlers={{
                  click: () => setSelected(company),
                  mouseover: () => setHoveredId(company.id),
                  mouseout: () => setHoveredId(null),
                }}
              />
            );
          })}
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
