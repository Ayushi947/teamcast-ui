import { UserRoleEnum } from '@/lib/shared';
import { Section } from './shared-sidebar';
import { ENV } from '@/lib/env';

// Client Navigation Configuration
export const clientNavigationItems: Section[] = [
  {
    title: 'MAIN',
    items: [
      {
        name: 'Dashboard',
        href: '/app/client/dashboard',
        icon: 'LayoutGrid',
        roles: [
          UserRoleEnum.ADMIN,
          UserRoleEnum.HR,
          UserRoleEnum.RECRUITER,
          UserRoleEnum.ACCOUNTS,
        ],
      },
    ],
  },
  {
    title: 'RECRUITMENT',
    items: [
      {
        name: 'Sourcing',
        href: '/app/client/recruiter/sourcing',
        icon: 'Briefcase',
        roles: [
          UserRoleEnum.ADMIN,
          UserRoleEnum.RECRUITER,
          UserRoleEnum.ACCOUNTS,
        ],
      },
      {
        name: 'Manage People',
        href: '/app/client/deel-access',
        icon: 'Users2',
        roles: [UserRoleEnum.ADMIN],
      },
      {
        name: 'Invitations',
        href: '/app/client/candidates/applications',
        icon: 'Mail',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.RECRUITER],
      },
      {
        name: 'Interviews',
        href: '/app/client/interviews',
        icon: 'Calendar',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.RECRUITER],
      },
      {
        name: 'Shortlisted',
        href: '/app/client/candidates/shortlisted',
        icon: 'Heart',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.RECRUITER],
      },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      {
        name: 'Subscription',
        href: '/app/client/subscription',
        icon: 'CreditCard',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.ACCOUNTS],
      },
    ],
  },
  {
    title: 'COMPANY',
    items: [
      {
        name: 'Profile',
        href: '/app/client/profile',
        icon: 'Building',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.ACCOUNTS],
      },
      {
        name: 'Users',
        href: '/app/client/users',
        icon: 'UserCog',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.HR],
      },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      {
        name: 'Integrations',
        href: '/app/client/integrations',
        icon: 'Blocks',
        roles: [UserRoleEnum.ADMIN],
        isBeta: true,
      },
      {
        name: 'Settings',
        href: '/app/client/configurations',
        icon: 'Settings',
        roles: [UserRoleEnum.ADMIN],
      },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      {
        name: 'Support',
        href: '/app/client/support-tickets',
        icon: 'Contact',
        roles: [
          UserRoleEnum.ADMIN,
          UserRoleEnum.ACCOUNTS,
          UserRoleEnum.RECRUITER,
          UserRoleEnum.HR,
        ],
        shouldDisplay: ENV.NEXT_PUBLIC_SUPPORT_TICKET_ENABLED,
      },
    ],
  },
];

// Candidate Navigation Configuration
export const candidateNavigationItems: Section[] = [
  {
    title: 'MAIN',
    items: [
      {
        name: 'Dashboard',
        href: '/app/candidate/dashboard',
        icon: 'Home',
        roles: [UserRoleEnum.INDIVIDUAL, UserRoleEnum.PARTNER_RESOURCE],
      },
    ],
  },
  {
    title: 'CAREER',
    items: [
      {
        name: 'Resume',
        href: '/app/candidate/resume',
        icon: 'UserCog',
        roles: [UserRoleEnum.INDIVIDUAL, UserRoleEnum.PARTNER_RESOURCE],
        dataTour: 'sidebar-resume-link',
      },
      {
        name: 'Applications',
        href: '/app/candidate/applications',
        icon: 'FileText',
        roles: [UserRoleEnum.INDIVIDUAL],
        dataTour: 'sidebar-applications-link',
      },
      {
        name: 'Jobs',
        href: '/app/candidate/job-recommendations',
        icon: 'Briefcase',
        roles: [UserRoleEnum.INDIVIDUAL],
        dataTour: 'sidebar-jobs-link',
      },
      {
        name: 'Invites',
        href: '/app/candidate/assessment-invites',
        icon: 'Mail',
        roles: [UserRoleEnum.INDIVIDUAL],
        dataTour: 'sidebar-job-invites-link',
      },
      {
        name: 'Interviews',
        href: '/app/candidate/interviews',
        icon: 'Calendar',
        roles: [UserRoleEnum.INDIVIDUAL],
        dataTour: 'sidebar-interviews-link',
      },
      {
        name: 'Assessment Results',
        href: '/app/candidate/practice-assessments',
        icon: 'FileText',
        roles: [UserRoleEnum.INDIVIDUAL],
      },
    ],
  },

  {
    title: 'COMMUNICATION',
    items: [
      {
        name: 'Chat',
        href: '/app/candidate/chat',
        icon: 'MessageSquare',
        roles: [UserRoleEnum.INDIVIDUAL],
        dataTour: 'sidebar-chat-link',
      },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      {
        name: 'Support',
        href: '/app/candidate/support-tickets',
        icon: 'Contact',
        roles: [UserRoleEnum.INDIVIDUAL],
        shouldDisplay: ENV.NEXT_PUBLIC_SUPPORT_TICKET_ENABLED,
      },
    ],
  },
];

// Partner Navigation Configuration
export const partnerNavigationItems: Section[] = [
  {
    title: 'MAIN',
    items: [
      {
        name: 'Dashboard',
        href: '/app/partner/dashboard',
        icon: 'Home',
        roles: [
          UserRoleEnum.ADMIN,
          UserRoleEnum.HR,
          UserRoleEnum.RECRUITER,
          UserRoleEnum.ACCOUNTS,
        ],
      },
    ],
  },
  {
    title: 'TALENT',
    items: [
      {
        name: 'Candidates',
        href: '/app/partner/candidates',
        icon: 'Users',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.RECRUITER, UserRoleEnum.HR],
      },
      {
        name: 'Applications',
        href: '/app/partner/applications',
        icon: 'FileText',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.RECRUITER, UserRoleEnum.HR],
      },
    ],
  },
  {
    title: 'RECRUITMENT',
    items: [
      {
        name: 'Jobs',
        href: '/app/partner/jobs',
        icon: 'Building2',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.RECRUITER, UserRoleEnum.HR],
      },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      {
        name: 'User Management',
        href: '/app/partner/administration',
        icon: 'UserCog',
        roles: [UserRoleEnum.ADMIN],
      },
      {
        name: 'Profile',
        href: '/app/partner/profile',
        icon: 'User',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.ACCOUNTS],
      },
    ],
  },
];

// Support Navigation Configuration
export const supportNavigationItems: Section[] = [
  {
    title: 'MAIN',
    items: [
      {
        name: 'Dashboard',
        href: '/app/support/dashboard',
        icon: 'Home',
        roles: [
          UserRoleEnum.ADMIN,
          UserRoleEnum.ACCOUNTS,
          UserRoleEnum.RECRUITER,
          UserRoleEnum.ACCOUNT_MANAGER,
        ],
      },
      {
        name: 'Dashboard',
        href: '/app/support/dashboard',
        icon: 'Home',
        roles: [UserRoleEnum.TECHNICAL_SUPPORT],
      },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        name: 'Clients',
        href: '/app/support/clients',
        icon: 'Briefcase',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.TECHNICAL_SUPPORT],
      },
      {
        name: 'Candidates',
        href: '/app/support/candidates',
        icon: 'Users',
        roles: [
          UserRoleEnum.ADMIN,
          UserRoleEnum.RECRUITER,
          UserRoleEnum.TECHNICAL_SUPPORT,
        ],
      },
      {
        name: 'Partners',
        href: '/app/support/partners',
        icon: 'Building2',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.TECHNICAL_SUPPORT],
      },
      {
        name: 'Users',
        href: '/app/support/users',
        icon: 'UserCog',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.TECHNICAL_SUPPORT],
      },
      {
        name: 'Platform Users',
        href: '/app/support/platform-users',
        icon: 'Users',
        roles: [UserRoleEnum.ADMIN],
      },
    ],
  },
  {
    title: 'RECRUITMENT',
    items: [
      {
        name: 'Job Postings',
        href: '/app/support/job-postings',
        icon: 'FileText',
        roles: [UserRoleEnum.ACCOUNT_MANAGER],
      },
      {
        name: 'Sourcing',
        href: '/app/support/sourcing',
        icon: 'Search',
        roles: [UserRoleEnum.RECRUITER],
      },
      {
        name: 'Clients',
        href: '/app/support/account-manager/clients',
        icon: 'Briefcase',
        roles: [UserRoleEnum.ACCOUNT_MANAGER],
      },
      {
        name: 'Recruiters',
        href: '/app/support/account-manager/recruiters',
        icon: 'Users',
        roles: [UserRoleEnum.ACCOUNT_MANAGER],
      },
      {
        name: 'Invitations',
        href: '/app/support/job-invites',
        icon: 'Mail',
        roles: [UserRoleEnum.ACCOUNT_MANAGER, UserRoleEnum.RECRUITER],
      },
    ],
  },
  {
    title: 'STATISTICS',
    items: [
      {
        name: 'Live Assessments',
        href: '/app/support/live-assessments',
        icon: 'ChartBar',
        roles: [UserRoleEnum.ADMIN],
      },
      {
        name: 'KPI',
        href: '/app/support/kpis',
        icon: 'BarChart3',
        roles: [UserRoleEnum.ADMIN],
      },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      {
        name: 'Support Chat',
        href: '/app/support/chat',
        icon: 'MessageSquare',
        roles: [
          UserRoleEnum.ADMIN,
          UserRoleEnum.ACCOUNT_MANAGER,
          UserRoleEnum.RECRUITER,
        ],
      },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      {
        name: 'Support',
        href: '/app/support/support-tickets/account-manager',
        icon: 'Contact',
        roles: [UserRoleEnum.ACCOUNT_MANAGER],
        shouldDisplay: ENV.NEXT_PUBLIC_SUPPORT_TICKET_ENABLED,
      },
      {
        name: 'Support',
        href: '/app/support/support-tickets/admin',
        icon: 'Contact',
        roles: [UserRoleEnum.ADMIN],
        shouldDisplay: ENV.NEXT_PUBLIC_SUPPORT_TICKET_ENABLED,
      },
      {
        name: 'Support',
        href: '/app/support/support-tickets/technical-support',
        icon: 'Contact',
        roles: [UserRoleEnum.TECHNICAL_SUPPORT],
        shouldDisplay: ENV.NEXT_PUBLIC_SUPPORT_TICKET_ENABLED,
      },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      {
        name: 'Configurations',
        href: '/app/support/configurations',
        icon: 'Wrench',
        roles: [UserRoleEnum.ADMIN],
      },
      {
        name: 'Feature Flags',
        href: '/app/support/feature-flags',
        icon: 'Flag',
        roles: [UserRoleEnum.ADMIN],
      },
    ],
  },
];
