import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { ModelGrid } from "@/components/ModelGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsappButton } from "@/components/WhatsappButton";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
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

