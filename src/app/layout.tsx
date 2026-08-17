import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

// Self-hosted at build time by next/font -- no runtime fetch to a CDN,
// no risk of a silent 404, no external dependency for a clean, modern
// UI typeface.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NetWise Pay | Payment Dashboard",
  description: "NetWise Pay merchant payment dashboard — think smart, connect wise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
