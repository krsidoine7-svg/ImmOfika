import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || 'https://immofika.ci').replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/client/',
          '/dashboard/',
          '/api/',
          '/auth/callback',
          '/auth/verify-otp',
          '/auth/reset-password',
          '/auth/forgot-password',
          '/suspended',
          '/unauthorized',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

