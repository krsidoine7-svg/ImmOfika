import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/shared/SmoothScroll";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/react";
import UpdateDetector from "@/components/shared/UpdateDetector";
import NotificationService from "@/components/shared/NotificationService";
import CookieConsent from "@/components/shared/CookieConsent";
import TrackingScripts from "@/components/shared/TrackingScripts";
import AnalyticsTracker from "@/components/shared/AnalyticsTracker";
import PwaInstallBanner from "@/components/shared/PwaInstallBanner";
import ChatBot from "@/components/shared/ChatBot";
import { getHomepageConfigsAction } from "@/app/actions/homepage";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: {
    default: "ImmOfika — Plateforme Immobilière & Promotion Agréée",
    template: "%s | ImmOfika",
  },
  description: "ImmOfika — Solution complète d'achat, de vente, de location et de promotion immobilière agréée. Parcelles sécurisées avec ACD et biens immobiliers certifiés.",
  keywords: [
    "ImmOfika",
    "Promoteur Immobilier Agréé",
    "Gestion Immobilière",
    "Terrain ACD Côte d'Ivoire",
    "Achat villa Abidjan",
    "Promotion immobilière agréée",
    "Location immobilière"
  ],
  authors: [{ name: "ImmOfika International" }],
  creator: "ImmOfika International",
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: "https://immofika.ci",
    siteName: "ImmOfika — Plateforme Immobilière & Promotion",
    title: "ImmOfika — Plateforme Immobilière & Promotion Agréée",
    description: "ImmOfika — Solution complète d'achat, de vente, de location et de promotion immobilière agréée.",
    images: [
      {
        url: "/logo-favor.jpeg",
        width: 1200,
        height: 630,
        alt: "ImmOfika — Plateforme Immobilière & Promotion",
      },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ImmOfika",
  },
  icons: {
    icon: "/logo-favor.jpeg",
    apple: "/logo-favor.jpeg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const res = await getHomepageConfigsAction()
  const trackingConfig = res.configs?.tracking || {}
  return (
    <html
      lang="fr"
      className={`relative h-full antialiased font-sans ${inter.variable} ${geistMono.variable}`}
    >
      <body className="relative min-h-full flex flex-col">
        <QueryProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <Toaster richColors position="top-right" />
          <Analytics />
          <UpdateDetector />
          <NotificationService />
          <PwaInstallBanner />
          <CookieConsent />
          <TrackingScripts config={trackingConfig} />
          <ChatBot />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
