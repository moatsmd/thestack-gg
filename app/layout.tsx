import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ManaDork - MTG Life Tracker",
  description: "Mobile-first Magic: The Gathering life tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
