import { Metadata } from 'next';
import { FileText, Mail, AlertTriangle, Calendar } from 'lucide-react';
import { createMetadata, seoConfigs } from '@/lib/seo-config';

export const metadata: Metadata = createMetadata(seoConfigs.terms);

export default function TermsPage() {
  return (
    <div className="bg-background pt-20">
      {/* Header */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6e55cf]/20 to-[#6e55cf]/10 shadow-lg">
              <FileText className="h-10 w-10 text-[#6e55cf]" />
            </div>
            <h1 className="text-primary mb-6 bg-gradient-to-r from-[#6e55cf] to-[#8b5cf6] bg-clip-text text-5xl font-bold">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-xl">
              Last updated: July 1, 2025
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <div className="bg-muted/30 mb-8 rounded-lg">
              <p className="text-muted-foreground mb-0 text-lg leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) govern your use of
                the Teamcast platform and services. By accessing or using our
                services, you agree to be bound by these Terms.
              </p>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              By accessing, browsing, or using the Teamcast platform, mobile
              application, or any related services (collectively,
              &quot;Services&quot;), you acknowledge that you have read,
              understood, and agree to be bound by these Terms and our Privacy
              Policy. If you do not agree to these Terms, you may not access or
              use our Services.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Teamcast provides an AI-powered hiring and recruitment platform
              that enables:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                Companies to post job listings and find qualified candidates
              </li>
              <li>
                Candidates to create profiles, apply for jobs, and participate
                in interviews
              </li>
              <li>AI-driven candidate matching and screening</li>
              <li>Interview scheduling and management tools</li>
              <li>Analytics and reporting capabilities</li>
              <li>Communication and collaboration features</li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              3. User Accounts and Registration
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Account Creation
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              To access certain features of our Services, you must create an
              account. When creating an account, you agree to:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Account Types
            </h3>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                <strong>Candidates:</strong> Individual users seeking employment
                opportunities
              </li>
              <li>
                <strong>Clients:</strong> Companies and organizations using our
                hiring platform
              </li>
              <li>
                <strong>Partners:</strong> Third-party service providers and
                integrators
              </li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              4. Acceptable Use Policy
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Permitted Uses
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You may use our Services for lawful business purposes related to
              hiring and recruitment, including:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Posting legitimate job opportunities</li>
              <li>Searching for and communicating with potential candidates</li>
              <li>Creating and maintaining professional profiles</li>
              <li>Participating in the interview and hiring process</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Prohibited Uses
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You agree not to use our Services to:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Post false, misleading, or discriminatory job listings</li>
              <li>Harvest or collect user information without authorization</li>
              <li>Spam, harass, or send unsolicited communications</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Circumvent security measures or access restrictions</li>
              <li>
                Use automated systems to access our Services without permission
              </li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              5. Content and Intellectual Property
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Your Content
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You retain ownership of content you submit to our platform
              (&quot;User Content&quot;). By submitting User Content, you grant
              us:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                A worldwide, non-exclusive license to use, display, and
                distribute your content
              </li>
              <li>
                The right to modify and format your content for platform
                optimization
              </li>
              <li>
                Permission to use your content for AI training and service
                improvement
              </li>
              <li>
                The ability to sublicense these rights to service providers
              </li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Our Content
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              All Teamcast content, including software, algorithms, text,
              graphics, logos, and trademarks, is protected by intellectual
              property laws. You may not copy, modify, distribute, or create
              derivative works without our written permission.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              6. Payment Terms
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Subscription Fees
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Access to certain features requires a paid subscription. Payment
              terms include:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                Fees are charged in advance for the applicable subscription
                period
              </li>
              <li>All fees are non-refundable unless otherwise specified</li>
              <li>Subscription automatically renews unless cancelled</li>
              <li>Price changes require 30 days advance notice</li>
              <li>Late payments may result in service suspension</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Free Trial
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Free trials are subject to additional terms and may require
              payment information. Trials automatically convert to paid
              subscriptions unless cancelled before the trial period ends.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              7. Privacy and Data Protection
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your privacy is important to us. Our collection, use, and
              protection of your personal information is governed by our Privacy
              Policy, which is incorporated into these Terms by reference. By
              using our Services, you consent to our data practices as described
              in the Privacy Policy.
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                AI and Automated Decision-Making Transparency
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Our Services utilize artificial intelligence and automated
                decision-making systems. We are committed to transparency about
                these systems:
              </p>
              <ul className="text-muted-foreground mb-4 list-inside list-disc space-y-2">
                <li>
                  We will inform you when AI is being used in processes that
                  significantly affect you
                </li>
                <li>
                  You have the right to request human review of automated
                  decisions
                </li>
                <li>
                  You can request explanations of how automated systems work and
                  their decision criteria
                </li>
                <li>
                  All final hiring decisions involve human oversight and review
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Data Subject Rights
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Depending on your location, you may have specific rights
                regarding your personal data:
              </p>
              <ul className="text-muted-foreground mb-4 list-inside list-disc space-y-2">
                <li>
                  <strong>Right to Access:</strong> Request copies of your
                  personal information
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Correct inaccurate
                  personal information
                </li>
                <li>
                  <strong>Right to Erasure (Right to be Forgotten):</strong>{' '}
                  Request deletion of your personal data by emailing{' '}
                  <a
                    href="mailto:hello@teamcast.ai"
                    className="text-[#6e55cf] hover:underline"
                  >
                    hello@teamcast.ai
                  </a>
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Receive your data
                  in a portable format
                </li>
                <li>
                  <strong>Right to Object:</strong> Object to certain types of
                  data processing
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> Limit how we
                  process your data
                </li>
              </ul>
              <p className="text-muted-foreground mb-0 text-sm">
                To exercise these rights, contact us at{' '}
                <a
                  href="mailto:hello@teamcast.ai"
                  className="text-[#6e55cf] hover:underline"
                >
                  hello@teamcast.ai
                </a>{' '}
                with &quot;Privacy Rights Request&quot; in the subject line.
              </p>
            </div>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Jurisdiction-Specific Compliance
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-foreground mb-2 text-lg font-medium">
                    EU Users (GDPR)
                  </h4>
                  <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                    <li>
                      Explicit consent required for data processing and AI
                      decision-making
                    </li>
                    <li>
                      Right to lodge complaints with local data protection
                      authorities
                    </li>
                    <li>
                      Cross-border data transfers protected by appropriate
                      safeguards
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-foreground mb-2 text-lg font-medium">
                    California Users (CCPA)
                  </h4>
                  <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                    <li>
                      Right to know what personal information is collected and
                      how it&apos;s used
                    </li>
                    <li>
                      Right to opt-out of sale/sharing of personal information
                      (we do not sell data)
                    </li>
                    <li>
                      Right to non-discrimination for exercising privacy rights
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-foreground mb-2 text-lg font-medium">
                    Indian Users (DPDP)
                  </h4>
                  <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                    <li>
                      Consent-based data processing with clear purpose
                      limitation
                    </li>
                    <li>
                      Right to grievance redressal and data principal rights
                    </li>
                    <li>Secure cross-border data flow protections</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              8. Service Availability and Modifications
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Service Availability
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We strive to maintain high service availability but cannot
              guarantee uninterrupted access. Services may be temporarily
              unavailable due to:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Scheduled maintenance and updates</li>
              <li>Technical difficulties or system failures</li>
              <li>Third-party service interruptions</li>
              <li>Force majeure events</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Service Modifications
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any aspect
              of our Services at any time. We will provide reasonable notice of
              material changes that significantly impact your use of the
              Services.
            </p>

            <div className="my-8 rounded-lg border border-orange-200 bg-orange-50 p-6">
              <div className="flex items-start">
                <AlertTriangle className="mt-1 mr-3 h-6 w-6 flex-shrink-0 text-orange-600" />
                <div>
                  <h3 className="mb-2 font-semibold text-orange-800">
                    Important Notice
                  </h3>
                  <p className="text-sm leading-relaxed text-orange-700">
                    These Terms may be updated periodically. Continued use of
                    our Services after changes are posted constitutes acceptance
                    of the updated Terms.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              9. AI and Technology Use
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Artificial Intelligence Systems
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our Services incorporate various AI and machine learning
              technologies to enhance the hiring process. These systems are
              designed to:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Match candidates with appropriate job opportunities</li>
              <li>Screen resumes and applications efficiently</li>
              <li>Assess skills and qualifications objectively</li>
              <li>Predict candidate success and cultural fit</li>
              <li>Automate routine administrative tasks</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Human Oversight and Transparency
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              While we use AI to improve efficiency and accuracy, we maintain
              human oversight in all significant decisions:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                All final hiring decisions require human review and approval
              </li>
              <li>
                Candidates can request human review of any automated assessment
              </li>
              <li>
                We provide explanations for AI-driven recommendations when
                requested
              </li>
              <li>
                Our systems are regularly audited for fairness and bias
                prevention
              </li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Consent for AI Processing
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              By using our Services, you consent to AI processing of your
              information for recruitment purposes. This consent includes:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                Analysis of your profile, resume, and application materials
              </li>
              <li>Automated matching with job opportunities</li>
              <li>Skills assessment and qualification evaluation</li>
              <li>Predictive analysis for role suitability</li>
            </ul>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You can withdraw this consent at any time by contacting us at{' '}
              <a
                href="mailto:hello@teamcast.ai"
                className="text-[#6e55cf] hover:underline"
              >
                hello@teamcast.ai
              </a>
              .
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              10. Data Retention and Deletion
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We retain your personal information only as long as necessary to
              fulfill the purposes outlined in our Privacy Policy and these
              Terms, or as required by law.
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Data Retention Periods
              </h3>
              <ul className="text-muted-foreground mb-4 list-inside list-disc space-y-2">
                <li>
                  <strong>Active Accounts:</strong> Data retained while your
                  account is active and for a reasonable period thereafter
                </li>
                <li>
                  <strong>Inactive Accounts:</strong> Data may be deleted after
                  3 years of inactivity (with notice)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> Some data may be retained
                  longer to comply with legal obligations
                </li>
                <li>
                  <strong>Aggregated Data:</strong> Anonymous, aggregated data
                  may be retained indefinitely for research and improvement
                </li>
              </ul>

              <h3 className="text-foreground mb-4 text-xl font-semibold">
                Right to be Forgotten
              </h3>
              <p className="text-muted-foreground mb-0 leading-relaxed">
                You can request deletion of your personal data at any time by
                emailing{' '}
                <a
                  href="mailto:hello@teamcast.ai"
                  className="text-[#6e55cf] hover:underline"
                >
                  hello@teamcast.ai
                </a>{' '}
                with &quot;Data Deletion Request&quot; in the subject line. We
                will process your request within 30 days, subject to any legal
                retention requirements.
              </p>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              11. Disclaimers and Limitations
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Disclaimers
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our Services are provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind. We disclaim all
              warranties, express or implied, including:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Merchantability and fitness for a particular purpose</li>
              <li>Non-infringement of third-party rights</li>
              <li>Accuracy, completeness, or timeliness of information</li>
              <li>Continuous, uninterrupted, or secure access</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Limitation of Liability
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              To the maximum extent permitted by law, Teamcast shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, including lost profits, data loss, or business
              interruption, regardless of the theory of liability.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              12. Termination
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Termination by You
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You may terminate your account at any time by following the
              account closure process in your settings. Termination does not
              entitle you to a refund of any fees already paid.
            </p>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              Termination by Us
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We may suspend or terminate your account immediately if you:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Violate these Terms or our policies</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Fail to pay required fees</li>
              <li>Pose a security risk to our platform or users</li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              13. Governing Law and Dispute Resolution
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              These Terms are governed by the laws of California, United States,
              without regard to conflict of law principles. Any disputes will be
              resolved through binding arbitration in accordance with the rules
              of the American Arbitration Association.
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-xl font-semibold">
                International Users
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                For users outside the United States, additional local laws may
                apply:
              </p>
              <ul className="text-muted-foreground mb-0 list-inside list-disc space-y-2">
                <li>
                  <strong>EU Users:</strong> GDPR compliance requirements and
                  local data protection laws
                </li>
                <li>
                  <strong>UK Users:</strong> UK GDPR and Data Protection Act
                  2018
                </li>
                <li>
                  <strong>California Users:</strong> CCPA and CPRA privacy
                  rights
                </li>
                <li>
                  <strong>Indian Users:</strong> Digital Personal Data
                  Protection Act 2023
                </li>
                <li>
                  <strong>Canadian Users:</strong> PIPEDA and provincial privacy
                  laws
                </li>
              </ul>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              14. Contact Information
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              If you have questions about these Terms or need to contact our
              legal department, please reach out to us at:{' '}
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
