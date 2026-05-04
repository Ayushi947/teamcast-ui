import { Metadata } from 'next';
import { Shield, Calendar, Mail } from 'lucide-react';
import { createMetadata, seoConfigs } from '@/lib/seo-config';

export const metadata: Metadata = createMetadata(seoConfigs.privacy);

export default function PrivacyPage() {
  return (
    <div className="bg-background pt-20">
      {/* Header */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6e55cf]/20 to-[#6e55cf]/10 shadow-lg">
              <Shield className="h-10 w-10 text-[#6e55cf]" />
            </div>
            <h1 className="text-primary mb-6 bg-gradient-to-r from-[#6e55cf] to-[#8b5cf6] bg-clip-text text-5xl font-bold">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-xl">
              Last updated: July 1, 2025
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <div className="bg-muted/30 mb-8 rounded-lg">
              <p className="text-muted-foreground mb-0 text-lg leading-relaxed">
                Teamcast Inc., a Delaware corporation with its principal offices
                at 2627 Hanover St, Palo Alto, CA 94304 United States, and any
                of its Affiliates collectively, Teamcast Group (hereinafter
                referred to as (&ldquo;Teamcast&rdquo;, &ldquo;us&rdquo;,
                &ldquo;we&rdquo;, or &ldquo;our&rdquo;) operates the
                www.teamcast.ai website (the &ldquo;Site&rdquo;) and provides
                AI-powered hiring and team management services (the
                &ldquo;Services&rdquo;), which is available through the Site.
              </p>
            </div>

            <div className="bg-muted/30 mb-8 rounded-lg">
              <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                Teamcast has developed a global privacy program under which we
                offer the same high standards of privacy protection regardless
                of where you are in the world. When we refer to Teamcast, we
                mean the Teamcast entity with which you have an agreement, if
                applicable.
              </p>

              <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                This Privacy Policy informs you of how information about you is
                collected, used, and disclosed by us.
              </p>

              <p className="text-muted-foreground mb-0 text-lg leading-relaxed">
                This Privacy Policy forms part of our Teamcast Platform Terms of
                Service. Unless otherwise defined in this Privacy Policy,
                capitalized terms used in this Privacy Policy have the same
                meanings as in our Terms of Service.
              </p>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Scope of Application
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              This Privacy Policy applies to the following individuals:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                Visitors of the Site with whom Teamcast does not have a
                contractual relationship
              </li>
              <li>
                Clients who use our Services, including client UBOs or
                representatives
              </li>
              <li>Direct Employees</li>
              <li>Independent Contractors</li>
              <li>Teamcast community platform users</li>
              <li>Suppliers who provide products or services to Teamcast</li>
              <li>Candidates</li>
              <li>Prospects</li>
              <li>
                Participants of webinars, conferences, trade events, surveys,
                etc.
              </li>
            </ul>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              By using our Site and/or our Services as well as engaging with
              Teamcast in any way, you agree to the collection and use of your
              information in accordance with this Privacy Policy.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Information Collection
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Teamcast collects and stores certain information about you. This
              information can be used on its own or in combination with other
              information to identify you (&ldquo;Personal Information&rdquo;).
              Below is a list of types of Personal Information that we may
              collect and use about you.
            </p>

            <div className="mb-8 overflow-x-auto">
              <table className="border-border/50 bg-card w-full table-fixed border-collapse rounded-lg border shadow-sm">
                <thead>
                  <tr className="bg-muted/50 border-border/50 border-b">
                    <th className="border-border/50 text-foreground w-1/3 border-r p-4 text-left text-sm font-semibold">
                      Categories of Personal Information
                    </th>
                    <th className="text-foreground w-2/3 p-4 text-left text-sm font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Contact
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information we use to contact you including physical
                      addresses, e-mail addresses, and phone numbers
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Identification
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information we use to identify you including full name,
                      government ID, passport, DoB, and selfie
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Financial
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information about an individual&apos;s financial account
                      including bank account details, payment card details
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Transactional
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information about the transactions you carry out and the
                      payments to and from your accounts with us including
                      amounts and dates
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Contractual
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information about the products or services we provide to
                      you
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Locational
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information we get about where you are, including country
                      and IP address. This may come from your mobile phone or
                      the place where you connect a computer to the internet. It
                      may also include locations where you used your card.
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Usage
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information about the usage of our Services and Site
                      including metadata
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Technical
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information on the devices and technology you use
                      including IP address, login data, browser type and
                      version, timezone, operating system, browser type
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Communications
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information from communications between us including any
                      personal data you may share with us in your messages,
                      communication metadata
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Professional
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information about professional career and educational
                      background including current and old job positions,
                      degrees, qualifications
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Public and third-party records
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Information about you that is in public records and
                      information about you that is publicly available on the
                      internet. We also collect information about you which we
                      receive from other companies, such as (without limitation)
                      credit reference or fraud protection agencies (see below
                      for more information).
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Consents
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Any permissions, consents or preferences that you give us
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Teamcast Community Platform Content
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      The Teamcast Community allows you to post or transmit
                      comments, computer files, messages, and other materials.
                      This content may include personal data
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Biometric data
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      To automatically verify your identity and prevent fraud,
                      we may use your biometric data. Specifically, we may
                      collect a photo of you (a selfie) along with
                      government-issued identification. Using facial recognition
                      technology, the information from your photo is matched
                      against the information on your identification document.
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Other Information
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Any other information you choose to provide to us through
                      all available channels, participating in user/customer
                      surveys or otherwise visiting and interacting with our
                      Site and/or Services.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              For the avoidance of doubt, Personal Information shall not include
              any personal information which is anonymised, after which the
              identifiable data is destroyed. Teamcast may also collect and use
              non-Personal Information to analyze the effectiveness of our
              Services and to improve our Services. We may collect non-Personal
              Information through the Services, the Site and through cookies.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Sources of Your Personal Information
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We may collect Personal Information about you or your businesses
              from any of these sources:
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Direct Collection
              </h3>
              <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
                <li>
                  Directly from you when you use our Services, complete a
                  contact form, request marketing communications, participate in
                  surveys or contact us.
                </li>
                <li>
                  Teamcast collects profile and usage data when you interact
                  with our Site and/or Services, including, without limitation,
                  your security details, app or your web browser settings,
                  marketing choices and data from the devices you use to connect
                  to our platform so we can provide you with our products or
                  services.
                </li>
                <li>
                  We also collect information through the use of cookies and
                  other internet tracking software while you are using our
                  website or mobile apps as described in detail in our Cookie
                  Policy.
                </li>
              </ul>

              <h3 className="text-foreground mb-4 text-xl font-semibold">
                From Third Parties
              </h3>
              <ul className="text-muted-foreground mb-0 list-inside list-disc space-y-2">
                <li>
                  Companies, business partners or individuals that introduce you
                  to us
                </li>
                <li>
                  Business partners, service providers, sub-contractors,
                  advertising networks, analytics providers, search information
                  providers, fraud protection services, Payment Service
                  Providers (PSPs) who help us authenticate your identity,
                  improve the quality of our Services, promote our Services and
                  protect our business. We may also receive Personal Information
                  about you from providers that help prevent, detect and
                  prosecute unlawful acts, money laundering, and fraudulent
                  behavior.
                </li>
                <li>
                  Social networks and other technology providers (for instance,
                  when you click on one of our Facebook or Google adverts)
                </li>
                <li>
                  Public information sources such as (without limitation)
                  national company registries
                </li>
                <li>Market researchers</li>
                <li>
                  Government, law enforcement agencies, authorities and
                  regulatory bodies
                </li>
              </ul>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Cookie Use
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Please refer to our{' '}
              <a
                href="/cookiePolicy"
                className="text-[#6e55cf] hover:underline"
              >
                Cookie Policy
              </a>{' '}
              for more information.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Information Use
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Below is a list of the ways that we may use your Personal
              Information together with the legal basis of processing, where
              applicable under data protection law.
            </p>

            <div className="mb-8 overflow-x-auto">
              <table className="border-border/50 bg-card w-full table-fixed border-collapse rounded-lg border shadow-sm">
                <thead>
                  <tr className="bg-muted/50 border-border/50 border-b">
                    <th className="border-border/50 text-foreground w-2/5 border-r p-4 text-left text-sm font-semibold">
                      Purposes for which we use your Personal Information
                    </th>
                    <th className="border-border/50 text-foreground w-1/3 border-r p-4 text-left text-sm font-semibold">
                      Legal basis
                    </th>
                    <th className="text-foreground w-1/4 p-4 text-left text-sm font-semibold">
                      Individuals
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Management of the contractual relationship with you to
                      provide you with our Services
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Performance of the contract</li>
                        <li>Compliance with our legal obligations</li>
                      </ul>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Clients</li>
                        <li>Independent Contractors</li>
                        <li>Suppliers</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Improving our business by:
                      <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                        <li>Improving our services and operations</li>
                        <li>
                          Developing new ways to meet our customers&apos; needs
                          and grow our business
                        </li>
                        <li>
                          Analyzing and studying how our customers use products
                          and services from Teamcast
                        </li>
                      </ul>
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Performance of a contract</li>
                        <li>Legitimate interest</li>
                      </ul>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Our legitimate interest is centered around enhancing the
                        quality of our Services, optimizing operational
                        efficiency, and maintaining a competitive edge in the
                        market
                      </p>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Visitors of the Site</li>
                        <li>Clients</li>
                        <li>Independent Contractors</li>
                        <li>Teamcast community platform users</li>
                        <li>Suppliers</li>
                        <li>Prospects</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Secure access to our Services, including but not limited
                      to performing the necessary identification and
                      verification of our users prior to granting access to our
                      Services
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Performance of the contract</li>
                        <li>Legitimate interest</li>
                        <li>Consent</li>
                      </ul>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Our legitimate interest is to safeguard access to our
                        Services to authorized only users who have gone through
                        identification and verification processes
                      </p>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Clients</li>
                        <li>Independent Contractors</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Marketing and events-related communications, including but
                      not limited to inviting you to participate in events,
                      surveys, providing personalized content through
                      advertising campaigns or otherwise communicating with you
                      for marketing purposes to promote our Services
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Consent</li>
                        <li>Legitimate interest</li>
                      </ul>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Our legitimate interest is to tailor our marketing
                        communications to the preferences and interests of our
                        audience and provide a personalized and engaging
                        experience for our customers
                      </p>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Visitors of the Site</li>
                        <li>Clients</li>
                        <li>Independent Contractors</li>
                        <li>Teamcast community platform users</li>
                        <li>Prospects</li>
                        <li>
                          Participants of webinars, conferences, trade events,
                          surveys etc.
                        </li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Recruitment:
                      <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                        <li>Posting and managing jobs</li>
                        <li>Sourcing candidates</li>
                        <li>Managing applicants</li>
                        <li>Scheduling interviews</li>
                      </ul>
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Performance of the contract</li>
                        <li>Legitimate interest</li>
                      </ul>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Our legitimate interest is to assess candidates&apos;
                        qualifications and suitability for available positions
                        and to maintain a pool of potential candidates for
                        future opportunities
                      </p>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Candidates</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Protect the security or integrity of us, our Site and our
                      Services
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Legitimate interest</li>
                        <li>Legal Obligation</li>
                        <li>Performance of the contract</li>
                      </ul>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Our legitimate interest is to maintain the reliability
                        and availability of our services by conducting identity
                        verification, detecting and preventing security threats,
                        fraud, money laundering and other crime, unauthorized
                        access, risk and other activities that could harm our
                        business, Site, or Services.
                      </p>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Visitors of the Site</li>
                        <li>Clients</li>
                        <li>Independent Contractors</li>
                        <li>Teamcast community platform users</li>
                        <li>Suppliers</li>
                        <li>Prospects</li>
                        <li>
                          Participants of webinars, conferences, trade events,
                          surveys etc.
                        </li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Communicate with you about our Site and Services, such as
                      to notify of changes and updates and to provide you with
                      customer support and troubleshooting
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Performance of the contract</li>
                        <li>Legitimate interest</li>
                      </ul>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Our legitimate interest is grounded in our commitment to
                        delivering a seamless and informative user experience
                        and to provide assistance when needed
                      </p>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Visitors of the Site</li>
                        <li>Clients</li>
                        <li>Independent Contractors</li>
                        <li>Teamcast community platform users</li>
                        <li>Prospects</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      To manage our business operations including but not
                      limited to delivering Teamcast&apos;s products and
                      services, making and managing payments, managing fees and
                      charges due on user accounts and debt collection
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Performance of the contract</li>
                        <li>Legitimate interests</li>
                      </ul>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Our legitimate interests to manage our business
                        operations efficiently, deliver our products and
                        services, and ensure the financial stability of our
                        company
                      </p>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Clients</li>
                        <li>Independent Contractors</li>
                        <li>Suppliers</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Meet our legal, regulatory, and tax reporting obligations
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Legal obligation</li>
                      </ul>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Clients</li>
                        <li>Independent Contractors</li>
                        <li>Suppliers</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      To provide and maintain the Teamcast Community Platform
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Performance of the contract</li>
                        <li>Legitimate Interest</li>
                      </ul>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Our legitimate interest to ensure that the online
                        platform operates smoothly and effectively to provide
                        the services or features it offers to users
                      </p>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Teamcast community platform users</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Aggregating pseudonymized personal data and reporting
                      anonymized salary data for the purpose of compensation
                      benchmarking in various industries and geographies as well
                      as for academic research purposes
                    </td>
                    <td className="border-border/50 border-r p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Consent</li>
                        <li>Performance of a contract</li>
                        <li>Legitimate interest</li>
                      </ul>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Our legitimate interest in making informed decisions
                        about compensation strategies, remain competitive, and
                        attract and retain talent as well as benefiting society
                        by advancing the knowledge in fields related to
                        compensation, labor markets, and HR practice
                      </p>
                    </td>
                    <td className="p-4 text-sm">
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Workers</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              In cases where we need to process personal data for the
              performance of the contract with you or as required by law and you
              refuse to provide your information, we may not be able to perform
              the contract with you and consequently, we may not be able to
              provide certain services to you.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Communications
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We may contact you with newsletters and other marketing
              information that may be of interest to you. You may opt out of
              receiving any, or all, of these marketing communications from us
              by following the unsubscribe link or instructions provided in any
              email we send or by contacting us. Please note that we may still
              send you transactional, administrative messages, or product
              updates related to the Service even after you have opted out of
              receiving marketing communications.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Information Sharing with Third Parties
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We will only share your information with the third parties listed
              below for the purposes described above in the &ldquo; Information
              Use&rdquo; Section unless otherwise noted at the point of
              collection. We want to assure you that we do not sell or trade any
              personal information to third parties under any circumstances.
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <ul className="text-muted-foreground list-inside list-disc space-y-4 [&>li]:marker:text-[#6e55cf]">
                <li>
                  <strong className="text-foreground">Our clients</strong> to
                  whom you provide your services
                </li>
                <li>
                  <strong className="text-foreground">
                    Trusted third-party agents, partners, suppliers, and service
                    providers
                  </strong>{' '}
                  who assist us in providing the Services to you and are only
                  permitted to use your information according to the purposes
                  specified in their agreement with us. These third parties
                  include website hosts, data hosts, cloud software providers,
                  IT providers, identification verification providers, customer
                  support providers, payment processors, financial institutions,
                  financial advisors, legal advisors, auditors, and insurance
                  companies. These partners are required under law and contract
                  to keep your Personal Information confidential.
                </li>
                <li>
                  <strong className="text-foreground">
                    Government or public agencies, law enforcement authorities,
                    regulators
                  </strong>{' '}
                  or any other entity having appropriate legal authority for
                  receipt of your Personal Information, if required or permitted
                  by law or legal process or if we believe that such action is
                  necessary to comply with the law, to protect the security or
                  integrity of our business, our Site and/or Services and to
                  protect the safety of the users of our Services or the public.
                </li>
                <li>
                  We may disclose your Personal Information to a{' '}
                  <strong className="text-foreground">
                    third party who acquires any part of our business
                  </strong>
                  , whether such acquisition is by way of merger, consolidation,
                  divestiture, spin-off, or purchase of all or a substantial
                  portion of our assets.
                </li>
                <li>
                  We may share{' '}
                  <strong className="text-foreground">
                    de-identified Personal Information with academic
                    institutions
                  </strong>{' '}
                  to perform research, under controls that are designed to
                  protect your privacy—including requiring such institutions to
                  operate under confidentiality agreements and mandating that
                  published findings contain only de-identified and aggregated
                  data.
                </li>
                <li>
                  From time to time, we may share{' '}
                  <strong className="text-foreground">
                    reports with the public
                  </strong>{' '}
                  that contain anonymized, aggregate, de-identified information
                  and statistics.
                </li>
                <li>
                  We may share Personal Information with our{' '}
                  <strong className="text-foreground">
                    current and future Teamcast affiliates
                  </strong>
                  . Our affiliates may use your Personal Information in a manner
                  consistent with this Privacy Policy.
                </li>
                <li>
                  We may share Personal Information with{' '}
                  <strong className="text-foreground">
                    third-party advertising partners
                  </strong>{' '}
                  such as social networks to perform marketing activities and to
                  deliver targeted advertisements based on your interests.
                </li>
                <li>
                  When you provide your{' '}
                  <strong className="text-foreground">consent to us</strong> to
                  share your information.
                </li>
              </ul>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Automated Decision Making and Profiling
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Teamcast uses AI-powered tools and automated decision-making
              systems as part of our hiring and recruitment services. We want to
              be transparent about how these systems work and your rights
              regarding automated decisions.
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                AI and Automated Systems We Use
              </h3>
              <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
                <li>
                  Candidate matching algorithms that analyze job requirements
                  and candidate profiles
                </li>
                <li>Automated resume screening and parsing systems</li>
                <li>AI-powered skill assessment and evaluation tools</li>
                <li>Predictive analytics for candidate success probability</li>
                <li>Automated interview scheduling and coordination</li>
                <li>Behavioral analysis and cultural fit assessments</li>
              </ul>

              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Your Rights Regarding Automated Decisions
              </h3>
              <ul className="text-muted-foreground mb-0 list-inside list-disc space-y-2">
                <li>
                  <strong>Right to Human Review:</strong> You can request human
                  intervention and review of any automated decision that
                  significantly affects you
                </li>
                <li>
                  <strong>Right to Explanation:</strong> You can request
                  information about the logic, criteria, and factors used in
                  automated decision-making
                </li>
                <li>
                  <strong>Right to Challenge:</strong> You can contest automated
                  decisions and provide additional information for
                  reconsideration
                </li>
                <li>
                  <strong>Transparency:</strong> We will always inform you when
                  AI is being used in decision-making processes that affect you
                </li>
              </ul>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              No automated decision-making system operates without human
              oversight. All final hiring decisions involve human review and
              consideration. If you believe an automated system has made an
              error or you wish to challenge a decision, please contact us at{' '}
              <a
                href="mailto:hello@teamcast.ai"
                className="text-[#6e55cf] hover:underline"
              >
                hello@teamcast.ai
              </a>
              .
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Retention of Your Personal Information
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We will retain your personal data only for as long as necessary to
              fulfill the purposes for which it was collected, consistent with
              applicable law. This retention period allows us to comply with our
              legal obligations, resolve disputes, enforce our agreements and
              study customer data as part of our own research. We will not
              retain your data for longer than is necessary to fulfill the
              purpose for which it is being processed.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              To determine the appropriate retention period, we take into
              consideration the amount, nature, and sensitivity of the personal
              data, as well as the purposes for which we process it. We also
              assess whether we can achieve those purposes through other means.
              For the data retention period related to the Services provided to
              you, please refer to the Data Processing Addendum.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Security
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The security of your Personal Information is important to us. We
              implement suitable measures to safeguard the information you
              entrust to us, preventing its loss, misuse, unauthorized access or
              disclosure, alteration, and destruction, addressing threats from
              both external and internal sources. Furthermore, we control access
              to your personal data on a need-to-know basis. Authorized
              individuals will process your personal data solely based on our
              explicit instructions and are bound by confidentiality
              obligations.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              If you have selected a password or other login credentials that
              grant access to the Teamcast platform, it is your responsibility
              to take all reasonable measures to maintain the confidentiality of
              this information. You should not share your password or login
              credentials with any other individual.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Please be aware that no method of transmission over the internet,
              or method of electronic storage is 100% secure and we are unable
              to guarantee the absolute security of the Personal Information we
              have collected from you. Therefore, you are also a key stakeholder
              in making sure that your Personal Information is protected. If you
              become aware of any breach of security or privacy, please contact
              us immediately at{' '}
              <a
                href="mailto:hello@teamcast.ai"
                className="text-[#6e55cf] hover:underline"
              >
                hello@teamcast.ai
              </a>
              .
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              International Transfer
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Information collected while you use the Site and/or Service,
              including your Personal Information, may be transferred to — and
              maintained on — computers located outside of your state, province,
              country or other governmental jurisdiction where the data
              protection laws may differ from those of your jurisdiction.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              If you are located outside the United States and choose to provide
              information to us, please note that we may transfer the
              information, including your Personal Information, to the United
              States and process it there. In order to provide adequate
              protection for the data transfer, we have in place contractual
              arrangements with our subsidiaries, affiliates and business
              partners in respect of such transfers. By utilizing our Sites
              and/or services, you authorize the international transfer of your
              data, to the United States, where we are based, and to other
              locations where we and/or our service providers operate. Note that
              the Teamcast Platform is maintained and owned by Teamcast Inc., a
              United States entity, however Teamcast stores all Teamcast
              Platform data in Ireland (EU) only.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Third-party Advertising, Links and Content
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our Site may contain links to other sites that are not operated by
              us. We allow third parties, including advertising networks, and
              other advertising service providers, to collect information about
              your online activities through cookies, pixels, local storage, and
              other technologies. These third parties may use this information
              to display advertisements on our Sites and elsewhere online
              tailored to your interests, preferences, and characteristics. We
              have no control over, and assume no responsibility for the
              content, privacy policies or practices of any third-party sites or
              services. We strongly advise you to review the Privacy Policy of
              every site you visit.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Some third parties collect information about users of our Sites to
              provide interest-based advertising on our Sites and elsewhere,
              including across browsers and devices. These third parties may use
              the information they collect on our Sites to make predictions
              about your interests in order to provide you with ads (from us and
              other companies) across the internet.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              For example, we use Meta&apos;s Custom Audience programme. This
              programme allows us, among other things, to display personalised
              advertisements and offers on the Meta platform. This is only if
              you choose to receive personalised advertisements and offers on
              the social media platforms, such as Meta. We only provide
              identifiers to Meta so that Meta can check whether you have an
              account on one of Meta&apos;s platforms. Meta, in turn, only
              provides us with aggregated data about the effectiveness of an
              advertising campaign. This is data that cannot be traced directly
              back to you. This way, we try to make every effort to keep your
              personal data secure and confidential. Please check Meta&apos;s
              privacy policy for more information about how your data is used.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We may participate in similar programmes offered by other third
              parties to display relevant information and personalised
              advertisements via other channels. These may for example include
              programmes offered by other social media platforms, such as
              LinkedIn, X, TikTok, but also search engine platforms, such as
              Google. Please check the privacy policies of these third parties
              for more information.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We process this information only with your consent or when it
              aligns with our legitimate interest in tailoring our marketing
              communications to better reflect your preferences and interests.
              Our goal is to provide you with a personalized and engaging
              customer experience. You have the right to object to the use of
              your personal data for direct marketing purposes, including
              targeted advertising, at any time by following the steps in the
              &ldquo;Your Rights&rdquo; section. Also, to opt out of
              interest-based advertising across browsers and devices from
              companies that participate in the Digital Advertising Alliance or
              Network Advertising Initiative opt-out programs, please visit
              their respective websites.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Children&apos;s Privacy
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We do not knowingly collect Personal Information from children
              under the age of 18. Our Site and Services are not addressed to
              minors. If you are a parent or guardian and you learn that your
              children have provided us with Personal Information, please
              contact us. If we become aware that we have collected Personal
              Information from a child under the age of 18 without verifiable
              parental consent, we will take steps to remove that information
              from our servers.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Your Rights
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your privacy rights vary depending on your location and applicable
              privacy laws. Below are the rights you may have under GDPR, CCPA,
              DPDP, and other privacy regulations:
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Universal Rights (All Users)
              </h3>
              <ul className="text-muted-foreground list-inside list-disc space-y-3 [&>li]:marker:text-[#6e55cf]">
                <li>
                  <strong>Right to Access:</strong> Request a copy of your
                  Personal Information and details about how it&apos;s processed
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Correct inaccurate or
                  incomplete Personal Information
                </li>
                <li>
                  <strong>Right to Erasure (Right to be Forgotten):</strong>{' '}
                  Request deletion of your Personal Information when it&apos;s
                  no longer necessary or you withdraw consent
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> Limit how we
                  process your Personal Information in certain circumstances
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Receive your
                  Personal Information in a portable format or have it
                  transferred to another service
                </li>
                <li>
                  <strong>Right to Object:</strong> Object to processing based
                  on legitimate interests, including direct marketing
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Withdraw your
                  consent at any time for processing that relies on consent
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Additional Rights for EU Users (GDPR)
              </h3>
              <ul className="text-muted-foreground list-inside list-disc space-y-3 [&>li]:marker:text-[#6e55cf]">
                <li>
                  <strong>Right to Human Review:</strong> Request human
                  intervention in automated decision-making that significantly
                  affects you
                </li>
                <li>
                  <strong>Right to Lodge a Complaint:</strong> File a complaint
                  with your local data protection authority
                </li>
                <li>
                  <strong>Cross-Border Transfer Protection:</strong> Your data
                  transfers outside the EU are protected by appropriate
                  safeguards
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Additional Rights for California Users (CCPA)
              </h3>
              <ul className="text-muted-foreground list-inside list-disc space-y-3 [&>li]:marker:text-[#6e55cf]">
                <li>
                  <strong>Right to Know:</strong> Detailed information about
                  what personal information we collect, use, disclose, and sell
                </li>
                <li>
                  <strong>Right to Opt-Out:</strong> Opt-out of the sale or
                  sharing of your personal information (Note: We do not sell
                  personal information)
                </li>
                <li>
                  <strong>Right to Non-Discrimination:</strong> We will not
                  discriminate against you for exercising your privacy rights
                </li>
                <li>
                  <strong>Right to Limit Sensitive Information:</strong> Request
                  that we limit the use of sensitive personal information
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Additional Rights for Indian Users (DPDP)
              </h3>
              <ul className="text-muted-foreground list-inside list-disc space-y-3 [&>li]:marker:text-[#6e55cf]">
                <li>
                  <strong>Right to Grievance Redressal:</strong> Seek resolution
                  for any data protection concerns through our grievance
                  mechanism
                </li>
                <li>
                  <strong>Right to Data Principal Rights:</strong> Exercise your
                  rights as a data principal under Indian law
                </li>
                <li>
                  <strong>Purpose Limitation:</strong> Your data will only be
                  used for the specific recruitment and hiring purposes for
                  which it was collected
                </li>
              </ul>
            </div>

            <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 text-xl font-semibold text-blue-800">
                How to Exercise Your Rights
              </h3>
              <div className="space-y-3 text-blue-700">
                <p>
                  <strong>Email:</strong> Send your request to{' '}
                  <a
                    href="mailto:hello@teamcast.ai"
                    className="font-medium text-[#6e55cf] hover:underline"
                  >
                    hello@teamcast.ai
                  </a>
                </p>
                <p>
                  <strong>Subject Line:</strong> Include &quot;Privacy Rights
                  Request&quot; in your email subject
                </p>
                <p>
                  <strong>Information Required:</strong> Please include your
                  full name, email address associated with your account, and
                  specific details about your request
                </p>
                <p>
                  <strong>Response Time:</strong> We will respond to your
                  request within 30 days (or as required by applicable law)
                </p>
                <p>
                  <strong>Identity Verification:</strong> We may ask for
                  additional information to verify your identity before
                  processing your request
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              For <strong>Right to be Forgotten</strong> requests specifically,
              please email{' '}
              <a
                href="mailto:hello@teamcast.ai"
                className="font-medium text-[#6e55cf] hover:underline"
              >
                hello@teamcast.ai
              </a>{' '}
              with &quot;Data Deletion Request&quot; in the subject line. We
              will process your request in accordance with applicable law and
              may retain certain information as required by legal obligations.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Consent and Legal Basis for Processing
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We process your personal information based on various legal
              grounds depending on your location and the type of data:
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <ul className="text-muted-foreground list-inside list-disc space-y-3 [&>li]:marker:text-[#6e55cf]">
                <li>
                  <strong>Explicit Consent:</strong> For AI-powered interviews,
                  biometric data processing, and marketing communications
                </li>
                <li>
                  <strong>Contract Performance:</strong> To provide our
                  recruitment services and manage client relationships
                </li>
                <li>
                  <strong>Legitimate Interest:</strong> For improving our
                  services, fraud prevention, and security purposes
                </li>
                <li>
                  <strong>Legal Obligation:</strong> To comply with employment
                  law, tax requirements, and regulatory obligations
                </li>
              </ul>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              You can withdraw your consent at any time by contacting us at{' '}
              <a
                href="mailto:hello@teamcast.ai"
                className="text-[#6e55cf] hover:underline"
              >
                hello@teamcast.ai
              </a>
              . Withdrawal of consent will not affect the lawfulness of
              processing before withdrawal.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Changes To This Privacy Policy
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              This Privacy Policy is effective as of the &ldquo;LAST
              REVISED&rdquo; date specified at the top of this Privacy Policy
              and will remain in effect except with respect to any changes in
              its provisions in the future, which will be in effect immediately
              after being posted on this page.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We reserve the right to update or change our Privacy Policy at any
              time and you should check this Privacy Policy periodically. Your
              continued use of the Service after we post any modifications to
              the Privacy Policy on this page will constitute your
              acknowledgment of the modifications and your consent to abide and
              be bound by the modified Privacy Policy.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Questions or Concerns Regarding the Privacy Policy
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              If you have questions or concerns regarding privacy using our
              Service, please contact us at:{' '}
              <a
                href="mailto:hello@teamcast.ai"
                className="text-[#6e55cf] hover:underline"
              >
                hello@teamcast.ai
              </a>
              .
            </p>

            <div className="bg-card rounded-lg border p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-3 h-5 w-5 text-[#6e55cf]" />
                  <div>
                    <div className="text-foreground font-medium">Email</div>
                    <div className="text-muted-foreground">
                      <a
                        href="mailto:hello@teamcast.ai"
                        className="text-[#6e55cf] hover:underline"
                      >
                        hello@teamcast.ai
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-3 h-5 w-5 text-[#6e55cf]" />
                  <div>
                    <div className="text-foreground font-medium">Phone</div>
                    <div className="text-muted-foreground">
                      +1 (650) 695-9495
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-3 h-5 w-5 text-[#6e55cf]" />
                  <div>
                    <div className="text-foreground font-medium">Address</div>
                    <div className="text-muted-foreground">
                      2627 Hanover St, Palo Alto, CA 94304
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
