/** @type {import('next').NextConfig} */

// Security response headers applied to every route (defense in depth alongside
// nginx). The CSP is scoped to what the app actually needs:
//  - script/style 'unsafe-inline': Next.js inline bootstrap + the pre-hydration
//    theme script + Tailwind/inline styles. (A nonce-based CSP is the stronger
//    follow-up but needs middleware.)
//  - connect-src: same-origin API (/api) + the Rootstock RPC hosts used by the
//    web3 client. If you point NEXT_PUBLIC_RPC_URL at a different provider,
//    add its host here.
//  - img-src: Cloudinary + Unsplash (the only remote image hosts).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.rsk.co https://*.rootstock.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  // Don't advertise the framework/version.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    serverActions: {
      // Canonical production origins only (the stale droplet IP/ports were removed).
      allowedOrigins: ['bluefire.ink', 'app.bluefire.love'],
    },
  },
};

export default nextConfig;
