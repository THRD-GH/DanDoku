import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "Ninefold — Three ways to play Sudoku",
    description: "Sudoku Variants, Killer Sudoku and Solduku: three distinctive puzzle games for curious minds.",
    icons: { icon: "/favicon.svg" },
    openGraph: { title: "Ninefold", description: "Sudoku, however you like it.", type: "website", images: [{ url: image, width: 1731, height: 907, alt: "Ninefold — Sudoku, however you like it." }] },
    twitter: { card: "summary_large_image", title: "Ninefold", description: "Sudoku, however you like it.", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geist.variable} ${mono.variable}`}>{children}</body></html>;
}
