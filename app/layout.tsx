import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/components/motion/motion.css";
import { site } from "@/config/site";

// A single local variable file is smaller than separate regular/medium files.
const GeistSans = localFont({
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "400 500",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <body>{children}</body>
    </html>
  );
}
