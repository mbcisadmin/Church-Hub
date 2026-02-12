import type { NextConfig } from 'next';
import path from 'path';

const mpUrl = process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_BASE_URL || '';
const mpHostname = mpUrl ? new URL(mpUrl).hostname : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Turborepo configuration - tell Next.js where the monorepo root is
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // Allow loading images from MinistryPlatform and external sources
  images: {
    remotePatterns: [
      ...(mpHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: mpHostname,
              pathname: '/mp/ministryplatformapi/files/**',
            },
          ]
        : []),
    ],
  },

  // PWA configuration for app-like experience
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
