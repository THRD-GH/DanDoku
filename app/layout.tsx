import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// The single source of truth for the site's public origin.
//
// This repo's Pages site has the custom domain dandoku.com configured, so
// GitHub serves the project at the ROOT of that domain and redirects
// thrd-gh.github.io/DanDoku -> dandoku.com. There is therefore no base path.
//
// Getting this wrong is not cosmetic: the build previously rewrote every asset
// onto a /DanDoku/ prefix, and because that prefix does not exist on the custom
// domain, every stylesheet and script on the live site returned 404.
//
// scripts/build-pages.mjs parses this value to derive the base path (empty
// here) and to emit the CNAME file, so moving the site is a one-line change.
// Deriving it from request headers instead — as this file used to — makes the
// value depend on whichever host happened to render the snapshot.
export const SITE_URL = "https://dandoku.com";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

const title = "DanDoku — Sudoku and other number games";
const description =
  "A growing collection of Sudoku variants and other original number games. Classic, Variants, Killer Sudoku and Solduku — free, offline, no account needed.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "DanDoku",
    description: "Sudoku, however you like it.",
    type: "website",
    url: "/",
    siteName: "DanDoku",
    images: [{ url: "/og.jpg", width: 1200, height: 628, alt: "DanDoku — Sudoku, however you like it." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DanDoku",
    description: "Sudoku, however you like it.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geist.variable} ${mono.variable}`}>{children}</body></html>;
}
