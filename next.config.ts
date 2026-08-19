import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.10.1'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['favor-ci.vercel.app', 'localhost:3000'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
      { protocol: 'https', hostname: 'pub-*.r2.dev' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ],
    },
  ],
}

export default nextConfig
