import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TheStack.gg - MTG Life Tracker",
  description: "Mobile-friendly Magic: The Gathering life tracker and toolkit",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
