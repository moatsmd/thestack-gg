import type { Metadata } from "next";
import { Cinzel, IM_Fell_English, Cormorant_Garamond } from "next/font/google";
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

export const metadata: Metadata = {
  title: "TheStack.gg - MTG Life Tracker",
  description: "Mobile-friendly Magic: The Gathering life tracker and toolkit",
  manifest: "/manifest.webmanifest",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#1f2937',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TheStack.gg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased ${headingFont.variable} ${bodyFont.variable} ${proseFont.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
