import { StartupMapLoader } from "@/components/startup-map-loader";
import { getCompanies } from "@/app/actions/companies";

export default async function Home() {
  const companies = await getCompanies();

  return (
    <main className="h-screen w-screen">
      <StartupMapLoader companies={companies} />
    </main>
  );
}
