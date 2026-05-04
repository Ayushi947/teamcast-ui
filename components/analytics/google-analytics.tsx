'use client';

import Script from 'next/script';
import { GA_TRACKING_ID, GTM_ID } from '../../lib/analytics';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

// Validation functions
const isValidTrackingId = (id: string | undefined): boolean => {
  return Boolean(id && (id.startsWith('G-') || id.startsWith('UA-')));
};

const isValidGTMId = (id: string | undefined): boolean => {
  return Boolean(id && id.startsWith('GTM-'));
};

export const GoogleAnalytics = () => {
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('gdpr-consent');
    if (consent === 'accepted') {
      setConsentAccepted(true);
    }
  }, []);

  if (!isValidTrackingId(GA_TRACKING_ID) || !consentAccepted) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {isValidGTMId(GTM_ID) && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
          <noscript>
            <iframe
              title="GTM"
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
    </>
  );
};

export const GTMNoScript = () => {
  if (!isValidGTMId(GTM_ID)) return null;

  return (
    <noscript>
      <iframe
        title="GTM"
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
};
