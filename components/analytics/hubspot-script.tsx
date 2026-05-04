'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Script from 'next/script';

export const HubspotScript = () => {
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('gdpr-consent');
    if (consent === 'accepted') {
      setConsentAccepted(true);
    }
  }, []);

  if (!consentAccepted) {
    return null;
  }

  return (
    <Script
      id="hubspot-chatflows"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          document.cookie = "hs-messages-hide-welcome-message=true; path=/; max-age=31536000; SameSite=Lax";
          (function(d,s,i,r) {
            if (d.getElementById(i)){return;}
            var n=d.createElement(s),e=d.getElementsByTagName(s)[0];
            n.id=i;n.src='//js.hs-scripts.com/'+r+'.js';
            e.parentNode.insertBefore(n, e);
          })(document,"script","hs-script-loader",${process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID});
        `,
      }}
    />
  );
};
