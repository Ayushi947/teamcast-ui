import { Metadata } from 'next';
import { User, AlertTriangle } from 'lucide-react';
import { createMetadata, seoConfigs } from '@/lib/seo-config';

export const metadata: Metadata = createMetadata({
  ...seoConfigs.privacy,
  title: 'Candidate Privacy Policy - Teamcast.ai',
  description:
    'Privacy policy specifically for candidates using Teamcast.ai recruitment platform',
});

export default function CandidatePrivacyPage() {
  return (
    <div className="bg-background pt-20">
      {/* Header */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6e55cf]/20 to-[#6e55cf]/10 shadow-lg">
              <User className="h-10 w-10 text-[#6e55cf]" />
            </div>
            <h1 className="text-primary mb-6 bg-gradient-to-r from-[#6e55cf] to-[#8b5cf6] bg-clip-text text-5xl font-bold">
              Teamcast.ai Candidate Privacy Policy
            </h1>
            <p className="text-muted-foreground text-xl">
              Effective Date: August 25, 2025
            </p>
            <p className="text-muted-foreground mt-2 text-lg">Version: 1.0</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-[#6e55cf]" />
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    NOTICE
                  </h3>
                  <p className="text-muted-foreground mb-0 text-lg leading-relaxed">
                    This Privacy Policy governs your participation in
                    Teamcast.ai&apos;s AI-powered recruitment platform. By
                    engaging with our assessment and interview processes, you
                    confirm your understanding and acceptance of these data
                    handling practices. Your continued use of our services
                    indicates agreement to the terms outlined below.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              1. About Teamcast.ai
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Teamcast.ai (&quot;Teamcast,&quot; &quot;we,&quot; &quot;us,&quot;
              or &quot;our&quot;) operates an intelligent recruitment technology
              platform designed to streamline talent acquisition through
              artificial intelligence. Our platform delivers comprehensive
              hiring solutions via specialized AI agents that handle sourcing,
              evaluation, profiling, candidate matching, and performance
              analytics. We facilitate connections between qualified
              professionals and employers worldwide through our sophisticated
              AI-driven ecosystem.
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <p className="text-muted-foreground mb-2 font-medium">
                Company Registration:
              </p>
              <p className="text-muted-foreground mb-4">
                Teamcast.ai Inc., Delaware Corporation
              </p>
              <p className="text-muted-foreground mb-2 font-medium">
                Registered Address:
              </p>
              <p className="text-muted-foreground mb-0">
                2627 Hanover St, Palo Alto, CA 94304
              </p>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              2. Information Controller and Privacy Contacts
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Teamcast.ai serves as the information controller for personal data
              processed through our recruitment technology platform.
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">
                Contact Information:
              </h3>
              <ul className="text-muted-foreground space-y-2">
                <li>
                  <strong>Privacy Team:</strong> privacy@Teamcast.ai
                </li>
                <li>
                  <strong>Data Protection Officer:</strong> dpo@Teamcast.ai
                </li>
                <li>
                  <strong>General Inquiries:</strong> info@Teamcast.ai
                </li>
                <li>
                  <strong>Website:</strong> www.Teamcast.ai
                </li>
                <li>
                  <strong>Address:</strong> 2627 Hanover St, Palo Alto, CA 94304
                </li>
              </ul>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              3. Reasons for Data Collection and Processing
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Teamcast.ai collects and utilizes your personal information to
              deliver our recruitment technology services:
            </p>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              3.1 Core Service Functions
            </h3>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Operating AI-driven candidate interviews and evaluations</li>
              <li>
                Executing technical skills testing and behavioral assessments
              </li>
              <li>
                Building detailed professional profiles and capability mappings
              </li>
              <li>
                Connecting qualified candidates with appropriate employment
                opportunities
              </li>
              <li>
                Enabling dialogue between job seekers and hiring organizations
              </li>
              <li>Overseeing recruitment workflows and candidate onboarding</li>
              <li>
                Delivering team dynamics insights and organizational fit
                analysis
              </li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              3.2 Platform Enhancement Activities
            </h3>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Advancing our AI technologies and matching algorithms</li>
              <li>Optimizing platform performance and user interactions</li>
              <li>Supporting research initiatives in recruitment technology</li>
              <li>
                Maintaining system security and preventing unauthorized access
              </li>
              <li>Meeting regulatory compliance and legal requirements</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              3.3 Legal Foundation for Processing
            </h3>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                <strong>Service Agreement:</strong> Fulfilling our recruitment
                service obligations and candidate applications
              </li>
              <li>
                <strong>User Permission:</strong> Obtained specifically for AI
                model training, research activities, or marketing communications
              </li>
              <li>
                <strong>Business Operations:</strong> Advancing our technology
                capabilities, security measures, and organizational functions
              </li>
              <li>
                <strong>Regulatory Compliance:</strong> Adherence to employment
                regulations, data protection statutes, and applicable legal
                frameworks
              </li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              4. Types of Personal Information We Process
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              4.1 Contact and Identification Details
            </h3>
            <div className="mb-8 overflow-x-auto">
              <table className="border-border/50 bg-card w-full table-fixed border-collapse rounded-lg border shadow-sm">
                <thead>
                  <tr className="bg-muted/50 border-border/50 border-b">
                    <th className="border-border/50 text-foreground w-1/3 border-r p-4 text-left text-sm font-semibold">
                      Data Category
                    </th>
                    <th className="text-foreground w-2/3 p-4 text-left text-sm font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Basic Contact
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Complete name, email contact, telephone information
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Professional Networks
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Professional networking profiles including LinkedIn and
                      similar platforms
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Location & Timezone
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Current location details and timezone information
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Employment Status
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Employment eligibility status and visa documentation
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Communication Preferences
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Communication preferences and scheduling availability
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              4.2 Career and Educational Background
            </h3>
            <div className="mb-8 overflow-x-auto">
              <table className="border-border/50 bg-card w-full table-fixed border-collapse rounded-lg border shadow-sm">
                <thead>
                  <tr className="bg-muted/50 border-border/50 border-b">
                    <th className="border-border/50 text-foreground w-1/3 border-r p-4 text-left text-sm font-semibold">
                      Data Category
                    </th>
                    <th className="text-foreground w-2/3 p-4 text-left text-sm font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Professional Documents
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Curriculum vitae, professional portfolios, and work
                      samples
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Work Experience
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Employment timeline, job responsibilities, and career
                      advancement
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Educational Credentials
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Academic credentials, professional certifications, and
                      specialized training
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Skills & Expertise
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Technical competencies, expertise areas, and proficiency
                      levels
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Compensation History
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Compensation expectations and salary history (where
                      legally permitted)
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Professional References
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Professional recommendations and referral contacts
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              4.3 Assessment and Evaluation Records
            </h3>
            <div className="mb-8 overflow-x-auto">
              <table className="border-border/50 bg-card w-full table-fixed border-collapse rounded-lg border shadow-sm">
                <thead>
                  <tr className="bg-muted/50 border-border/50 border-b">
                    <th className="border-border/50 text-foreground w-1/3 border-r p-4 text-left text-sm font-semibold">
                      Assessment Type
                    </th>
                    <th className="text-foreground w-2/3 p-4 text-left text-sm font-semibold">
                      Data Collected
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      AI Interviews
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Voice recordings from AI-conducted interview sessions
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Visual Assessments
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Visual recordings capturing candidate interactions and
                      responses
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Technical Evaluations
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Desktop sharing captures during technical evaluations
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Communication Analysis
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Live conversation transcripts and linguistic analysis
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Behavioral Metrics
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Response timing, speech characteristics, and communication
                      patterns
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Performance Outcomes
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Technical skill evaluation outcomes and performance
                      metrics
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Psychological Insights
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Psychological assessment findings and personality
                      characteristics
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Engagement Data
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Behavioral observations and candidate engagement data
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              4.4 System and Usage Information
            </h3>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                Device specifications (browser type, operating system, hardware
                details)
              </li>
              <li>
                Network identifiers, session tracking, and connection data
              </li>
              <li>Platform interaction patterns and usage analytics</li>
              <li>System performance metrics and technical logs</li>
              <li>Security monitoring data and fraud prevention information</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              4.5 Protected Categories of Information
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Depending on your jurisdiction, these data types may receive
              enhanced protection:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                Psychological profiling and personality evaluation results
              </li>
              <li>
                Voice pattern recognition and facial analysis data (where
                applicable)
              </li>
              <li>
                Medical or health information relevant to job performance (if
                disclosed)
              </li>
              <li>
                Background verification results (where legally permitted and
                job-relevant)
              </li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              5. AI Technology and Data Processing
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              5.1 Our Specialized AI Agents
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Teamcast.ai&apos;s intelligent systems utilize your information
              through the following processes:
            </p>

            <div className="bg-muted/30 mb-6 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                Talent Discovery and Verification
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>Evaluate professional credentials and qualifications</li>
                <li>
                  Assess skill alignment with position requirements and market
                  needs
                </li>
                <li>
                  Analyze organizational culture compatibility and team dynamics
                </li>
                <li>
                  Generate preliminary candidate scoring and priority rankings
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-6 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                Interactive Assessment and Evaluation
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>
                  Facilitate structured AI-driven interviews customized for
                  specific positions
                </li>
                <li>
                  Execute real-time evaluation of candidate responses,
                  communication effectiveness, and technical capabilities
                </li>
                <li>
                  Produce detailed assessment documentation with comprehensive
                  scoring systems
                </li>
                <li>
                  Deliver behavioral profiling and psychological insights based
                  on candidate interactions
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                Candidate Matching and Performance Prediction
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>
                  Develop comprehensive professional profiles with predictive
                  success indicators
                </li>
                <li>
                  Identify optimal candidate-employer alignments and team
                  configurations
                </li>
                <li>
                  Generate ongoing performance forecasts and professional
                  development suggestions
                </li>
                <li>
                  Facilitate integration into existing organizational structures
                  and workflows
                </li>
              </ul>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              6. Machine Learning Enhancement and Model Development
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              6.1 Data Utilization for Technology Advancement
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Teamcast.ai employs de-identified and aggregated information from
              candidate interactions to:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                Enhance AI agent precision and effectiveness in candidate
                evaluation
              </li>
              <li>
                Develop superior matching algorithms and assessment
                methodologies
              </li>
              <li>
                Advance natural language understanding and conversational
                capabilities
              </li>
              <li>
                Strengthen bias detection systems and promote equitable
                recruitment practices
              </li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              6.2 Privacy Safeguards and Protection Measures
            </h3>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                <strong>Identity Removal:</strong> Complete elimination of
                personally identifiable elements before training data
                utilization
              </li>
              <li>
                <strong>Statistical Privacy:</strong> Implementation of
                mathematical noise injection to protect individual data points
              </li>
              <li>
                <strong>Information Minimization:</strong> Collection and
                processing limited to essential data only
              </li>
              <li>
                <strong>Purpose Restriction:</strong> Data usage strictly
                confined to stated recruitment and enhancement objectives
              </li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              6.3 Exclusion Options
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Where technically possible, candidates may request exclusion from
              AI training data usage. Submit such requests to
              privacy@Teamcast.ai. When exclusion is not technically feasible,
              Teamcast.ai implements industry-standard privacy protection
              methods to safeguard your information.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              7. Data Sharing and Recipients
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              7.1 Internal Recipients
            </h3>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Teamcast.ai recruitment and technical staff</li>
              <li>AI model development and data science teams</li>
              <li>Customer support and quality assurance teams</li>
              <li>Security and compliance personnel</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              7.2 External Recipients
            </h3>

            <div className="bg-muted/30 mb-6 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                Potential Employers and Client Companies
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>
                  Your AI interview recordings and assessment results will be
                  shared with prospective employers
                </li>
                <li>
                  Comprehensive candidate profiles including skills, experience,
                  and cultural fit assessments
                </li>
                <li>
                  Performance predictions and team integration recommendations
                </li>
                <li>
                  Contact information for further communication and interview
                  scheduling
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-6 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                Service Providers and Technology Partners
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>
                  Cloud hosting and data storage providers (AWS, Google Cloud,
                  Azure, etc.)
                </li>
                <li>Video processing and streaming services</li>
                <li>Analytics and business intelligence platforms</li>
                <li>Payment processing and financial services</li>
                <li>Security and fraud prevention services</li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-6 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                AI Model Providers
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>
                  Foundational AI model providers (OpenAI, Anthropic, Google,
                  etc.) for model enhancement
                </li>
                <li>Specialized HR tech and assessment tool providers</li>
                <li>
                  Natural language processing and speech recognition services
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                Legal and Regulatory Authorities
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>
                  Government agencies and law enforcement (where legally
                  required)
                </li>
                <li>Regulatory bodies and data protection authorities</li>
                <li>Courts and tribunals (in response to legal proceedings)</li>
              </ul>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              8. International Data Transfers
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Given our global operations and client base spanning the United
              States, Europe, and South Asia (including India, Philippines,
              Bangladesh, and other regions), your data may be transferred
              internationally.
            </p>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              8.1 Transfer Mechanisms and Safeguards
            </h3>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                <strong>Adequacy Decisions:</strong> We rely on European
                Commission adequacy decisions where available
              </li>
              <li>
                <strong>Standard Contractual Clauses (SCCs):</strong> We use
                EU-approved SCCs for transfers to countries without adequacy
                decisions
              </li>
              <li>
                <strong>Binding Corporate Rules:</strong> Internal data
                protection rules for intra-group transfers
              </li>
              <li>
                <strong>Certification Schemes:</strong> We participate in
                recognized certification programs where applicable
              </li>
              <li>
                <strong>Technical and Organizational Measures:</strong>{' '}
                Encryption, access controls, and other security measures
              </li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              8.2 Regional Considerations
            </h3>
            <div className="mb-8 overflow-x-auto">
              <table className="border-border/50 bg-card w-full table-fixed border-collapse rounded-lg border shadow-sm">
                <thead>
                  <tr className="bg-muted/50 border-border/50 border-b">
                    <th className="border-border/50 text-foreground w-1/3 border-r p-4 text-left text-sm font-semibold">
                      Region
                    </th>
                    <th className="border-border/50 text-foreground w-2/3 p-4 text-left text-sm font-semibold">
                      Compliance Framework
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      United States
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Compliance with state privacy laws (CCPA, Virginia CDPA,
                      Colorado CPA, etc.)
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Europe
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Full GDPR compliance including cross-border transfer
                      requirements
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      India
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Compliance with Digital Personal Data Protection Act and
                      emerging regulations
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Philippines
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Adherence to Data Privacy Act of 2012 and NPC regulations
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Bangladesh
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Compliance with Digital Security Act and data protection
                      requirements
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              9. Data Retention and Deletion
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              9.1 Retention Periods
            </h3>
            <div className="mb-8 overflow-x-auto">
              <table className="border-border/50 bg-card w-full table-fixed border-collapse rounded-lg border shadow-sm">
                <thead>
                  <tr className="bg-muted/50 border-border/50 border-b">
                    <th className="border-border/50 text-foreground w-1/3 border-r p-4 text-left text-sm font-semibold">
                      Data Category
                    </th>
                    <th className="border-border/50 text-foreground w-1/3 border-r p-4 text-left text-sm font-semibold">
                      Retention Period
                    </th>
                    <th className="text-foreground w-1/3 p-4 text-left text-sm font-semibold">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Active Candidates
                    </td>
                    <td className="border-border/50 text-foreground border-r p-4 text-sm">
                      Ongoing
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Data retained while your profile is active and for ongoing
                      recruitment purposes
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Successful Placements
                    </td>
                    <td className="border-border/50 text-foreground border-r p-4 text-sm">
                      Employment + 7 years
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Data retained for the duration of employment relationship
                      plus 7 years for legal compliance
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Unsuccessful Applications
                    </td>
                    <td className="border-border/50 text-foreground border-r p-4 text-sm">
                      24 months
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Data retained for 24 months from last interaction for
                      potential future opportunities
                    </td>
                  </tr>
                  <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Withdrawn Consent
                    </td>
                    <td className="border-border/50 text-foreground border-r p-4 text-sm">
                      30 days
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Data deleted within 30 days of consent withdrawal (subject
                      to legal obligations)
                    </td>
                  </tr>
                  <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      Legal Requirements
                    </td>
                    <td className="border-border/50 text-foreground border-r p-4 text-sm">
                      Variable
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Some data may be retained longer to comply with
                      employment, tax, and regulatory requirements
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                      AI Training Data
                    </td>
                    <td className="border-border/50 text-foreground border-r p-4 text-sm">
                      Indefinite
                    </td>
                    <td className="text-muted-foreground p-4 text-sm">
                      Anonymized data used for AI training may be retained
                      indefinitely
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              9.2 Automated Deletion
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We implement automated systems to delete data in accordance with
              our retention policies. However, some data may be retained in
              backup systems for up to an additional 90 days.
            </p>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              9.3 Deletion Limitations
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              We may be unable to delete your data if:
            </p>
            <ul className="text-muted-foreground mb-8 list-inside list-disc space-y-2">
              <li>
                You have ongoing contractual relationships through our platform
              </li>
              <li>Legal or regulatory requirements mandate retention</li>
              <li>The data is necessary for defending legal claims</li>
              <li>
                The data has been anonymized and cannot be attributed to you
              </li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              10. Automated Decision-Making and AI Processing
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              10.1 AI-Powered Recruitment Decisions
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Your application may be subject to automated processing,
              including:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>Initial candidate screening and eligibility assessment</li>
              <li>Skills evaluation and competency matching</li>
              <li>Cultural fit and team compatibility analysis</li>
              <li>Interview scheduling and process management</li>
              <li>Performance prediction and success likelihood scoring</li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              10.2 Human Oversight and Final Decision-Making
            </h3>
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-foreground mb-2 font-semibold">Important:</p>
              <p className="text-muted-foreground">
                Teamcast.ai&apos;s AI agents are never used to make autonomous
                hiring decisions. All AI-generated outputs are reviewed by
                trained human evaluators, with final hiring decisions always
                remaining under human control and judgment.
              </p>
            </div>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              10.3 How Our AI System Works
            </h3>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                <strong>Logic:</strong> Our AI agents analyze responses, skills,
                and fit against job requirements using advanced machine learning
                algorithms
              </li>
              <li>
                <strong>Factors Considered:</strong> Technical skills,
                communication ability, experience relevance, cultural fit, and
                performance predictors
              </li>
              <li>
                <strong>Significance:</strong> AI assessments influence your
                progression through the recruitment process and matching with
                opportunities
              </li>
              <li>
                <strong>Consequences:</strong> AI decisions may affect your
                eligibility for specific roles and priority in candidate
                rankings
              </li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              10.4 Your Rights Regarding AI Decisions
            </h3>
            <ul className="text-muted-foreground mb-8 list-inside list-disc space-y-2">
              <li>
                <strong>Human Review:</strong> Right to request human review of
                any automated decision
              </li>
              <li>
                <strong>Explanation:</strong> Right to receive meaningful
                information about the logic and significance of automated
                processing
              </li>
              <li>
                <strong>Challenge:</strong> Right to contest AI-driven
                assessments and provide additional information
              </li>
              <li>
                <strong>Correction:</strong> Right to correct inaccuracies in
                your profile that may affect AI decisions
              </li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              11. Your Privacy Rights
            </h2>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              11.1 Universal Rights
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Regardless of your location, you have the following rights:
            </p>
            <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-2">
              <li>
                <strong>Access:</strong> Right to access your personal data and
                information about its processing
              </li>
              <li>
                <strong>Rectification:</strong> Right to correct inaccurate or
                incomplete personal data
              </li>
              <li>
                <strong>Deletion:</strong> Right to request deletion of your
                personal data (&quot;right to be forgotten&quot;)
              </li>
              <li>
                <strong>Restriction:</strong> Right to restrict processing in
                certain circumstances
              </li>
              <li>
                <strong>Objection:</strong> Right to object to processing based
                on legitimate interests or direct marketing
              </li>
              <li>
                <strong>Data Portability:</strong> Right to receive your data in
                a structured, machine-readable format
              </li>
            </ul>

            <h3 className="text-foreground mt-8 mb-4 text-xl font-semibold">
              11.2 Additional Rights by Region
            </h3>

            <div className="bg-muted/30 mb-6 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                European Union (GDPR)
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>Right to withdraw consent at any time</li>
                <li>
                  Right to human intervention in automated decision-making
                </li>
                <li>Right to lodge a complaint with supervisory authorities</li>
                <li>Enhanced rights regarding automated profiling</li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-6 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                United States (State Privacy Laws)
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>
                  Right to know about personal information collected and sold
                </li>
                <li>
                  Right to opt-out of sale or sharing of personal information
                </li>
                <li>Right to correct inaccurate personal information</li>
                <li>
                  Right to non-discrimination for exercising privacy rights
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h4 className="text-foreground mb-3 text-lg font-semibold">
                Asia-Pacific Region
              </h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-2">
                <li>Right to be informed about data processing purposes</li>
                <li>
                  Right to consent to processing of sensitive personal data
                </li>
                <li>Right to access and correct personal information</li>
                <li>Right to complain to local data protection authorities</li>
              </ul>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              12. Data Security and Protection
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We implement comprehensive technical and organizational measures
              to protect your personal data:
            </p>

            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-foreground mb-4 text-xl font-semibold">
                  12.1 Technical Safeguards
                </h3>
                <ul className="text-muted-foreground list-inside list-disc space-y-2">
                  <li>End-to-end encryption for data in transit and at rest</li>
                  <li>Multi-factor authentication and access controls</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Automated threat detection and response systems</li>
                  <li>
                    Secure cloud infrastructure with industry-leading providers
                  </li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-foreground mb-4 text-xl font-semibold">
                  12.2 Organizational Measures
                </h3>
                <ul className="text-muted-foreground list-inside list-disc space-y-2">
                  <li>
                    Regular employee training on data protection and privacy
                  </li>
                  <li>Strict access controls and need-to-know principles</li>
                  <li>
                    Data protection impact assessments for new processing
                    activities
                  </li>
                  <li>
                    Incident response procedures and breach notification
                    protocols
                  </li>
                  <li>Regular audits and compliance monitoring</li>
                </ul>
              </div>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              13. Data Breach Notification
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              In the event of a data breach that poses a risk to your rights and
              freedoms, we will:
            </p>
            <ul className="text-muted-foreground mb-8 list-inside list-disc space-y-2">
              <li>
                Notify relevant supervisory authorities within 72 hours where
                required
              </li>
              <li>
                Inform affected individuals without undue delay if high risk is
                involved
              </li>
              <li>
                Provide clear information about the nature and impact of the
                breach
              </li>
              <li>
                Detail the measures taken to address the breach and prevent
                recurrence
              </li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              14. Children&apos;s Privacy
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Teamcast.ai does not knowingly collect personal data from
              individuals under 18 years of age (or the applicable age of
              majority in your jurisdiction). Our services are designed for
              adult candidates seeking employment opportunities. If we become
              aware that we have collected personal data from a minor, we will
              take immediate steps to delete such information.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              15. Third-Party Links and Integrations
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Our platform may contain links to third-party websites or
              integrate with external services (such as LinkedIn, ATS systems,
              or client company platforms). This Privacy Policy applies only to
              Teamcast.ai. We are not responsible for the privacy practices of
              third parties, and we encourage you to review their privacy
              policies before providing any personal information.
            </p>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              16. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, legal requirements, or service
              offerings. When we make material changes:
            </p>
            <ul className="text-muted-foreground mb-8 list-inside list-disc space-y-2">
              <li>
                We will notify you via email at least 30 days before the changes
                take effect
              </li>
              <li>We will post a prominent notice on our website</li>
              <li>
                We will update the &quot;Effective Date&quot; at the top of this
                policy
              </li>
              <li>
                For material changes affecting your rights, we may seek your
                renewed consent
              </li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              17. Complaints and Regulatory Contact
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              You have the right to lodge a complaint with relevant data
              protection authorities:
            </p>
            <ul className="text-muted-foreground mb-8 list-inside list-disc space-y-2">
              <li>
                <strong>European Union:</strong> Your local Data Protection
                Authority or the European Data Protection Board
              </li>
              <li>
                <strong>United Kingdom:</strong> Information Commissioner&apos;s
                Office (ICO)
              </li>
              <li>
                <strong>United States:</strong> Federal Trade Commission (FTC)
                or relevant state attorney general
              </li>
              <li>
                <strong>India:</strong> Data Protection Board of India
              </li>
              <li>
                <strong>Philippines:</strong> National Privacy Commission (NPC)
              </li>
              <li>
                <strong>Bangladesh:</strong> Bangladesh Telecommunication
                Regulatory Commission (BTRC)
              </li>
            </ul>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              18. Contact Information
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              For questions about this Privacy Policy or to exercise your
              rights:
            </p>

            <div className="bg-muted/30 mb-8 rounded-lg p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">
                Teamcast.ai Privacy Team
              </h3>
              <div className="overflow-x-auto">
                <table className="border-border/50 bg-card w-full table-fixed border-collapse rounded-lg border shadow-sm">
                  <thead>
                    <tr className="bg-muted/50 border-border/50 border-b">
                      <th className="border-border/50 text-foreground w-1/3 border-r p-4 text-left text-sm font-semibold">
                        Contact Method
                      </th>
                      <th className="text-foreground w-2/3 p-4 text-left text-sm font-semibold">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                      <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                        Privacy Team Email
                      </td>
                      <td className="text-muted-foreground p-4 text-sm">
                        privacy@Teamcast.ai
                      </td>
                    </tr>
                    <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                      <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                        Data Protection Officer
                      </td>
                      <td className="text-muted-foreground p-4 text-sm">
                        dpo@Teamcast.ai
                      </td>
                    </tr>
                    <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                      <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                        General Support
                      </td>
                      <td className="text-muted-foreground p-4 text-sm">
                        support@Teamcast.ai
                      </td>
                    </tr>
                    <tr className="border-border/50 bg-muted/20 hover:bg-muted/30 border-b transition-colors">
                      <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                        Website
                      </td>
                      <td className="text-muted-foreground p-4 text-sm">
                        www.Teamcast.ai
                      </td>
                    </tr>
                    <tr className="border-border/50 hover:bg-muted/20 border-b transition-colors">
                      <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                        Business Address
                      </td>
                      <td className="text-muted-foreground p-4 text-sm">
                        2627 Hanover St, Palo Alto, CA 94304
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="border-border/50 text-foreground border-r p-4 text-sm font-medium">
                        Response Time
                      </td>
                      <td className="text-muted-foreground p-4 text-sm">
                        We will respond to privacy requests within 30 days (or
                        as required by local law).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="text-foreground mt-12 mb-6 text-2xl font-bold">
              Candidate consent and acknowledgement
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              By participating in the Teamcast.ai recruitment process, including
              AI interviews, skills assessments, and psychometric evaluations, I
              acknowledge that:{' '}
            </p>
            <ul className="text-muted-foreground mb-8 list-inside list-disc space-y-2">
              <li> I have read and understood this Privacy Policy</li>
              <li>
                {' '}
                I consent to the collection, processing, and use of my personal
                data as described
              </li>
              <li>
                {' '}
                I agree to the international transfer of my data as necessary
                for service provision
              </li>
              <li>I understand my rights and how to exercise them</li>
              <li>
                {' '}
                I consent to sharing my information with potential employers and
                clients
              </li>
            </ul>

            <ul className="text-muted-foreground mb-8 list-inside list-disc space-y-2">
              <li>
                <strong>Special Consent for Sensitive Data Processing:</strong>{' '}
                Where applicable, I provide explicit consent for the processing
                of sensitive personal data including psychometric assessments,
                biometric identifiers, and other sensitive information relevant
                to recruitment.
              </li>
              <li>
                <strong> Timestamp Requirement:</strong> This consent will be
                recorded with a timestamp when you proceed with the AI interview
                process.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
