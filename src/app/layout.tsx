import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";

/** No link preload - avoids Chrome "preloaded but not used" noise; fonts still load via @font-face + swap. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-zeli-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: false
});

/** Glacial Indifference (OFL) - UI / small copy site-wide via --font-zeli-sans */
const glacialIndifference = localFont({
  src: [
    { path: "./fonts/GlacialIndifference-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GlacialIndifference-Bold.woff2", weight: "700", style: "normal" }
  ],
  variable: "--font-zeli-sans",
  display: "swap",
  preload: false
});

/** Thin classical serifs - closer to Belfast TS / Solaire than Playfair until licensed WOFF2 are added. */
const heroCormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-hero-cormorant",
  display: "swap",
  weight: ["300", "400"],
  preload: false
});

/** Light italic - Jenson-like fallback for "Modern". */
const heroCormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-hero-cormorant-garamond",
  display: "swap",
  weight: ["300", "400"],
  style: ["normal", "italic"],
  preload: false
});

export const metadata: Metadata = {
  title: "Zeli Models",
  description:
    "Representing the most talented and versatile models. Premium management for runway, editorial, and commercial projects."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${glacialIndifference.variable} ${heroCormorant.variable} ${heroCormorantGaramond.variable}`}
    >
      <body
        style={{
          fontFamily:
            "var(--font-zeli-sans), system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        {children}
      </body>
    </html>
  );
}

