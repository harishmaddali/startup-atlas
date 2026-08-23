"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, ExternalLink, LoaderCircle, MapPin, ShieldCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/company-logo";
import { Separator } from "@/components/ui/separator";
import { getProgramStatus } from "@/lib/program-status";
import { humanize } from "@/lib/map-filtering";
import type { MapEntity, MapItem, SourceEvidence } from "@/types/ecosystem";

export function EntitySheet({ item, onClose }: { item: MapItem; onClose: () => void }) {
  const [entity, setEntity] = useState<MapEntity | null>(null);
  const [error, setError] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(
    typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null)
  );

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/map-entities/${item.entityKind}/${item.entityId}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load profile");
        return response.json() as Promise<MapEntity>;
      })
      .then(setEntity)
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setError(true);
      });
    return () => controller.abort();
  }, [item.entityId, item.entityKind]);

  useEffect(() => {
    const returnFocus = returnFocusRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      returnFocus?.focus();
    };
  }, [onClose]);

  return (
    <motion.aside
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 22, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="absolute bottom-4 left-3 right-3 z-30 mx-auto max-h-[78vh] max-w-xl overflow-y-auto rounded-2xl border bg-background/97 shadow-2xl backdrop-blur md:bottom-5 md:left-auto md:right-5 md:w-[31rem]"
      aria-live="polite"
      aria-labelledby="entity-sheet-title"
      role="dialog"
    >
      <Button ref={closeButtonRef} variant="ghost" size="icon" onClick={onClose} aria-label="Close profile" className="absolute right-3 top-3 z-10">
        <X />
      </Button>
      <div className="p-5">
        <div className="flex items-start gap-3 pr-10">
          <CompanyLogo name={item.name} logoUrl={item.logoUrl} size={52} />
          <div className="min-w-0 flex-1">
            <h2 id="entity-sheet-title" className="text-lg font-semibold tracking-tight">{item.name}</h2>
            <div className="mt-1 flex flex-wrap gap-1">
              {item.subtypes.slice(0, 3).map((subtype) => (
                <Badge key={subtype} variant="secondary" className="text-[10px]">{humanize(subtype)}</Badge>
              ))}
            </div>
            {item.pin && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {item.pin.city}{item.pin.state ? `, ${item.pin.state}` : ""}
              </p>
            )}
          </div>
        </div>

        {item.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
        <Separator className="my-4" />

        {!entity && !error && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" /> Loading verified details…
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            This profile could not be loaded. Please try again.
          </div>
        )}
        {entity && <EntityDetails entity={entity} item={item} />}
      </div>
    </motion.aside>
  );
}

function EntityDetails({ entity, item }: { entity: MapEntity; item: MapItem }) {
  if (entity.kind === "startup") {
    const company = entity.data;
    return (
      <div className="grid gap-4">
        <DetailGrid
          rows={[
            ["Founded", String(company.yearFounded)],
            ["Address", company.address],
            ["Founders", company.founders.map((founder) => founder.name).join(", ") || "Not listed"],
            ["Status", company.status ?? "Active"],
          ]}
        />
        {company.website && <PrimaryLink href={company.website}>Visit website</PrimaryLink>}
        {company.dataConfidence === "approximate" && (
          <PrecisionNotice>Startup location is approximate; an exact public office was not verified.</PrecisionNotice>
        )}
      </div>
    );
  }

  if (entity.kind === "organization") {
    const organization = entity.data;
    return (
      <div className="grid gap-4">
        {organization.investmentThesis && <TextSection title="Investment thesis">{organization.investmentThesis}</TextSection>}
        <TagSection title="Sectors" values={organization.sectors} />
        <TagSection title="Stages" values={organization.stages} />
        <TagSection title="Founder support" values={organization.supportCapabilities} />
        {organization.investmentRange && (
          <DetailGrid rows={[["Published cheque", organization.investmentRange.asStated], ["Preference", organization.investmentPreference ? humanize(organization.investmentPreference) : "Not stated"]]} />
        )}
        <TagSection title="Organization types" values={organization.categories} />
        <TextSection title="India locations">
          <ul className="grid gap-1.5">
            {organization.locations.map((location) => (
              <li
                key={location.id}
                className={location.id === item.pin?.locationId ? "rounded-lg bg-muted px-2 py-1.5" : "px-2 py-1.5"}
              >
                {location.precision === "building" || location.precision === "street"
                  ? location.address ?? `${location.city}, ${location.state}`
                  : `${location.city}, ${location.state}`} {" "}
                <span className="text-xs text-muted-foreground">({humanize(location.precision)} precision)</span>
                {location.id === item.pin?.locationId && (
                  <Badge variant="outline" className="ml-2 text-[9px]">Selected map location</Badge>
                )}
              </li>
            ))}
          </ul>
        </TextSection>
        {entity.relatedPrograms.length > 0 && (
          <TextSection title="Live opportunities">
            <ul className="grid gap-2">
              {entity.relatedPrograms.map((program) => (
                <li key={program.id} className="rounded-lg border p-2.5">
                  <p className="text-sm font-medium">{program.name}</p>
                  <a href={program.applicationUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-2">Apply or learn more <ExternalLink className="size-3" /></a>
                </li>
              ))}
            </ul>
          </TextSection>
        )}
        {organization.registrations.length > 0 && (
          <TextSection title="Regulatory registrations">
            <ul className="grid gap-1">
              {organization.registrations.map((registration) => (
                <li key={`${registration.authority}:${registration.registrationNumber}`}>
                  {registration.vehicleName} · {registration.authority} {registration.registrationNumber}
                </li>
              ))}
            </ul>
          </TextSection>
        )}
        <TagSection title="Managed fund vehicles" values={organization.managedVehicles} />
        <TagSection title="Affiliations" values={organization.affiliations} />
        <div className="flex flex-wrap gap-2">
          {organization.applicationUrl && <PrimaryLink href={organization.applicationUrl}>Apply / pitch</PrimaryLink>}
          <SecondaryLink href={organization.website}>Website</SecondaryLink>
          {organization.portfolioUrl && <SecondaryLink href={organization.portfolioUrl}>Portfolio</SecondaryLink>}
          {organization.contactEmail && <SecondaryLink href={`mailto:${organization.contactEmail}`}>Email</SecondaryLink>}
        </div>
        <EvidenceList evidence={organization.evidence} lastVerifiedAt={organization.lastVerifiedAt} />
      </div>
    );
  }

  if (entity.kind === "person") {
    const person = entity.data;
    return (
      <div className="grid gap-4">
        <TagSection title="Sectors" values={person.sectors} />
        <TagSection title="Stages" values={person.stages} />
        <TextSection title="Selected disclosed investments">{person.notableInvestments.join(", ")}</TextSection>
        <DetailGrid rows={[["Recent activity", person.lastInvestmentActivityAt], ["Professional location", person.professionalLocation ? `${person.professionalLocation.city}, ${person.professionalLocation.state}` : "India-wide"], ["Published cheque", person.investmentRange?.asStated ?? "Not stated"], ["Affiliations", entity.organizations.map((organization) => organization.name).join(", ") || "Not listed"]]} />
        <div className="flex flex-wrap gap-2">
          {person.website && <PrimaryLink href={person.website}>Professional profile</PrimaryLink>}
          {person.linkedinUrl && <SecondaryLink href={person.linkedinUrl}>LinkedIn</SecondaryLink>}
        </div>
        <PrecisionNotice>Only public professional city information is shown for individual angels.</PrecisionNotice>
        <EvidenceList evidence={person.evidence} lastVerifiedAt={person.lastVerifiedAt} />
      </div>
    );
  }

  const program = entity.data;
  const status = getProgramStatus(program);
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        <span className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="size-4" /> Applications {humanize(status)}</span>
        {program.applicationCloseAt && <span className="text-xs">Closes {formatDate(program.applicationCloseAt)}</span>}
      </div>
      <TextSection title="Who should apply">{program.eligibility}</TextSection>
      <TagSection title="What you receive" values={program.benefits} />
      <TagSection title="Sectors" values={program.sectors} />
      <TagSection title="Stages" values={program.stages} />
      <DetailGrid rows={[["Delivery", humanize(program.deliveryMode)], ["Organizer", entity.organizers.map((organizer) => organizer.name).join(", ")], ["Funding", program.funding?.asStated ?? "Not stated"], ["Equity", program.equityTerms ?? "Not stated"]]} />
      <PrimaryLink href={program.applicationUrl}>Apply or join waitlist</PrimaryLink>
      <EvidenceList evidence={program.evidence} lastVerifiedAt={program.lastVerifiedAt} />
    </div>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/25 p-3">
      {rows.map(([label, value]) => (
        <div key={label} className={label === "Address" || label === "Founders" ? "col-span-2" : ""}>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="mt-0.5 text-sm leading-relaxed">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function TextSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3><div className="mt-1.5 text-sm leading-relaxed">{children}</div></section>;
}

function TagSection({ title, values }: { title: string; values: string[] }) {
  if (values.length === 0) return null;
  return <TextSection title={title}><div className="flex flex-wrap gap-1.5">{values.map((value) => <Badge key={value} variant="secondary">{humanize(value)}</Badge>)}</div></TextSection>;
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/85">{children}<ExternalLink className="size-3.5" /></a>;
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-muted">{children}<ExternalLink className="size-3.5" /></a>;
}

function EvidenceList({ evidence, lastVerifiedAt }: { evidence: SourceEvidence[]; lastVerifiedAt: string }) {
  return (
    <section className="rounded-xl border bg-muted/20 p-3">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold"><ShieldCheck className="size-4 text-emerald-600" /> Sources · verified {lastVerifiedAt}</h3>
      <ul className="mt-2 grid gap-1.5">
        {evidence.map((source) => (
          <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-3 text-xs text-primary hover:underline"><span>{source.title} · {source.publisher}</span><ExternalLink className="mt-0.5 size-3 shrink-0" /></a></li>
        ))}
      </ul>
    </section>
  );
}

function PrecisionNotice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{children}</p>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(value));
}
