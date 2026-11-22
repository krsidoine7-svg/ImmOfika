import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://anyilo.com"),
  // Préproduction (preprod.anyilo.com) : jamais indexée
  ...((process.env.NEXT_PUBLIC_APP_URL || '').includes('preprod.')
    ? { robots: { index: false, follow: false } }
    : {}),
  title: {
    default: "Anyilo — Plateforme Immobilière & Promotion Agréée",
    template: "%s | Anyilo",
  },
  description: "Anyilo — Solution complète d'achat, de vente, de location et de promotion immobilière agréée. Parcelles sécurisées avec ACD et biens immobiliers certifiés.",
  keywords: [
    "Anyilo",
    "Promoteur Immobilier Agréé",
    "Gestion Immobilière",
    "Terrain ACD Côte d'Ivoire",
    "Achat villa Abidjan",
    "Promotion immobilière agréée",
    "Location immobilière"
  ],
  authors: [{ name: "Anyilo International" }],
  creator: "Anyilo International",
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: "https://anyilo.com",
    siteName: "Anyilo — Plateforme Immobilière & Promotion",
    title: "Anyilo — Plateforme Immobilière & Promotion Agréée",
    description: "Anyilo — Solution complète d'achat, de vente, de location et de promotion immobilière agréée.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Anyilo — Plateforme Immobilière & Promotion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anyilo — Plateforme Immobilière & Promotion Agréée",
    description: "Solution complète d'achat, de vente, de location et de promotion immobilière agréée.",
    images: ["/icon-512.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Anyilo",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
      className="relative h-full antialiased font-sans"
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
