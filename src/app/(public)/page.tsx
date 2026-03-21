import { AboutSection } from "@/components/AboutSection";
import { ContactLeadForm } from "@/components/ContactLeadForm";
import { FeaturedModelsSection } from "@/components/FeaturedModelsSection";
import { Hero } from "@/components/Hero";
import { MarqueeBar } from "@/components/MarqueeBar";
import { OurValuesSection } from "@/components/OurValuesSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SplashScreen } from "@/components/SplashScreen";
import { WhatWeDoCarousel } from "@/components/WhatWeDoCarousel";
import { readModels } from "@/lib/modelsStore";
import { readSiteSettings } from "@/lib/siteSettingsStore";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [models, settings] = await Promise.all([readModels(), readSiteSettings()]);

  return (
    <>
      <SplashScreen />
      <main>
        <Hero />
        <MarqueeBar categories={settings.marqueeCategories} />
        <AboutSection />
        <FeaturedModelsSection models={models} />
        <WhatWeDoCarousel items={settings.whatWeDo} />
        <OurValuesSection values={settings.ourValues} />
        <ContactLeadForm />
        <SiteFooter showAdminLink />
      </main>
    </>
  );
}
