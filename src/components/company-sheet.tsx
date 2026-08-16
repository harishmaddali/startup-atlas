"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CompanyLogo } from "@/components/company-logo";
import type { Company } from "@/types/company";

interface CompanySheetProps {
  company: Company;
  onOpenChange: (open: boolean) => void;
}

export function CompanySheet({ company, onOpenChange }: CompanySheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-md rounded-xl border bg-background/95 p-5 shadow-xl backdrop-blur md:left-auto md:right-4"
    >
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        aria-label="Close"
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        ✕
      </button>

      <div className="flex items-start gap-3">
        <CompanyLogo name={company.name} logoUrl={company.logoUrl} size={48} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{company.name}</h2>
            {company.ycBatch && (
              <Badge variant="secondary" className="text-[10px]">
                YC {company.ycBatch}
              </Badge>
            )}
          </div>
          {company.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {company.description}
            </p>
          )}
        </div>
      </div>

      <Separator className="my-3" />

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Address</dt>
          <dd>{company.address}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Founded</dt>
          <dd>{company.yearFounded}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Contact</dt>
          <dd>
            {company.contactEmail ?? (
              <span className="text-muted-foreground">Not public</span>
            )}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Founders</dt>
          <dd>
            {company.founders.map((founder, i) => (
              <span key={founder.name}>
                {i > 0 && ", "}
                {founder.linkedinUrl ? (
                  <a
                    href={founder.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {founder.name}
                  </a>
                ) : (
                  founder.name
                )}
              </span>
            ))}
          </dd>
        </div>
        {company.website && (
          <div className="col-span-2">
            <dt className="text-xs text-muted-foreground">Website</dt>
            <dd>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        )}
      </dl>

      {company.dataConfidence === "approximate" && (
        <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
          Location is an approximate neighborhood placement — exact street
          address not publicly listed.
        </p>
      )}
    </motion.div>
  );
}
