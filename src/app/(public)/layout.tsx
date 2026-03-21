import { AppHeader } from "@/components/AppHeader";
import { WhatsappButton } from "@/components/WhatsappButton";
import { resolveInstagramUrl } from "@/lib/instagram";
import { readSiteSettings } from "@/lib/siteSettingsStore";

export default async function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await readSiteSettings();
  const instagramUrl = resolveInstagramUrl(settings);

  return (
    <>
      <AppHeader instagramUrl={instagramUrl} />
      {children}
      <WhatsappButton />
    </>
  );
}
