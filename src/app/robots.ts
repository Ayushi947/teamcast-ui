import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/app/',
          '/api/',
          '/_next/',
          '/admin/',
          '/private/',
          '*.json',
          '*.xml',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/app/', '/api/', '/_next/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/app/', '/api/', '/_next/', '/admin/', '/private/'],
      },
    ],
    sitemap: 'https://teamcast.ai/sitemap.xml',
    host: 'https://teamcast.ai',
  };
}
