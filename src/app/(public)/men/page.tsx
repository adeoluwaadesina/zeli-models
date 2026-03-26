import { PortfolioGrid } from "@/components/PortfolioGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { readModelsByGender } from "@/lib/modelsStore";

export const dynamic = "force-dynamic";

export default async function MenPage() {
  const models = await readModelsByGender("male");

  return (
    <main>
      <PortfolioGrid
        title="Male"
        subtitle="Our Male Board — Select A Model To View Portfolio."
        models={models}
      />
      <SiteFooter />
    </main>
  );
}
