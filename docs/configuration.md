# Teamcast Website Configuration Guide

This document outlines the configuration setup for all features in the Teamcast website.

## Environment Variables

### Required Environment Variables

```env
# Base Configuration
NEXT_PUBLIC_BASE_URL=https://teamcast.com

# Google Analytics & Tag Manager
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# HubSpot Integration
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=your-hubspot-portal-id
```

### Optional Environment Variables

```env
# Content Management System
CMS_PROVIDER=mock # Options: mock, contentful, strapi, sanity
CMS_API_URL=https://api.contentful.com
CMS_ACCESS_TOKEN=your-contentful-access-token
CMS_SPACE_ID=your-contentful-space-id
CMS_ENVIRONMENT=master

# A/B Testing
NEXT_PUBLIC_AB_TESTING_ENABLED=true

# Performance Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Image Optimization
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
```

## Feature Setup Guide

### 1. Google Analytics & Tag Manager Setup

#### Steps:

1. Create a Google Analytics 4 property
2. Set up Google Tag Manager container
3. Add environment variables:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
   ```
4. The analytics are automatically loaded in the root layout

#### Analytics Events Tracked:

- Page views
- Button clicks
- Form submissions
- A/B test interactions
- User engagement metrics
- Conversion tracking

### 2. XML Sitemap

The sitemap is automatically generated at `/sitemap.xml` and includes:

- All static pages
- Dynamic blog posts
- Case studies
- Proper priorities and change frequencies

### 3. Performance Optimization

#### Image Optimization:

- Use `OptimizedImage` component for all images
- Automatic lazy loading with blur placeholders
- WebP format optimization
- Responsive sizing

#### Usage Example:

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority={true} // For above-the-fold images
/>;
```

#### Lazy Loading:

```tsx
import { LazyLoad } from '@/components/ui/optimized-image';

<LazyLoad height="400px">
  <ExpensiveComponent />
</LazyLoad>;
```

### 4. A/B Testing Setup

#### Configuration:

A/B tests are configured in `lib/ab-testing.ts`. Current active tests:

- Hero CTA button variations
- Pricing page CTAs
- Contact form layouts

#### Usage Example:

```tsx
import { ABTestButton } from '@/components/ab-testing/ab-test-button';

<ABTestButton
  testId="hero_cta"
  href="/pricing"
  className="bg-primary"
  fallbackText="Get Started"
/>;
```

#### Creating New A/B Tests:

1. Add test configuration to `AB_TESTS` object in `lib/ab-testing.ts`
2. Define variants with different props
3. Use `ABTestComponent` or create specific components
4. Track conversions with analytics

### 5. Content Management System

#### Mock CMS (Default):

- No setup required
- Uses static content defined in `lib/cms.ts`
- Perfect for development and testing

#### Contentful Integration:

1. Create Contentful account and space
2. Set up content models for blog posts
3. Add environment variables:
   ```env
   CMS_PROVIDER=contentful
   CMS_ACCESS_TOKEN=your-access-token
   CMS_SPACE_ID=your-space-id
   ```
4. Implement ContentfulCMSProvider in `lib/cms.ts`

#### Blog Usage:

```tsx
import { cms } from '@/lib/cms';

// In your page component
const posts = await cms.getAllPosts(10);
const featuredPosts = await cms.getFeaturedPosts(3);
```

## SEO Optimization Features

### 1. Metadata Generation

- Automatic metadata for all pages
- Open Graph tags for social sharing
- Twitter Card optimization
- Schema.org structured data

### 2. Sitemap Generation

- Automatic XML sitemap
- Dynamic content inclusion
- Proper priority and frequency settings

### 3. Performance Metrics

- Core Web Vitals tracking
- Loading performance monitoring
- User experience metrics

## Analytics Dashboard

### Key Metrics Tracked:

1. **User Engagement**

   - Page views and unique visitors
   - Time on page and bounce rate
   - Scroll depth and interaction rate

2. **Conversion Tracking**

   - Form submissions
   - CTA button clicks
   - Pricing plan selections
   - Contact requests

3. **A/B Test Performance**

   - Variant impression rates
   - Conversion rates by variant
   - Statistical significance

4. **Performance Metrics**
   - Page load times
   - Core Web Vitals scores
   - Error rates

## Deployment Checklist

### Pre-Deployment:

- [ ] Set all required environment variables
- [ ] Test Google Analytics tracking
- [ ] Verify sitemap generation
- [ ] Check A/B test functionality
- [ ] Validate CMS integration
- [ ] Test image optimization

### Post-Deployment:

- [ ] Verify Analytics data flow
- [ ] Check sitemap accessibility
- [ ] Monitor performance metrics
- [ ] Validate A/B test tracking
- [ ] Test contact forms
- [ ] Check SEO metadata

## Troubleshooting

### Common Issues:

1. **Analytics Not Tracking**

   - Verify GA_ID is correct
   - Check browser developer tools for gtag calls
   - Ensure privacy settings aren't blocking

2. **Images Not Loading**

   - Check image paths and formats
   - Verify optimization settings
   - Test different device sizes

3. **A/B Tests Not Working**

   - Check localStorage for stored variants
   - Verify test configuration
   - Ensure tracking events fire

4. **CMS Content Missing**
   - Verify API credentials
   - Check content publication status
   - Test API endpoints directly

## Performance Monitoring

### Core Web Vitals Targets:

- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Strategies:

1. Image optimization and lazy loading
2. Code splitting and dynamic imports
3. Proper caching headers
4. CDN usage for static assets
5. Server-side rendering optimization

## Security Considerations

### Data Protection:

- Analytics data anonymization
- GDPR compliance features
- Secure API token storage
- Rate limiting for forms

### Best Practices:

- Regular dependency updates
- Environment variable security
- Content Security Policy headers
- XSS protection measures
