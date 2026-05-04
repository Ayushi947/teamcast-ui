'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import {
  Building2,
  Globe,
  Phone,
  MapPin,
  Users,
  Activity,
  FileText,
  Handshake,
  Mail,
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
  GithubIcon,
} from 'lucide-react';
import { ISupportPartner } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { Tags } from '@/components/ui/tags';
import LinkedinIcon from '@/components/icons/LinkedInIcon';
import { TwitterIcon } from '@/components/icons';
import { logger } from '@/lib/logger';

interface OverviewTabProps {
  partner: ISupportPartner;
}

export function OverviewTab({ partner }: OverviewTabProps) {
  // Debug logging
  useEffect(() => {
    if (partner) {
      logger.info('Partner data in OverviewTab:', partner);
    }
  }, [partner]);
  const CompanySizeDisplay = {
    ONE_TO_TEN: '1-10 employees',
    ELEVEN_TO_FIFTY: '11-50 employees',
    FIFTY_ONE_TO_TWO_HUNDRED: '51-200 employees',
    TWO_HUNDRED_ONE_TO_FIVE_HUNDRED: '201-500 employees',
    FIVE_HUNDRED_ONE_TO_THOUSAND: '501-1000 employees',
    OVER_THOUSAND: '1000+ employees',
  } as const;
  const socialpProfiles = [
    {
      icon: LinkedinIcon,
      name: 'LinkedIn',
      url: partner.company?.socialProfiles?.linkedin ?? 'Not Available',
    },
    {
      icon: TwitterIcon,
      name: 'Twitter',
      url: partner.company?.socialProfiles?.twitter ?? 'Not Available',
    },
    {
      icon: FacebookIcon,
      name: 'Facebook',
      url: partner.company?.socialProfiles?.facebook ?? 'Not Available',
    },
    {
      icon: GithubIcon,
      name: 'Github',
      url: partner.company?.socialProfiles?.github ?? 'Not Available',
    },
    {
      icon: InstagramIcon,
      name: 'Instagram',
      url: partner.company?.socialProfiles?.instagram ?? 'Not Available',
    },
    {
      icon: YoutubeIcon,
      name: 'Youtube',
      url: partner.company?.socialProfiles?.youtube ?? 'Not Available',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm dark:from-blue-950/50 dark:to-blue-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500 p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Team Members
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {partner.stats?.usersCount ||
                    partner.partnerUsers?.length ||
                    0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-sm dark:from-green-950/50 dark:to-green-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500 p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Candidates
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {partner.stats?.candidatesCount ||
                    partner.candidates?.length ||
                    0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm dark:from-purple-950/50 dark:to-purple-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500 p-2">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Documents
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {partner.stats?.documentsCount ||
                    partner.documents?.length ||
                    0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm dark:from-orange-950/50 dark:to-orange-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500 p-2">
                <Handshake className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Job Applications
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {partner.stats?.jobApplicationsCount ||
                    partner.jobApplications?.length ||
                    0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Company Information Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
        {/* Company Details Card */}
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Company Name
                </Label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {partner.company?.name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Contact Email
                </Label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {partner.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Industry
                </Label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {partner.company?.profile?.industry
                    ? formatEnumValue(partner.company.profile.industry)
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Company Size
                </Label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {partner.company?.profile?.size
                    ? CompanySizeDisplay[
                        partner.company.profile
                          .size as keyof typeof CompanySizeDisplay
                      ]
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Company Type
                </Label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {partner.company?.profile?.companyType
                    ? formatEnumValue(partner.company.profile.companyType)
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Stage
                </Label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {partner.company?.profile?.stage
                    ? formatEnumValue(partner.company.profile.stage)
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Founded Year
                </Label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {partner.company?.profile?.foundedYear || 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Website
                </Label>
                {partner.company?.profile?.website ? (
                  <a
                    href={partner.company.profile?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <Globe className="h-3 w-3" />
                    {partner.company.profile?.website}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Not specified
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            {(partner.company?.contactPhone ||
              partner.company?.contactEmail) && (
              <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                <Label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Contact Information
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {partner.company?.contactPhone && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">
                        Phone
                      </Label>
                      <p className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <Phone className="h-3 w-3" />
                        {partner.company.contactPhone}
                      </p>
                    </div>
                  )}
                  {partner.company?.contactEmail && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">
                        Email
                      </Label>
                      <p className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <Mail className="h-3 w-3" />
                        {partner.company.contactEmail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Information */}
            {partner.company?.address?.address ||
            partner.company?.address?.city ||
            partner.company?.address?.state ||
            partner.company?.address?.zipCode ||
            partner.company?.address?.country ? (
              <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                <Label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Location
                </Label>
                <div className="flex items-start gap-1">
                  <MapPin className="mt-0.5 h-3 w-3 text-gray-500 dark:text-gray-400" />
                  <div className="flex gap-2 text-sm text-gray-900 dark:text-white">
                    {partner.company?.address && (
                      <p>{partner.company.address.address}</p>
                    )}
                    <p>
                      {[
                        partner.company?.address?.city,
                        partner.company?.address?.state,
                        partner.company?.address?.zipCode,
                        partner.company?.address?.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                <Label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Location
                </Label>
                <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="mt-0.5 h-3 w-3 text-gray-500 dark:text-gray-400" />
                  Not specified
                </p>
              </div>
            )}

            {/*Cultural information*/}
            {partner.company?.culture && (
              <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                <Label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cultural Information
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      {' '}
                      Vision{' '}
                    </Label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {partner.company.culture.vision}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      {' '}
                      Mission{' '}
                    </Label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {partner.company.culture.mission}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      {' '}
                      Values{' '}
                    </Label>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-900 dark:text-white">
                      {partner.company.culture.values &&
                        partner.company.culture.values.map((value) => {
                          return <Tags key={value} tags={value} />;
                        })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      {' '}
                      Perks{' '}
                    </Label>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-900 dark:text-white">
                      {partner.company.culture.perks &&
                        partner.company.culture.perks.map((perk) => {
                          return <Tags key={perk} tags={perk} />;
                        })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      {' '}
                      Work Environment{' '}
                    </Label>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-900 dark:text-white">
                      {partner.company.culture.workEnvironment &&
                        partner.company.culture.workEnvironment.map(
                          (workEnvironment) => {
                            return (
                              <Tags
                                key={workEnvironment}
                                tags={workEnvironment}
                              />
                            );
                          }
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Partner Users Section */}
      {partner.partnerUsers && partner.partnerUsers.length > 0 && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Users className="h-5 w-5" />
              Partner Users ({partner.partnerUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {partner.partnerUsers.map((partnerUser) => (
                <div
                  key={partnerUser.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={partnerUser.user.image}
                        alt={partnerUser.user.name}
                      />
                      <AvatarFallback className="bg-[#6e55cf] text-white">
                        {partnerUser.user.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {partnerUser.user.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {partnerUser.user.email}
                      </p>
                      {partnerUser.user.jobTitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {partnerUser.user.jobTitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        partnerUser.user.status === 'ACTIVE'
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        partnerUser.user.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }
                    >
                      {partnerUser.user.status}
                    </Badge>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {partnerUser.user.role
                        ? formatEnumValue(partnerUser.user.role)
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Profiles */}
      {partner.company?.socialProfiles && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Globe className="h-5 w-5" />
              Social Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {socialpProfiles.map((profile) => (
                <div key={profile.name} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <profile.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile.url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activities */}
      {partner.activities && partner.activities.length > 0 && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {partner.activities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        by {activity.user.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        •
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {partner.activities.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-500">
                  No recent activities found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
