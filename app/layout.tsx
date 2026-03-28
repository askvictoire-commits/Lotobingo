import type { Metadata, Viewport } from "next";
import { Anton, DM_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { LotoProvider } from "@/lib/LotoContext";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LotoBingo — Checker de grilles",
  description: "Vérifiez vos grilles de loto/bingo en temps réel pour Astrid, Marie et Victoire.",
};

export const viewport: Viewport = {
  themeColor: "#0066FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${anton.variable} ${dmSans.variable}`}>
      <body className="bg-white font-dm text-gray-900 antialiased">
        <LotoProvider>
          <main className="min-h-screen max-w-lg mx-auto pb-24">
            {children}
          </main>
          <BottomNav />
        </LotoProvider>
      </body>
    </html>
  );
}
