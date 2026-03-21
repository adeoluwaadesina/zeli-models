import { PortfolioGrid } from "@/components/PortfolioGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { readModelsByGender } from "@/lib/modelsStore";

export const dynamic = "force-dynamic";

export default async function WomenPage() {
  const models = await readModelsByGender("female");

  return (
    <main>
      <PortfolioGrid
        title="Women"
        subtitle="Our women's board — select a model to view Portfolio."
        models={models}
      />
      <SiteFooter />
    </main>
  );
}
