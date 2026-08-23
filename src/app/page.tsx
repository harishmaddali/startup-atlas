import { StartupMapLoader } from "@/components/startup-map-loader";
import { getCoverageSummaries, getMapItems } from "@/lib/ecosystem-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = getMapItems();
  const coverage = getCoverageSummaries();

  return (
    <main className="h-screen w-screen">
      <StartupMapLoader items={items} coverage={coverage} />
      <a
        href="https://uno.engineering?ref=startup-atlas"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 bottom-4 z-30 inline-flex h-9 items-center justify-center rounded-full border bg-background/95 px-4 text-sm font-medium shadow-lg backdrop-blur transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Built with Uno
      </a>
    </main>
  );
}
