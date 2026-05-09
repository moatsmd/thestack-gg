import type { Metadata, Viewport } from "next";
import { Cinzel, IM_Fell_English, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "@/components/Providers";

const headingFont = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
});

const bodyFont = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-body",
});

const proseFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-prose",
});

const siteUrl = "https://www.thestack.gg";
const siteTitle = "TheStack.gg — The MTG Companion";
const siteDescription =
  "A beautiful, dark-mode Magic: The Gathering companion: life tracker, stack visualizer, card lookup, glossary, and rules \u2014 fast, focused, and right at hand.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · TheStack.gg",
  },
  description: siteDescription,
  applicationName: "TheStack.gg",
  keywords: [
    "Magic the Gathering",
    "MTG",
    "life tracker",
    "commander life tracker",
    "the stack",
    "MTG glossary",
    "MTG keywords",
    "comprehensive rules",
    "card search",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TheStack.gg",
  },
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "TheStack.gg",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TheStack.gg \u2014 The MTG Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1f2937",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JSON-LD describing the site as a WebApplication. Helps search engines
  // surface the tool with a richer snippet (rating, app category, etc.).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TheStack.gg',
    url: siteUrl,
    description: siteDescription,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript and a modern browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: 'en',
    audience: { '@type': 'Audience', audienceType: 'Magic: The Gathering players' },
  };

  return (
    <html lang="en">
      <head>
        {/* Impact (TCGplayer / Card Kingdom affiliate network) site verification */}
        <meta
          name="impact-site-verification"
          content="200b2947-5c79-4756-962c-5e57a09aa69f"
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`antialiased ${headingFont.variable} ${bodyFont.variable} ${proseFont.variable}`}>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
