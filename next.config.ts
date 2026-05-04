import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Enable React Strict Mode for better development warnings
  images: {
    remotePatterns: [
      // Production domains
      {
        protocol: 'https',
        hostname: 'teamcast.ai',
      },
      {
        protocol: 'https',
        hostname: '*.teamcast.ai',
      },
      // CDN and storage domains
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      // User avatar services
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Stock imagery (Unsplash)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Development only (remove in production)
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  // Set the source directory to src
  distDir: '.next',
  // Enable standalone output for Docker optimization
  output: 'standalone',
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  // Additional configuration options can be added here
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300',
    NEXT_PUBLIC_ENV_NAME: process.env.NEXT_PUBLIC_ENV_NAME || 'development',
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Teamcast',
    NEXT_PUBLIC_GA_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-PLACEHOLDER',
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || 'G-PLACEHOLDER',
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || 'GTM-PLACEHOLDER',
    NEXT_PUBLIC_HUBSPOT_PORTAL_ID:
      process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || '12345678',
    NEXT_PUBLIC_CACHE_MAX_AGE: process.env.NEXT_PUBLIC_CACHE_MAX_AGE || '3600',
  },
  // Server configuration for Kubernetes
  experimental: {},
  serverExternalPackages: ['pm2'],
};

export default nextConfig;
