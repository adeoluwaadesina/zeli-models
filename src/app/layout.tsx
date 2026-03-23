import type { Metadata } from "next";
import { Cormorant, Cormorant_Garamond, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-zeli-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-zeli-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

/** Thin classical serifs — closer to Belfast TS / Solaire than Playfair until licensed WOFF2 are added. */
const heroCormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-hero-cormorant",
  display: "swap",
  weight: ["300", "400"]
});

/** Light italic — Jenson-like fallback for “Modern”. */
const heroCormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-hero-cormorant-garamond",
  display: "swap",
  weight: ["300", "400"],
  style: ["normal", "italic"]
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
      className={`${playfair.variable} ${montserrat.variable} ${heroCormorant.variable} ${heroCormorantGaramond.variable}`}
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

