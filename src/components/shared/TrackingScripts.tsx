// src/components/shared/TrackingScripts.tsx
"use client"

import * as React from "react"
import Script from "next/script"

interface TrackingConfig {
  facebook_pixel_id?: string
  google_analytics_id?: string
}

export default function TrackingScripts({ config }: { config: TrackingConfig }) {
  const [consent, setConsent] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setConsent(localStorage.getItem("favor_cookie_consent"))

      const handleConsentChange = () => {
        setConsent(localStorage.getItem("favor_cookie_consent"))
      }

      window.addEventListener("cookie-consent-changed", handleConsentChange)
      window.addEventListener("storage", handleConsentChange)

      return () => {
        window.removeEventListener("cookie-consent-changed", handleConsentChange)
        window.removeEventListener("storage", handleConsentChange)
      }
    }
  }, [])

  if (consent !== "accepted" || !config) {
    return null
  }

  const { facebook_pixel_id, google_analytics_id } = config

  return (
    <>
      {/* Facebook Pixel */}
      {facebook_pixel_id && facebook_pixel_id.trim() !== "" && (
        <>
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${facebook_pixel_id.trim()}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${facebook_pixel_id.trim()}&ev=PageView&noscript=1`} 
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Google Analytics */}
      {google_analytics_id && google_analytics_id.trim() !== "" && (
        <>
          <Script 
            src={`https://www.googletagmanager.com/gtag/js?id=${google_analytics_id.trim()}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${google_analytics_id.trim()}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </>
  )
}
