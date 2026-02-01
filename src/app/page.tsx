import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { ModelGrid } from "@/components/ModelGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { SplashScreen } from "@/components/SplashScreen";
import { WhatsappButton } from "@/components/WhatsappButton";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <SplashScreen />
      <SiteHeader />
      <main>
        <Hero />
        <ModelGrid />
        <ContactSection />
      </main>
      <WhatsappButton />
    </>
  );
}

