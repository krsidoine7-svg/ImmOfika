import type { NextConfig } from 'next'

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co https://*.googleapis.com https://maps.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' blob: data: https://*.supabase.co https://*.cloudflare.com https://*.r2.dev https://images.unsplash.com https://*.googleapis.com https://*.gstatic.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://standard.paystack.co https://*.r2.dev https://*.googleapis.com",
  "frame-src 'self' https://js.paystack.co https://standard.paystack.co https://checkout.paystack.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.10.1'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: [
        'localhost:3000',
        'localhost:5000',
        '127.0.0.1:3000',
        '127.0.0.1:5000',
        'immofika-psi.vercel.app',
        'immofika.ci',
        'www.immofika.ci',
        'favor-ci.vercel.app',
      ],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  headers: async () => [
    {
      source: '/(admin|client|dashboard)/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
        { key: 'Pragma', value: 'no-cache' },
        { key: 'Expires', value: '0' },
      ],
    },
    {
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: cspHeader },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],
}

export default nextConfig
