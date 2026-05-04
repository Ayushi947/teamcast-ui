import { Metadata } from 'next';
import { Cookie } from 'lucide-react';
import { createMetadata, seoConfigs } from '@/lib/seo-config';

export const metadata: Metadata = createMetadata(seoConfigs.cookiePolicy);

export default function CookiePolicyPage() {
  return (
    <div className="bg-background pt-20">
      {/* Header */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6e55cf]/20 to-[#6e55cf]/10 shadow-lg">
              <Cookie className="h-10 w-10 text-[#6e55cf]" />
            </div>
            <h1 className="text-primary mb-6 bg-gradient-to-r from-[#6e55cf] to-[#8b5cf6] bg-clip-text text-5xl font-bold">
              Cookie Policy
            </h1>
            <p className="text-muted-foreground text-xl">
              Last updated: July 1, 2025
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <p className="text-muted-foreground mb-0 text-lg leading-relaxed">
                This Cookie Policy explains how we use cookies and similar
                tracking technologies on our website. We value your privacy and
                want to be transparent about the data we collect and how it is
                used.
              </p>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              By using our website, you consent to the use of cookies as
              described in this policy.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              What are cookies?
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Cookies are small text files that are placed on your device when
              you visit a website. They are commonly used to make websites work
              more efficiently and provide information to website owners.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              How We Use Cookies
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We use cookies and similar tracking technologies for various
              purposes, including:
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <ul className="text-muted-foreground list-inside list-disc space-y-4 [&>li]:marker:text-[#6e55cf]">
                <li>
                  <strong className="text-foreground">
                    Essential Cookies:
                  </strong>{' '}
                  These cookies are necessary for the website to function
                  properly. They enable you to navigate around the website and
                  use its features.
                </li>
                <li>
                  <strong className="text-foreground">
                    Performance Cookies:
                  </strong>{' '}
                  These cookies collect information about how visitors use our
                  website, such as which pages are most frequently visited. This
                  helps us improve the website&apos;s performance and user
                  experience.
                </li>
                <li>
                  <strong className="text-foreground">
                    Functional Cookies:
                  </strong>{' '}
                  These cookies allow the website to remember choices you make,
                  such as language preferences and customization settings, to
                  provide a more personalized experience.
                </li>
                <li>
                  <strong className="text-foreground">
                    Analytical Cookies:
                  </strong>{' '}
                  We use third-party analytical tools that set cookies to gather
                  information about the use of our website. These cookies help
                  us understand how visitors interact with our website, which
                  pages are most popular, and other usage patterns. We use this
                  information to improve our website and user experience.
                </li>
              </ul>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Third Party Cookies
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We may also use third-party cookies, such as those from Google
              Analytics, to collect statistical information about your use of
              our website. These cookies are used to analyse and optimise the
              performance and user experience of the website. The information
              collected is aggregated and does not personally identify you.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Cookie Settings
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You may also manage your cookie settings via your browser settings
              or through our cookie banner.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Here, you may clear or block specific cookies, such as third party
              cookies, or all cookies. However, if you block all of the cookies
              that we use, it may affect your user experience.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              To adjust your cookie settings via your browser, you should go to
              your browser settings.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              If you choose to clear all cookies, your website and your website
              preferences may be lost, including your ability to opt-out of
              enabling cookies as this function itself requires the placement of
              a cookie on your device.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Consent to Cookies
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our Cookie banner allows you to provide your consent by accepting
              the use of cookies and to adjust your cookie preferences.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You may revoke the use of non-essential cookies at any time
              through the cookie banner.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You may also decline the use of non-essential cookies.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Advertising Cookies Opt-out
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              To learn more about how to opt out of targeting and advertising
              cookies, you can go to the Your Online Choices page, the Network
              Advertising Initiative page, and the Digital Advertising
              Alliance&apos;s Consumer Choice page. These opt-out tools are
              provided by third parties, and not Teamcast. As such, Teamcast
              does not control or operate these tools or the choices that
              advertisers and others provide and is not responsible for the
              information provided.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Changes to this Cookie Policy
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect
              changes in technology, data protection laws, and our practices.
              Any changes will be posted on this page, and the &ldquo;Last
              updated&rdquo; date at the top of the policy will be revised
              accordingly.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Other User-tracking Technologies
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Tracking pixels, also known as web beacon, marketing pixel,
              conversion pixel, retargeting pixel, and sometimes just pixels are
              like cookies but differ in that they are a small snippet of HTML
              that allows us to gain insights for marketing purposes. Unlike
              cookies, tracking pixels have the ability to send information
              directly to a web server.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Tracking pixels allow us to learn more about interest in our
              website and products by providing data on use numbers, time and
              date of web visits and web page usage.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              It is not possible to opt-out of tracking pixels. However, because
              tracking pixels are used together with cookies, you may limit
              their usage by deleting cookies or adjusting your cookie settings.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Contact Us
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              If you have any questions or concerns about our Cookie Policy or
              your privacy, please contact our DPO at{' '}
              <a
                href="mailto:hello@teamcast.ai"
                className="text-[#6e55cf] hover:underline"
              >
                hello@teamcast.ai
              </a>
            </p>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              For information about how we process your personal data, see our{' '}
              <a href="/privacy" className="text-[#6e55cf] hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <p className="text-muted-foreground mb-0 text-lg leading-relaxed">
                By using our website, you acknowledge that you have read and
                understood this Cookie Policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
