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
        subtitle="Our male board. Select a model to view their portfolio."
        models={models}
      />
      <SiteFooter />
    </main>
  );
}
