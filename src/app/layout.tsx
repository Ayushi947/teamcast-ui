import { AppProvider } from '@/lib/context/app-context';
import { FeatureFlagProviderWrapper } from '@/lib/providers/feature-flag-provider-wrapper';
import { ThemeProvider } from 'next-themes';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { Metadata } from 'next';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ConvexClientProvider } from '@/lib/providers/convex-provider';
import { GoogleAnalytics } from '../../components/analytics/google-analytics';
import { CookieConsentBanner } from '@/components/app/common/gdpr/CookieConsentBanner';
import { ImpersonationBanner } from '@/components/app/common/support/impersonation-banner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Teamcast',
  description: 'AI Hiring Platform',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      {
        url: '/favicons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/favicons/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/favicons/android-chrome-512x512.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Enhanced Analytics */}
        <GoogleAnalytics />

        {/* Additional Favicon Support */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <meta name="theme-color" content="#6E55CF" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <QueryProvider>
              <AppProvider>
                <FeatureFlagProviderWrapper>
                  {children}
                  <ImpersonationBanner />
                  <Toaster richColors position="top-center" />
                  <CookieConsentBanner />
                </FeatureFlagProviderWrapper>
              </AppProvider>
            </QueryProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
