import { FC } from 'react';

interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint: {
    telephone: string;
    contactType: string;
    email: string;
  };
  sameAs: string[];
}

interface WebSiteSchema {
  name: string;
  url: string;
  description: string;
  potentialAction: {
    target: string;
    'query-input': string;
  };
}

interface BreadcrumbSchema {
  items: Array<{
    name: string;
    url: string;
  }>;
}

interface FAQSchema {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

interface ProductSchema {
  name: string;
  description: string;
  url: string;
  category: string;
  offers: {
    price: string;
    priceCurrency: string;
    availability: string;
  };
}

interface StructuredDataProps {
  type: 'organization' | 'website' | 'breadcrumb' | 'faq' | 'product';
  data:
    | OrganizationSchema
    | WebSiteSchema
    | BreadcrumbSchema
    | FAQSchema
    | ProductSchema;
}

export const StructuredData: FC<StructuredDataProps> = ({ type, data }) => {
  const generateSchema = () => {
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: (data as OrganizationSchema).name,
          url: (data as OrganizationSchema).url,
          logo: (data as OrganizationSchema).logo,
          description: (data as OrganizationSchema).description,
          address: {
            '@type': 'PostalAddress',
            ...(data as OrganizationSchema).address,
          },
          contactPoint: {
            '@type': 'ContactPoint',
            ...(data as OrganizationSchema).contactPoint,
          },
          sameAs: (data as OrganizationSchema).sameAs,
        };

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: (data as WebSiteSchema).name,
          url: (data as WebSiteSchema).url,
          description: (data as WebSiteSchema).description,
          potentialAction: {
            '@type': 'SearchAction',
            ...(data as WebSiteSchema).potentialAction,
          },
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: (data as BreadcrumbSchema).items.map(
            (item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.name,
              item: item.url,
            })
          ),
        };

      case 'faq':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: (data as FAQSchema).questions.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer,
            },
          })),
        };

      case 'product':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: (data as ProductSchema).name,
          description: (data as ProductSchema).description,
          url: (data as ProductSchema).url,
          applicationCategory: (data as ProductSchema).category,
          offers: {
            '@type': 'Offer',
            ...(data as ProductSchema).offers,
          },
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Predefined schemas for common use cases
export const teamcastOrganizationSchema: OrganizationSchema = {
  name: 'Teamcast',
  url: 'https://teamcast.ai',
  logo: 'https://teamcast.ai/images/logos/logo.svg',
  description:
    'AI-powered hiring and team management platform that transforms the way organizations discover, evaluate, and hire top talent.',
  address: {
    streetAddress: '2627 Hanover St',
    addressLocality: 'Palo Alto',
    addressRegion: 'CA',
    postalCode: '94304',
    addressCountry: 'US',
  },
  contactPoint: {
    telephone: '+1 (650) 695-9495',
    contactType: 'customer service',
    email: 'hello@teamcast.com',
  },
  sameAs: [
    'https://linkedin.com/company/teamcast',
    'https://twitter.com/teamcast',
    'https://facebook.com/teamcast',
  ],
};

export const teamcastWebsiteSchema: WebSiteSchema = {
  name: 'Teamcast - AI-Powered Hiring Platform',
  url: 'https://teamcast.ai',
  description:
    'Transform your hiring process with AI-powered candidate matching, automated screening, and smart interviews.',
  potentialAction: {
    target: 'https://teamcast.ai/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const teamcastProductSchema: ProductSchema = {
  name: 'Teamcast Hiring Platform',
  description:
    'AI-powered hiring platform with candidate matching, automated screening, and smart interviews.',
  url: 'https://teamcast.ai',
  category: 'BusinessApplication',
  offers: {
    price: '199',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
};
