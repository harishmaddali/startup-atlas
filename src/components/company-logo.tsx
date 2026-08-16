import Image from "next/image";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  name: string;
  logoUrl: string | null;
  size: number;
  className?: string;
  padded?: boolean;
}

export function CompanyLogo({
  name,
  logoUrl,
  size,
  className,
  padded = true,
}: CompanyLogoProps) {
  const box = `${size}px`;

  if (!logoUrl) {
    const initial = name.trim().charAt(0).toUpperCase() || "?";
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md border bg-muted font-semibold text-muted-foreground",
          className
        )}
        style={{ width: box, height: box, fontSize: size * 0.45 }}
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md border bg-white",
        className
      )}
      style={{ width: box, height: box }}
    >
      <Image
        src={logoUrl}
        alt=""
        fill
        sizes={box}
        className={cn("object-contain", padded && "p-1")}
        unoptimized
      />
    </div>
  );
}
