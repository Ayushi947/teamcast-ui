import { FC } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { StructuredData } from './structured-data';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  visible?: boolean;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({
  items,
  className = '',
  visible = false,
}) => {
  const allItems = [{ name: 'Home', url: '/' }, ...items];

  return (
    <>
      <StructuredData type="breadcrumb" data={{ items: allItems }} />
      {visible && (
        <nav
          className={`text-muted-foreground flex items-center space-x-2 text-sm ${className}`}
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center space-x-2">
            {allItems.map((item, index) => (
              <li key={item.url} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="text-muted-foreground/50 mx-2 h-4 w-4" />
                )}
                {index === allItems.length - 1 ? (
                  <span
                    className="text-foreground font-medium"
                    aria-current="page"
                  >
                    {index === 0 ? <Home className="h-4 w-4" /> : item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    {index === 0 ? <Home className="h-4 w-4" /> : item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </>
  );
};

// Predefined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  about: [{ name: 'About', url: '/about' }],
  features: [{ name: 'Features', url: '/features' }],
  pricing: [{ name: 'Pricing', url: '/pricing' }],
  contact: [{ name: 'Contact', url: '/contact' }],
  blog: [{ name: 'Blog', url: '/blog' }],
  careers: [{ name: 'Careers', url: '/careers' }],
  candidate: [{ name: 'For Candidates', url: '/candidate' }],
  clientLanding: [{ name: 'For Clients', url: '/client' }],
  clientCaseStudies: [
    { name: 'For Clients', url: '/client' },
    { name: 'Case Studies', url: '/client/case-studies' },
  ],
  clientTalent: [
    { name: 'For Clients', url: '/client' },
    { name: 'Browse Talent', url: '/client/talent' },
  ],
  candidateCaseStudies: [
    { name: 'For Candidates', url: '/candidate' },
    { name: 'Case Studies', url: '/candidate/case-studies' },
  ],
  candidateCompanies: [
    { name: 'For Candidates', url: '/candidate' },
    { name: 'Companies & Jobs', url: '/candidate/companies' },
  ],
  candidateInterviews: [
    { name: 'For Candidates', url: '/candidate' },
    { name: 'Interviews', url: '/candidate/interviews' },
  ],
  apis: [{ name: 'API Documentation', url: '/apis' }],
  privacy: [{ name: 'Privacy Policy', url: '/privacy' }],
  terms: [{ name: 'Terms of Service', url: '/terms' }],
  cookiePolicy: [{ name: 'Cookie Policy', url: '/cookiePolicy' }],
};
