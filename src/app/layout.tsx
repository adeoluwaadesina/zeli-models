import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-zeli-serif",
  display: "swap"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-zeli-sans",
  display: "swap"
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
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
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

