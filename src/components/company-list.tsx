"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompanyLogo } from "@/components/company-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

interface CompanyListProps {
  items: Company[];
  totalInView: number;
  selectedId: string | null;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (company: Company) => void;
}

export function CompanyList({
  items,
  totalInView,
  selectedId,
  hoveredId,
  onHover,
  onSelect,
}: CompanyListProps) {
  const isCapped = totalInView > items.length;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-2 border-b px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Startup Atlas
          </h1>
          <p className="text-sm text-muted-foreground">
            Recent startups worldwide, expanded across India
          </p>
        </div>
        <ThemeToggle />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {items.length === 0 && (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No startups in the current map view. Try zooming or panning out.
          </p>
        )}
        {isCapped && (
          <p className="px-5 pt-4 text-xs text-muted-foreground">
            Showing {items.length} of {totalInView} in view — zoom in to
            narrow the list.
          </p>
        )}
        <motion.ul
          className="flex flex-col gap-1 p-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04 } },
          }}
        >
          {items.map((company) => {
            const isActive =
              selectedId === company.id || hoveredId === company.id;
            return (
              <motion.li
                key={company.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <button
                  type="button"
                  onMouseEnter={() => onHover(company.id)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelect(company)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent/60"
                  )}
                >
                  <CompanyLogo
                    name={company.name}
                    logoUrl={company.logoUrl}
                    size={36}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {company.name}
                      </span>
                      {company.ycBatch && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {company.ycBatch}
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {company.yearFounded}
                    </p>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </ScrollArea>
    </div>
  );
}
