"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  HandCoins,
  MapPinned,
  Rocket,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { CompanyLogo } from "@/components/company-logo";
import { cn } from "@/lib/utils";
import {
  ALL_LAYERS,
  entityKey,
  humanize,
  primaryLayer,
  type MapFilters,
} from "@/lib/map-filtering";
import { MARKETS, MARKET_BY_CODE, marketLabel } from "@/lib/markets";
import type { CoverageSummary, MapItem, MapLayer, MarketCode } from "@/types/ecosystem";

const layerPresentation: Record<
  MapLayer,
  { label: string; icon: typeof Rocket; className: string }
> = {
  startup: { label: "Startups", icon: Rocket, className: "text-blue-700 dark:text-blue-300" },
  investor: { label: "Investors", icon: HandCoins, className: "text-violet-700 dark:text-violet-300" },
  support: { label: "Support", icon: Building2, className: "text-teal-700 dark:text-teal-300" },
  angel: { label: "Angels", icon: UserRound, className: "text-amber-700 dark:text-amber-300" },
  program: { label: "Live programs", icon: CalendarDays, className: "text-emerald-700 dark:text-emerald-300" },
};

const chequeLabels: Record<string, string> = {
  under_50k_usd: "Under US$50K",
  "50k_250k_usd": "US$50K–250K",
  "250k_1m_usd": "US$250K–1M",
  "1m_plus_usd": "US$1M+",
};

interface MapDirectoryProps {
  allItems: MapItem[];
  coverage: CoverageSummary[];
  items: MapItem[];
  marketWideItems: MapItem[];
  totalMatchingPins: number;
  filters: MapFilters;
  selectedEntityKey: string | null;
  hoveredEntityKey: string | null;
  onFiltersChange: (filters: MapFilters) => void;
  onSelect: (item: MapItem) => void;
  onHover: (key: string | null) => void;
  onMarketZoom: (marketCode: MarketCode) => void;
  onClose?: () => void;
  className?: string;
}

function sortedValues(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function MapDirectory({
  allItems,
  coverage,
  items,
  marketWideItems,
  totalMatchingPins,
  filters,
  selectedEntityKey,
  hoveredEntityKey,
  onFiltersChange,
  onSelect,
  onHover,
  onMarketZoom,
  onClose,
  className,
}: MapDirectoryProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const options = useMemo(
    () => ({
      sectors: sortedValues(allItems.flatMap((item) => item.sectors)),
      cities: sortedValues(allItems.map((item) => item.pin?.city ?? "")),
      states: sortedValues(allItems.map((item) => item.pin?.state ?? "")),
      subtypes: sortedValues(allItems.flatMap((item) => item.subtypes)),
      capabilities: sortedValues(allItems.flatMap((item) => item.capabilities)),
      chequeBands: sortedValues(
        allItems.map((item) => item.chequeBand ?? "").filter(Boolean)
      ),
    }),
    [allItems]
  );
  const availableMarkets = useMemo(
    () =>
      MARKETS.filter((market) =>
        allItems.some(
          (item) =>
            item.pin?.marketCode === market.code ||
            item.marketWideCodes.includes(market.code)
        )
      ),
    [allItems]
  );
  const hasAdvancedFilters = Boolean(
    filters.sector ||
      filters.stage ||
      filters.city ||
      filters.state ||
      filters.subtype ||
      filters.capability ||
      filters.chequeBand ||
      filters.deliveryMode ||
      filters.programStatus
  );

  function toggleLayer(layer: MapLayer) {
    const next = filters.layers.includes(layer)
      ? filters.layers.filter((value) => value !== layer)
      : ALL_LAYERS.filter((value) => [...filters.layers, layer].includes(value));
    onFiltersChange({ ...filters, layers: next });
  }

  function updateFilter<Key extends keyof MapFilters>(key: Key, value: MapFilters[Key]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-background/96 backdrop-blur", className)}>
      <header className="border-b px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
                <MapPinned className="size-4" />
              </span>
              <div>
                <h1 className="text-base font-semibold tracking-tight">Startup Atlas</h1>
                <p className="text-xs text-muted-foreground">Global startup capital & support</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close directory">
                <X />
              </Button>
            )}
          </div>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder="Search names, sectors, cities…"
            aria-label="Search the startup ecosystem"
            className="h-10 pl-9 pr-9"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => updateFilter("query", "")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-5 gap-1" aria-label="Map layers">
          {ALL_LAYERS.map((layer) => {
            const presentation = layerPresentation[layer];
            const Icon = presentation.icon;
            const active = filters.layers.includes(layer);
            const count = new Set(
              allItems.filter((item) => item.layers.includes(layer)).map(entityKey)
            ).size;
            return (
              <button
                key={layer}
                type="button"
                aria-pressed={active}
                onClick={() => toggleLayer(layer)}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] transition-colors",
                  active ? "border-foreground/20 bg-muted font-medium" : "border-transparent text-muted-foreground opacity-55 hover:opacity-80"
                )}
              >
                <Icon className={cn("size-4", active && presentation.className)} />
                <span className="max-w-full truncate">{presentation.label}</span>
                <span className="tabular-nums text-[9px] text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen((open) => !open)}>
            <SlidersHorizontal />
            Filters
            {hasAdvancedFilters && <span className="size-1.5 rounded-full bg-blue-600" />}
            <ChevronDown className={cn("transition-transform", filtersOpen && "rotate-180")} />
          </Button>
          <select
            value={filters.market}
            onChange={(event) => updateFilter("market", event.target.value as MapFilters["market"])}
            aria-label="Filter by market"
            className="h-8 min-w-0 max-w-32 rounded-md border bg-background px-2 text-xs"
          >
            <option value="">All markets</option>
            {availableMarkets.map((market) => (
              <option key={market.code} value={market.code}>{market.shortLabel}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarketZoom(filters.market || "IN")}
            aria-label={`Zoom map to ${marketLabel(filters.market || "IN")}`}
          >
            <MapPinned /> {MARKET_BY_CODE.get(filters.market || "IN")?.shortLabel}
          </Button>
          {hasAdvancedFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  sector: "",
                  stage: "",
                  city: "",
                  state: "",
                  subtype: "",
                  capability: "",
                  chequeBand: "",
                  deliveryMode: "",
                  programStatus: "",
                })
              }
            >
              Clear
            </Button>
          )}
        </div>

        {filtersOpen && (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border bg-muted/35 p-2.5">
            <FilterSelect label="Type" value={filters.subtype} onChange={(value) => updateFilter("subtype", value)} options={options.subtypes} />
            <FilterSelect label="City" value={filters.city} onChange={(value) => updateFilter("city", value)} options={options.cities} />
            <FilterSelect label="State" value={filters.state} onChange={(value) => updateFilter("state", value)} options={options.states} />
            <FilterSelect label="Sector" value={filters.sector} onChange={(value) => updateFilter("sector", value)} options={options.sectors} />
            <FilterSelect label="Stage" value={filters.stage} onChange={(value) => updateFilter("stage", value as MapFilters["stage"])} options={["idea", "pre_seed", "seed", "series_a", "series_b_plus", "growth"]} />
            <FilterSelect label="Support" value={filters.capability} onChange={(value) => updateFilter("capability", value)} options={options.capabilities} />
            <FilterSelect label="Cheque" value={filters.chequeBand ?? ""} onChange={(value) => updateFilter("chequeBand", value as MapFilters["chequeBand"])} options={options.chequeBands} labels={chequeLabels} />
            <FilterSelect label="Delivery" value={filters.deliveryMode} onChange={(value) => updateFilter("deliveryMode", value as MapFilters["deliveryMode"])} options={["onsite", "hybrid", "remote"]} />
            <FilterSelect label="Applications" value={filters.programStatus} onChange={(value) => updateFilter("programStatus", value as MapFilters["programStatus"])} options={["open", "rolling", "upcoming"]} />
          </div>
        )}
      </header>

      <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
        <span>{items.length} profiles in view</span>
        <span>{totalMatchingPins.toLocaleString("en-IN")} matching pins</span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {items.length === 0 && marketWideItems.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <MapPinned className="mx-auto size-7 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium">No matching profiles here</p>
            <p className="mt-1 text-xs text-muted-foreground">Try clearing a filter or panning the map.</p>
          </div>
        ) : (
          <div className="p-2">
            <ResultSection
              title="In this map view"
              items={items}
              selectedEntityKey={selectedEntityKey}
              hoveredEntityKey={hoveredEntityKey}
              onSelect={onSelect}
              onHover={onHover}
            />
            {marketWideItems.length > 0 && (
              <ResultSection
                title={filters.market ? `Available ${marketLabel(filters.market)}-wide` : "Available market-wide"}
                description="Remote or market-wide support"
                items={marketWideItems}
                selectedEntityKey={selectedEntityKey}
                hoveredEntityKey={hoveredEntityKey}
                onSelect={onSelect}
                onHover={onHover}
              />
            )}
          </div>
        )}
      </ScrollArea>

      <footer className="border-t px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
        <details>
          <summary className="cursor-pointer font-medium text-foreground">
            Coverage status · {coverage.length} areas
          </summary>
          <ul className="mt-2 grid gap-1">
            {coverage.map((area) => (
              <li key={area.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{marketLabel(area.marketCode)} · {area.name}</span>
                <span className="shrink-0">{humanize(area.status)} · {area.unresolvedLeads} leads</span>
              </li>
            ))}
          </ul>
        </details>
        <p className="mt-2">Source-backed coverage is released area by area. Evidence and verification dates appear in each profile.</p>
      </footer>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels = {},
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="grid gap-1 text-[10px] font-medium text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 min-w-0 rounded-lg border bg-background px-2 text-xs font-normal text-foreground outline-none focus:ring-2 focus:ring-ring/30"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? humanize(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultSection({
  title,
  description,
  items,
  selectedEntityKey,
  hoveredEntityKey,
  onSelect,
  onHover,
}: {
  title: string;
  description?: string;
  items: MapItem[];
  selectedEntityKey: string | null;
  hoveredEntityKey: string | null;
  onSelect: (item: MapItem) => void;
  onHover: (key: string | null) => void;
}) {
  return (
    <section className="mb-3">
      <div className="flex items-end justify-between px-2 pb-1 pt-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h2>
        {description && <span className="text-[10px] text-muted-foreground">{description}</span>}
      </div>
      <ul className="grid gap-1">
        {items.map((item) => {
          const key = entityKey(item);
          const layer = primaryLayer(item);
          const presentation = layerPresentation[layer];
          const Icon = presentation.icon;
          const active = selectedEntityKey === key || hoveredEntityKey === key;
          return (
            <li key={key}>
              <button
                type="button"
                onMouseEnter={() => onHover(key)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(key)}
                onBlur={() => onHover(null)}
                onClick={() => onSelect(item)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-xl border border-transparent px-2.5 py-2.5 text-left transition-colors",
                  active ? "border-border bg-muted" : "hover:bg-muted/60"
                )}
              >
                <CompanyLogo name={item.name} logoUrl={item.logoUrl} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{item.name}</span>
                    <Icon className={cn("size-3.5 shrink-0", presentation.className)} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="truncate">{item.pin ? `${item.pin.city}${item.pin.state ? `, ${item.pin.state}` : ""}` : `${item.marketWideCodes.map(marketLabel).join(", ") || "Market"}-wide`}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{humanize(item.subtypes[0] ?? layer)}</span>
                  </div>
                  {item.description && layer !== "startup" && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{item.description}</p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {layer === "program" && <Badge className="h-4 bg-emerald-600 px-1.5 text-[9px] text-white">Live</Badge>}
                    {item.lastVerifiedAt && <Badge variant="outline" className="h-4 px-1.5 text-[9px]">Verified {item.lastVerifiedAt}</Badge>}
                    {item.pin?.precision === "city" && <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">City pin</Badge>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
