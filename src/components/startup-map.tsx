"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion, AnimatePresence } from "motion/react";
import companies from "@/data/companies.json";
import type { Company } from "@/types/company";
import { HYDERABAD_CENTER, distanceKm } from "@/lib/geo";
import { CompanySheet } from "@/components/company-sheet";
import { CompanyList } from "@/components/company-list";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const NEARBY_RADIUS_KM = 15;

const allCompanies = companies as Company[];

export function StartupMap() {
  const mapRef = useRef<MapRef>(null);
  const [center, setCenter] = useState(HYDERABAD_CENTER);
  const [selected, setSelected] = useState<Company | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const nearby = useMemo(() => {
    const withDistance = allCompanies
      .map((c) => ({ company: c, distance: distanceKm(center, c.location) }))
      .sort((a, b) => a.distance - b.distance);

    const withinRadius = withDistance.filter(
      (d) => d.distance <= NEARBY_RADIUS_KM
    );
    return withinRadius.length > 0 ? withinRadius : withDistance;
  }, [center]);

  const onMoveEnd = useCallback((e: ViewStateChangeEvent) => {
    setCenter({ lat: e.viewState.latitude, lng: e.viewState.longitude });
  }, []);

  const selectCompany = useCallback((company: Company) => {
    setSelected(company);
  }, []);

  useEffect(() => {
    if (!selected) return;
    mapRef.current?.flyTo({
      center: [selected.location.lng, selected.location.lat],
      zoom: 14,
      duration: 800,
    });
  }, [selected]);

  return (
    <div className="relative flex h-full w-full">
      <aside className="z-10 hidden w-96 shrink-0 flex-col border-r bg-background/95 backdrop-blur md:flex">
        <CompanyList
          items={nearby}
          selectedId={selected?.id ?? null}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={selectCompany}
        />
      </aside>

      <div className="relative flex-1">
        {MAPBOX_TOKEN ? (
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
              latitude: HYDERABAD_CENTER.lat,
              longitude: HYDERABAD_CENTER.lng,
              zoom: 11.5,
            }}
            onMoveEnd={onMoveEnd}
            mapStyle="mapbox://styles/mapbox/light-v11"
            style={{ width: "100%", height: "100%" }}
          >
            <NavigationControl position="top-right" />

            {allCompanies.map((company) => {
              const isActive =
                selected?.id === company.id || hoveredId === company.id;
              return (
                <Marker
                  key={company.id}
                  latitude={company.location.lat}
                  longitude={company.location.lng}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelected(company);
                  }}
                >
                  <motion.button
                    type="button"
                    aria-label={company.name}
                    onMouseEnter={() => setHoveredId(company.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: isActive ? 1.25 : 1,
                      opacity: 1,
                      y: isActive ? -4 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg ring-2 ring-primary/30"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  </motion.button>
                </Marker>
              );
            })}
          </Map>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted p-8 text-center">
            <p className="max-w-md text-sm text-muted-foreground">
              Missing{" "}
              <code className="font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code>.
              Add it to <code className="font-mono">.env.local</code> to
              render the map.
            </p>
          </div>
        )}

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
