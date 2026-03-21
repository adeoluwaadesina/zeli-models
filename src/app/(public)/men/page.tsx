import { PortfolioGrid } from "@/components/PortfolioGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { readModelsByGender } from "@/lib/modelsStore";

export const dynamic = "force-dynamic";

export default async function MenPage() {
  const models = await readModelsByGender("male");

  return (
    <main>
      <PortfolioGrid
        title="Men"
        subtitle="Our men's board — select a model to view Portfolio."
        models={models}
      />
      <SiteFooter />
    </main>
  );
}
