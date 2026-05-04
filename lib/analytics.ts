// Google Analytics and Tag Manager utilities
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Analytics configuration - support both variable names for compatibility
export const GA_TRACKING_ID =
  (typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_GA_ID
    : undefined) ||
  (typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    : undefined) ||
  'G-PLACEHOLDER';
export const GTM_ID =
  (typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_GTM_ID
    : undefined) || 'GTM-PLACEHOLDER';

// Validate analytics configuration
const isValidTrackingId = (id: string | undefined): boolean => {
  return Boolean(id && (id.startsWith('G-') || id.startsWith('UA-')));
};

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && isValidTrackingId(GA_TRACKING_ID)) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && isValidTrackingId(GA_TRACKING_ID)) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track form submissions
export const trackFormSubmission = (
  formName: string,
  success: boolean = true
) => {
  trackEvent(
    success ? 'form_submit_success' : 'form_submit_error',
    'engagement',
    formName
  );
};

// Track button clicks
export const trackButtonClick = (buttonName: string, section?: string) => {
  trackEvent(
    'button_click',
    'engagement',
    `${section ? section + '_' : ''}${buttonName}`
  );
};

// Track file downloads
export const trackDownload = (fileName: string, _fileType: string) => {
  trackEvent('file_download', 'engagement', fileName, undefined);
};

// Track CTA interactions
export const trackCTAClick = (ctaName: string, location: string) => {
  trackEvent('cta_click', 'conversion', `${location}_${ctaName}`);
};

// Track user engagement
export const trackEngagement = (action: string, element: string) => {
  trackEvent(action, 'user_engagement', element);
};

// Ecommerce tracking for pricing interactions
export const trackPricingInteraction = (
  plan: string,
  action: 'view' | 'click' | 'signup'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action === 'signup' ? 'sign_up' : 'select_content', {
      content_type: 'pricing_plan',
      content_id: plan.toLowerCase().replace(' ', '_'),
      custom_parameter: action,
    });
  }
};

// Track search queries
export const trackSearch = (searchTerm: string, _section: string) => {
  trackEvent('search', 'engagement', searchTerm);
};

// Track video interactions
export const trackVideoPlay = (videoTitle: string, progress?: number) => {
  trackEvent('video_play', 'engagement', videoTitle, progress);
};

// Track social sharing
export const trackSocialShare = (platform: string, _url: string) => {
  trackEvent('social_share', 'engagement', platform);
};

// Enhanced ecommerce for conversion tracking
export const trackConversion = (
  conversionType: 'signup' | 'contact' | 'demo',
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: GA_TRACKING_ID,
      event_category: 'conversion',
      event_label: conversionType,
      value: value || 0,
    });
  }
};

// User properties for segmentation
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      custom_map: properties,
    });
  }
};

// Track scroll depth
export const trackScrollDepth = (depth: number) => {
  trackEvent('scroll_depth', 'engagement', `${depth}%`, depth);
};

// Track time on page
export const trackTimeOnPage = (timeSpent: number, page: string) => {
  trackEvent('time_on_page', 'engagement', page, Math.round(timeSpent / 1000));
};
