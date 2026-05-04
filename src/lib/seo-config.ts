import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  openGraph: {
    title: string;
    description: string;
    type: string;
    url?: string;
    image?: string;
    siteName?: string;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
    image?: string;
  };
  robots?: string;
  canonical?: string;
  alternates?: {
    canonical?: string;
  };
}

export const defaultSEOConfig: Partial<SEOConfig> = {
  openGraph: {
    title: 'Teamcast - AI-Powered Hiring Platform',
    description:
      'Transform your hiring process with AI-powered candidate matching, automated screening, and smart interviews.',
    type: 'website',
    siteName: 'Teamcast',
    image: '/logos/social/teamcast-logo-social-share.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teamcast - AI-Powered Hiring Platform',
    description:
      'Transform your hiring process with AI-powered candidate matching, automated screening, and smart interviews.',
  },
  robots: 'index, follow',
};

export const createMetadata = (config: SEOConfig): Metadata => {
  const ogImage = config.openGraph?.image || defaultSEOConfig.openGraph?.image;
  const twitterImage = config.twitter?.image || ogImage;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    ),
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    robots: config.robots || defaultSEOConfig.robots,
    openGraph: {
      ...defaultSEOConfig.openGraph,
      ...config.openGraph,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      ...defaultSEOConfig.twitter,
      title: config.twitter?.title || config.title,
      description: config.twitter?.description || config.description,
      images: twitterImage ? [{ url: twitterImage }] : undefined,
    },
    alternates: config.alternates,
  };
};

// SEO configurations for each page
export const seoConfigs = {
  about: {
    title: 'About Us | Teamcast - AI-Powered Hiring Platform',
    description:
      "Learn about Teamcast's mission to transform hiring with AI. Discover our story, values, and the team behind the future of recruitment.",
    keywords:
      'about teamcast, AI hiring company, recruitment platform, hiring technology, team management, AI recruitment',
    openGraph: {
      title: 'About Us | Teamcast - AI-Powered Hiring Platform',
      description:
        "Learn about Teamcast's mission to transform hiring with AI. Discover our story, values, and the team behind the future of recruitment.",
      type: 'website',
      url: '/about',
    },
  },
  features: {
    title: 'Features | Teamcast - AI-Powered Hiring Platform',
    description:
      "Discover Teamcast's powerful features: AI-driven candidate matching, automated screening, smart interviews, and comprehensive team management tools.",
    keywords:
      'AI hiring features, candidate matching, automated screening, interview platform, team management, recruitment software',
    openGraph: {
      title: 'Features | Teamcast - AI-Powered Hiring Platform',
      description:
        "Discover Teamcast's powerful features: AI-driven candidate matching, automated screening, smart interviews, and comprehensive team management tools.",
      type: 'website',
      url: '/features',
    },
  },
  pricing: {
    title: 'Pricing | Teamcast - AI-Powered Hiring Platform',
    description:
      'Choose the perfect Teamcast plan for your organization. Transparent pricing for AI-powered hiring solutions with free trial available.',
    keywords:
      'teamcast pricing, hiring platform cost, AI recruitment pricing, recruitment software pricing, hiring tools cost',
    openGraph: {
      title: 'Pricing | Teamcast - AI-Powered Hiring Platform',
      description:
        'Choose the perfect Teamcast plan for your organization. Transparent pricing for AI-powered hiring solutions with free trial available.',
      type: 'website',
      url: '/pricing',
    },
  },
  contact: {
    title: 'Contact Us | Teamcast - AI-Powered Hiring Platform',
    description:
      'Get in touch with Teamcast. Contact our team for support, sales inquiries, or to learn more about our AI-powered hiring platform.',
    keywords:
      'contact teamcast, hiring platform support, AI recruitment contact, teamcast sales, customer support',
    openGraph: {
      title: 'Contact Us | Teamcast - AI-Powered Hiring Platform',
      description:
        'Get in touch with Teamcast. Contact our team for support, sales inquiries, or to learn more about our AI-powered hiring platform.',
      type: 'website',
      url: '/contact',
    },
  },
  blog: {
    title: 'Blog | Teamcast - Insights on AI-Powered Hiring',
    description:
      'Stay updated with the latest trends in AI-powered recruitment, hiring best practices, and industry insights from Teamcast.',
    keywords:
      'hiring blog, AI recruitment insights, hiring trends, recruitment best practices, HR technology, talent acquisition',
    openGraph: {
      title: 'Blog | Teamcast - Insights on AI-Powered Hiring',
      description:
        'Stay updated with the latest trends in AI-powered recruitment, hiring best practices, and industry insights from Teamcast.',
      type: 'website',
      url: '/blog',
    },
  },
  careers: {
    title: 'Careers | Teamcast - Join Our Team',
    description:
      'Join Teamcast and help shape the future of AI-powered hiring. Explore open positions and become part of our mission to transform recruitment.',
    keywords:
      'teamcast careers, hiring jobs, AI company jobs, recruitment software careers, remote work, tech jobs',
    openGraph: {
      title: 'Careers | Teamcast - Join Our Team',
      description:
        'Join Teamcast and help shape the future of AI-powered hiring. Explore open positions and become part of our mission to transform recruitment.',
      type: 'website',
      url: '/careers',
    },
  },
  privacy: {
    title: 'Privacy Policy | Teamcast',
    description:
      'Teamcast Privacy Policy - Learn how we collect, use, and protect your personal information.',
    keywords:
      'teamcast privacy policy, data protection, personal information, privacy rights, GDPR compliance',
    openGraph: {
      title: 'Privacy Policy | Teamcast',
      description:
        'Teamcast Privacy Policy - Learn how we collect, use, and protect your personal information.',
      type: 'website',
      url: '/privacy',
    },
  },
  terms: {
    title: 'Terms of Service | Teamcast',
    description:
      'Teamcast Terms of Service - Terms and conditions for using our AI-powered hiring platform.',
    keywords:
      'teamcast terms of service, terms and conditions, user agreement, platform terms, legal terms',
    openGraph: {
      title: 'Terms of Service | Teamcast',
      description:
        'Teamcast Terms of Service - Terms and conditions for using our AI-powered hiring platform.',
      type: 'website',
      url: '/terms',
    },
  },
  cookiePolicy: {
    title: 'Cookie Policy | Teamcast',
    description:
      'Teamcast Cookie Policy - Learn how we use cookies and similar technologies on our website.',
    keywords:
      'teamcast cookie policy, cookies, tracking technologies, website cookies, privacy cookies',
    openGraph: {
      title: 'Cookie Policy | Teamcast',
      description:
        'Teamcast Cookie Policy - Learn how we use cookies and similar technologies on our website.',
      type: 'website',
      url: '/cookiePolicy',
    },
  },
  apis: {
    title: 'API Documentation | Teamcast',
    description:
      "Integrate Teamcast's AI-powered hiring platform with your applications using our comprehensive API documentation.",
    keywords:
      'teamcast API, hiring platform API, recruitment API, integration, developer documentation',
    openGraph: {
      title: 'API Documentation | Teamcast',
      description:
        "Integrate Teamcast's AI-powered hiring platform with your applications using our comprehensive API documentation.",
      type: 'website',
      url: '/apis',
    },
  },
  candidate: {
    title: 'Teamcast - AI-Powered Job Platform',
    description:
      "Find your dream job with Teamcast's AI-powered platform. Create your profile, apply to jobs, and participate in smart interviews.",
    keywords:
      'job search, candidate platform, AI interviews, job applications, career opportunities, smart hiring',
    openGraph: {
      title: 'Teamcast - AI-Powered Job Platform',
      description:
        "Find your dream job with Teamcast's AI-powered platform. Create your profile, apply to jobs, and participate in smart interviews.",
      type: 'website',
      url: '/candidate',
    },
  },
  clientLanding: {
    title: 'Teamcast - AI-Powered Hiring Platform',
    description:
      "Transform your hiring process with Teamcast's AI-powered platform. Find top talent, streamline interviews, and build high-performing teams.",
    keywords:
      'hiring platform, AI recruitment, talent acquisition, candidate matching, interview automation, HR technology',
    openGraph: {
      title: 'Teamcast - AI-Powered Hiring Platform',
      description:
        "Transform your hiring process with Teamcast's AI-powered platform. Find top talent, streamline interviews, and build high-performing teams.",
      type: 'website',
      url: '/client',
    },
  },
  clientCaseStudies: {
    title: 'Client Case Studies | Teamcast - AI-Powered Hiring Platform',
    description:
      'Explore how companies are transforming their hiring process with Teamcast AI-powered platform. Real success stories and ROI examples.',
    keywords:
      'case studies, client success, hiring transformation, AI recruitment, ROI, success stories, hiring platform results',
    openGraph: {
      title: 'Client Case Studies | Teamcast - AI-Powered Hiring Platform',
      description:
        'Explore how companies are transforming their hiring process with Teamcast AI-powered platform. Real success stories and ROI examples.',
      type: 'website',
      url: '/client/case-studies',
    },
  },
  candidateCaseStudies: {
    title: 'Candidate Success Stories | Teamcast - AI-Powered Job Platform',
    description:
      'Explore success stories and case studies of candidates who found their dream jobs through our AI-powered platform.',
    keywords:
      'candidate success stories, job search success, career advancement, AI job matching, candidate testimonials',
    openGraph: {
      title: 'Candidate Success Stories | Teamcast - AI-Powered Job Platform',
      description:
        'Explore success stories and case studies of candidates who found their dream jobs through our AI-powered platform.',
      type: 'website',
      url: '/candidate/case-studies',
    },
  },
  candidateCompanies: {
    title: 'Browse Companies & Jobs | Teamcast - AI-Powered Job Platform',
    description:
      'Discover top companies and job opportunities. Browse through our curated list of companies and find your perfect career match.',
    keywords:
      'job search, company listings, job opportunities, career search, AI job matching, company profiles',
    openGraph: {
      title: 'Browse Companies & Jobs | Teamcast - AI-Powered Job Platform',
      description:
        'Discover top companies and job opportunities. Browse through our curated list of companies and find your perfect career match.',
      type: 'website',
      url: '/candidate/companies',
    },
  },
  candidateInterviews: {
    title: 'Interview Preparation | Teamcast - AI-Powered Job Platform',
    description:
      'Prepare for your interviews with our comprehensive resources and guidance. AI-powered interview preparation tools and tips.',
    keywords:
      'interview preparation, interview tips, AI interviews, job interview guidance, interview resources',
    openGraph: {
      title: 'Interview Preparation | Teamcast - AI-Powered Job Platform',
      description:
        'Prepare for your interviews with our comprehensive resources and guidance. AI-powered interview preparation tools and tips.',
      type: 'website',
      url: '/candidate/interviews',
    },
  },
  clientTalent: {
    title: 'Browse Talent | Teamcast - AI-Powered Hiring Platform',
    description:
      'Discover exceptional candidates from our curated pool of verified professionals. Use AI-powered matching to find the best fit for your team.',
    keywords:
      'talent search, candidate browsing, verified professionals, AI matching, hiring candidates, talent pool, recruitment platform',
    openGraph: {
      title: 'Browse Talent | Teamcast - AI-Powered Hiring Platform',
      description:
        'Discover exceptional candidates from our curated pool of verified professionals. Use AI-powered matching to find the best fit for your team.',
      type: 'website',
      url: '/client/talent',
    },
  },
};
