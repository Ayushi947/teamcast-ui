import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IClientSubscriptionPackage } from '@/lib/shared';
import { Check, Crown, Users, Briefcase, Eye, Brain, Zap } from 'lucide-react';

interface SubscriptionPackagesProps {
  packages: IClientSubscriptionPackage[];
  currentPackageId?: string;
  onSelectPackage: (packageId: string) => void;
  loading?: boolean;
}

export const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({
  packages,
  currentPackageId,
  onSelectPackage,
  loading,
}) => {
  const availablePackages = packages.filter((pkg) => pkg.name !== 'FREE');

  const getBillingCycleText = (cycle: string) => {
    switch (cycle.toUpperCase()) {
      case 'MONTHLY':
        return 'month';
      case 'QUARTERLY':
        return 'quarter';
      case 'ANNUALLY':
        return 'year';
      default:
        return 'month';
    }
  };

  const getPackageIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Users className="h-6 w-6" />;
      case 1:
        return <Crown className="h-6 w-6" />;
      case 2:
        return <Zap className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const getPackageColor = (index: number) => {
    switch (index) {
      case 0:
        return 'border-blue-200 bg-blue-50';
      case 1:
        return 'border-purple-200 bg-purple-50';
      case 2:
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-card mb-10 space-y-4 rounded-lg py-10">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the perfect plan for your team&apos;s needs
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 gap-8 px-20 py-10 lg:grid-cols-3">
        {availablePackages.map((pkg, index) => {
          const isCurrent = pkg.id === currentPackageId;
          const isPopular = index === 1;

          return (
            <Card
              key={pkg.id}
              className={`bg-card relative max-w-md transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-purple-500 ${
                isCurrent ? 'shadow-lg' : 'hover:scale-105'
              } ${isPopular ? 'scale-105' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <Badge className="bg-purple-600 px-3 py-1 text-white">
                    {isCurrent ? 'Current Plan' : 'Most Popular'}
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {isPopular ? '' : 'Current Plan'}
                  </Badge>
                </div>
              )}

              <CardHeader
                className={`bg-card dark:bg-primary/10 pb-4 ${getPackageColor(index)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getPackageIcon(index)}
                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">${pkg.price}</span>
                    <span className="text-muted-foreground ml-1">
                      /{getBillingCycleText(pkg.billingCycle)}
                    </span>
                  </div>
                  {pkg.billingCycle.toUpperCase() === 'ANNUALLY' && (
                    <p className="mt-1 text-sm font-medium text-green-600">
                      Save 20% with annual billing
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">{pkg.description}</p>

                <div className="mb-8 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{pkg.maxSeats} Team Members</p>
                      <p className="text-muted-foreground text-sm">
                        Invite your team to collaborate
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {pkg.maxJobPostings} Job Postings
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Create and manage job listings
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Eye className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {pkg.unlimitedCandidateViews
                          ? 'Unlimited'
                          : pkg.maxCandidateViews}{' '}
                        Candidate Views
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Browse and evaluate candidates
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Brain className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {pkg.maxAiAssessments} AI Assessments
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Automated candidate evaluation
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant={isCurrent ? 'outline' : 'default'}
                  className={`w-full ${
                    isPopular ? 'bg-purple-600 hover:bg-purple-700' : ''
                  }`}
                  onClick={() => onSelectPackage(pkg.id)}
                  disabled={isCurrent || loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Processing...</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4" />
                      <span>Current Plan</span>
                    </div>
                  ) : (
                    <span>{isPopular ? 'Get Started' : 'Choose Plan'}</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison */}
      <div>
        <h3 className="text-center text-2xl font-bold">All Plans Include</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="mb-2 font-semibold">Team Collaboration</h4>
            <p className="text-muted-foreground text-sm">
              Real-time collaboration tools for your hiring team
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="mb-2 font-semibold">Job Management</h4>
            <p className="text-muted-foreground text-sm">
              Advanced job posting and candidate management
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="mb-2 font-semibold">AI-Powered Insights</h4>
            <p className="text-muted-foreground text-sm">
              Intelligent candidate matching and analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
