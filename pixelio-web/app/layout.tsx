import type { Metadata, Viewport } from "next";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/tajawal/latin-400.css";
import "@fontsource/tajawal/latin-500.css";
import "@fontsource/tajawal/latin-700.css";
import "@fontsource/tajawal/latin-800.css";
import "@fontsource/tajawal/arabic-400.css";
import "@fontsource/tajawal/arabic-500.css";
import "@fontsource/tajawal/arabic-700.css";
import "@fontsource/tajawal/arabic-800.css";
import "./globals.css";
import { Providers } from "@/components/providers";

const SITE_URL = "https://pixelio.studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "pixelio — Websites built with pixels & purpose.",
    template: "%s · pixelio",
  },
  description:
    "pixelio is a small web design studio crafting high-converting, fast, and beautiful websites for startups and brands. From idea to launch in 7 days.",
  keywords: ["web design studio", "conversion-focused websites", "Next.js development", "landing pages", "pixelio"],
  authors: [{ name: "pixelio" }],
  openGraph: {
    title: "pixelio — We build websites that convert",
    description: "Websites built with pixels & purpose. Design, development, SEO and maintenance from one small studio.",
    url: SITE_URL,
    siteName: "pixelio",
    type: "website",
    images: [{ url: "/work/relay.jpg", width: 864, height: 1821, alt: "pixelio project preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "pixelio — We build websites that convert",
    description: "Websites built with pixels & purpose.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCFCF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="grain min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
