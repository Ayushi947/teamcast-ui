import React from 'react';
import { IClientJobPosting } from '@/lib/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  Star,
  ExternalLink,
} from 'lucide-react';

interface PublicJobCompanyProps {
  jobPosting: IClientJobPosting;
}

export const PublicJobCompany: React.FC<PublicJobCompanyProps> = ({
  jobPosting,
}) => {
  const formatEnumValue = (value: string) => {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCompanySize = (size: string) => {
    switch (size) {
      case 'OVER_THOUSAND':
        return '1000+ employees';
      case 'FIVE_HUNDRED_TO_THOUSAND':
        return '500-1000 employees';
      case 'HUNDRED_TO_FIVE_HUNDRED':
        return '100-500 employees';
      case 'FIFTY_TO_HUNDRED':
        return '50-100 employees';
      case 'TEN_TO_FIFTY':
        return '10-50 employees';
      case 'UNDER_TEN':
        return 'Under 10 employees';
      default:
        return size.replace(/_/g, ' ').toLowerCase();
    }
  };

  if (!jobPosting.company) {
    return null;
  }

  const { company } = jobPosting;

  return (
    <Card className="group from-card via-card to-background/50 relative h-full overflow-hidden bg-gradient-to-br shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Background decoration */}
      <div className="bg-primary/5 group-hover:bg-primary/10 dark:bg-primary/10 dark:group-hover:bg-primary/20 absolute -top-6 -left-6 h-24 w-24 rounded-full blur-xl transition-all duration-500" />

      <div className="relative flex h-full flex-col p-6">
        {/* Header */}
        <div className="border-border/50 flex items-center gap-3 border-b pb-4">
          <div className="bg-primary/10 dark:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
            <Building2 className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground text-xl font-bold">
              Company Information
            </h3>
            <p className="text-muted-foreground text-sm">
              About the company and culture
            </p>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-6">
          {/* Company Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {company.name}
                </h4>
                {company.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {company.description}
                  </p>
                )}
              </div>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Website
                </a>
              )}
            </div>

            {/* Company Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium text-gray-500">
                    Type
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {formatEnumValue(company.companyType)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium text-gray-500">
                    Size
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {formatCompanySize(company.size)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium text-gray-500">
                    Stage
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {formatEnumValue(company.stage)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium text-gray-500">
                    Founded
                  </span>
                </div>
                <p className="text-sm text-gray-900">{company.foundedYear}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Benefits */}
          {company.benefits && company.benefits.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Company Benefits
              </h4>
              <div className="flex flex-wrap gap-2">
                {company.benefits.map((benefit, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h4>
            <div className="space-y-3">
              {company.contactName && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <Users className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {company.contactName}
                    </p>
                    <p className="text-xs text-gray-500">Contact Person</p>
                  </div>
                </div>
              )}

              {company.contactEmail && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <Mail className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {company.contactEmail}
                    </p>
                    <p className="text-xs text-gray-500">Email</p>
                  </div>
                </div>
              )}

              {company.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <Phone className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {company.contactPhone}
                    </p>
                    <p className="text-xs text-gray-500">Phone</p>
                  </div>
                </div>
              )}

              {/* Address */}
              {(company.address || company.city || company.state) && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <MapPin className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {[
                        company.address,
                        company.city,
                        company.state,
                        company.zipCode,
                        company.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">Address</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Industry */}
          {company.industry && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  Industry
                </h4>
                <Badge variant="outline" className="text-sm">
                  {formatEnumValue(company.industry)}
                </Badge>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
