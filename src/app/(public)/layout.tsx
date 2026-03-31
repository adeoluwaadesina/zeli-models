import { AppHeader } from "@/components/AppHeader";
import { FooterHashScroll } from "@/components/FooterHashScroll";
import { WhatsappButton } from "@/components/WhatsappButton";
import { resolveInstagramUrl } from "@/lib/instagram";
import { readSiteSettings } from "@/lib/siteSettingsStore";
import { resolveTiktokUrl, resolveTwitterHref } from "@/lib/socialUrls";

export default async function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await readSiteSettings();
  const instagramUrl = resolveInstagramUrl(settings);
  const tiktokUrl = resolveTiktokUrl(settings);
  const twitterHref = resolveTwitterHref(settings);

  return (
    <>
      <AppHeader instagramUrl={instagramUrl} tiktokUrl={tiktokUrl} twitterHref={twitterHref} />
      <FooterHashScroll />
      {children}
      <WhatsappButton />
    </>
  );
}
