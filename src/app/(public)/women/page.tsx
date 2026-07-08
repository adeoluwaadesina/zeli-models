import { PortfolioGrid } from "@/components/PortfolioGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { readModelsByGender } from "@/lib/modelsStore";

export const dynamic = "force-dynamic";

export default async function WomenPage() {
  const models = await readModelsByGender("female");

  return (
    <main>
      <PortfolioGrid
        title="Female"
        subtitle="Our female board. Select a model to view their portfolio."
        models={models}
      />
      <SiteFooter />
    </main>
  );
}
