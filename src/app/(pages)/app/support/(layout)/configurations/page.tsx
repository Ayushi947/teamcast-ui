'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Settings,
  FileText,
  ArrowRight,
  Shield,
  ClipboardCheck,
  Brain,
  GraduationCap,
  MapPin,
  Flag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConfigurationCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: string;
  color: string;
}

const configurations: ConfigurationCard[] = [
  {
    id: 'global-settings',
    title: 'Global Settings',
    description:
      'Configure default settings that apply platform-wide, including notifications, regional preferences, UI defaults, and system limits.',
    icon: Settings,
    route: '/app/support/configurations/global-settings',
    badge: 'Platform',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'feature-flags',
    title: 'Feature Flags',
    description:
      'Dynamically enable or disable features across the platform without code deployments. Manage client-specific overrides and gradual rollouts.',
    icon: Flag,
    route: '/app/support/feature-flags',
    badge: 'Platform',
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'documents',
    title: 'Document Configuration',
    description:
      'Manage document types, verification requirements, country-specific document settings, and upload configurations.',
    icon: FileText,
    route: '/app/support/configurations/documents',
    badge: 'Documents',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'onboarding-assessment',
    title: 'Onboarding Assessment Settings',
    description:
      'Configure comprehensive global settings for onboarding assessments including voice configuration, assessment parameters, proctoring, and video analysis.',
    icon: GraduationCap,
    route: '/app/support/configurations/onboarding-assessment',
    badge: 'Assessment',
    color: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'job-ai-assessment',
    title: 'Job AI Assessment Settings',
    description:
      'Configure comprehensive global settings for job AI assessments including voice configuration, AI difficulty, assessment parameters, and proctoring.',
    icon: Brain,
    route: '/app/support/configurations/job-ai-assessment',
    badge: 'Assessment',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'practice-assessment',
    title: 'Practice Assessment Settings',
    description:
      'Configure comprehensive global settings for practice assessments including voice configuration, assessment parameters, proctoring, and video analysis.',
    icon: ClipboardCheck,
    route: '/app/support/configurations/practice-assessment',
    badge: 'Assessment',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'tour-definitions',
    title: 'Tour Definitions',
    description:
      'Manage tour definitions and guide users through the platform. Create, edit, and configure interactive tours for different user types and pages.',
    icon: MapPin,
    route: '/app/support/configurations/tour-definitions',
    badge: 'UX',
    color: 'text-green-600 dark:text-green-400',
  },
];

export default function ConfigurationsPage() {
  const router = useRouter();

  const handleRoute = (route: string) => {
    router.push(route);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Settings className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight">
              Configurations
            </h1>
            <p className="text-muted-foreground mt-1.5 text-base">
              Manage platform-wide configurations and settings
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {configurations.map((config) => {
          const IconComponent = config.icon;
          return (
            <Card
              key={config.id}
              className="group hover:shadow-primary/5 relative flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl ${config.color} group-hover:bg-primary/15 transition-transform duration-200 group-hover:scale-110`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-semibold">
                          {config.title}
                        </CardTitle>
                        {config.badge && (
                          <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium">
                            {config.badge}
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {config.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {/* This space grows to fill available space, pushing footer to bottom */}
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  onClick={() => handleRoute(config.route)}
                  className="group/btn w-full transition-all duration-200 hover:gap-3"
                  variant="default"
                >
                  <span>Configure</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </Button>
              </CardFooter>
              {/* Subtle gradient overlay on hover */}
              <div className="from-primary/0 via-primary/0 to-primary/5 pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </Card>
          );
        })}
      </div>

      {/* Additional Info Section */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Shield className="text-primary h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-foreground text-sm font-medium">
              Configuration Management
            </p>
            <p className="text-muted-foreground text-xs">
              Changes to configurations may affect system behavior. Please
              review settings carefully before applying changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
