'use client';

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Building2,
  Check,
  Copy,
  Globe,
  Calendar,
  Phone,
  MapPin,
  User,
  Users,
  Heart,
  Share2,
  Linkedin,
  Twitter,
  Facebook,
  Github,
  CreditCard,
  FileText,
  TrendingUp,
  Mail,
  Briefcase,
  ChartBar,
  LockIcon,
  NotebookPen,
  AlertCircle,
  HeadphonesIcon,
} from 'lucide-react';
import { ISupportClient } from '@/lib/shared';
import { useState } from 'react';
import { formatEnumValue } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { useQuery } from '@tanstack/react-query';
import { supportAccountManagerAssignmentService } from '@/lib/services/services';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface OverviewTabProps {
  client: ISupportClient;
}

export function OverviewTab({ client }: OverviewTabProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  // Fetch account manager details
  const { data: accountManager, isLoading: isLoadingAccountManager } = useQuery(
    {
      queryKey: ['account-manager', client.id],
      queryFn: () =>
        supportAccountManagerAssignmentService.getAccountManagerByClientId(
          client.id
        ),
      enabled: !!client.id,
    }
  );

  const basicDetails = [
    {
      icon: <NotebookPen className="h-4 w-4" />,
      label: 'Company Name',
      value: client.company?.name,
      color: 'bg-[#FFEFDF] dark:bg-blue-900',
    },
    {
      icon: <Mail className="h-4 w-4" />,
      label: 'Contact Email',
      value: client.profile?.basic?.contactEmail || 'Not specified',
      color: 'bg-green-100 dark:bg-green-900',
    },
    {
      icon: <Briefcase className="h-4 w-4" />,
      label: 'Industry',
      value: client.profile?.basic?.industry
        ? formatEnumValue(client.profile.basic.industry)
        : 'Not specified',
      color: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Company Size',
      value: client.profile?.basic?.size
        ? formatEnumValue(client.profile.basic.size)
        : 'Not specified',
      color: 'bg-purple-100',
    },
    {
      icon: <Building2 className="h-4 w-4" />,
      label: 'Company Type',
      value: client.profile?.basic?.companyType
        ? formatEnumValue(client.profile.basic.companyType)
        : 'Not specified',
      color: 'bg-[#E5E5FF] dark:bg-indigo-900',
    },
    {
      icon: <ChartBar className="h-4 w-4" />,
      label: 'Stage',
      value: client.profile?.basic?.stage
        ? formatEnumValue(client.profile.basic.stage)
        : 'Not specified',
      color: 'bg-[#DBFFE5] dark:bg-orange-900',
    },
    {
      icon: <LockIcon className="h-4 w-4" />,
      label: 'Founded Year',
      value: client.profile?.basic?.foundedYear || 'Not specified',
      color: 'bg-purple-200 dark:bg-purple-900',
    },
  ];

  const handleCopyEmail = async () => {
    if (accountManager?.email) {
      try {
        await navigator.clipboard.writeText(accountManager.email);
        setCopiedEmail(true);
        toast.success('Email copied to clipboard');
        setTimeout(() => setCopiedEmail(false), 2000);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'An Error Occured'
        );
      }
    }
  };

  // Debug logging
  useEffect(() => {
    if (client) {
      logger.info('Client data in OverviewTab:', client);
    }
  }, [client]);

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Total Users
            </div>
            <div className="bg-primary/20 dark:bg-primary/30 rounded-full p-2">
              <Users className="text-primary dark:text-primary h-5 w-5" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {client?.stats?.totalUsers || 0}
            </div>
            <span className="text-primary dark:text-primary text-sm font-medium">
              Total profile views
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Job Postings
            </div>
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {client?.stats?.totalJobPostings || 0}
            </div>
            <span className="text-primary dark:text-primary text-sm font-medium">
              Total applications
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Documents
            </div>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {client?.stats?.totalDocuments || 0}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Subscription
            </div>
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
              <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {client.subscription?.status || 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Account Manager Section */}
      <div className="lg:col-span-9">
        <Card className="dark:bg-primary/10 bg-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <HeadphonesIcon className="h-5 w-5" />
              Account Manager Details
            </CardTitle>
            <CardDescription>
              Your dedicated account manager information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingAccountManager && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-muted h-16 w-16 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted h-4 animate-pulse rounded" />
                    <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted h-12 animate-pulse rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            {!accountManager && !isLoadingAccountManager && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Manager Not Assigned
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    No account manager has been assigned to your account yet.
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Need assistance?</strong> Our support team is here
                    to help you with any questions about your subscription,
                    features, or account management.
                  </p>
                </div>
              </div>
            )}

            {accountManager && !isLoadingAccountManager && (
              <>
                {/* Main Content - Two Column Layout */}
                <div className="mb-6 flex flex-col gap-6">
                  {/* Profile Section - Left Half */}
                  <div className="bg-muted/50 h-full flex-1 rounded-lg p-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="border-primary h-16 w-16 border">
                        <AvatarImage
                          src={accountManager.image}
                          alt={accountManager.name}
                        />
                        <AvatarFallback className="text-lg">
                          {accountManager.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-foreground text-md font-semibold">
                          {accountManager.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="border-green-200 text-green-700 dark:border-green-700/30 dark:text-green-300"
                        >
                          {formatEnumValue(accountManager.role)}
                        </Badge>
                        <p className="text-muted-foreground text-md font-medium">
                          {accountManager.jobTitle || 'Account Manager'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information - Right Half */}
                  <div className="flex-1 space-y-3">
                    <div className="flex w-full gap-6">
                      {/* Email */}
                      <div className="bg-muted/50 flex w-full items-center justify-between rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Mail className="text-muted-foreground h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-muted-foreground text-sm">
                              {accountManager.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyEmail}
                          className="h-8 w-8 p-0"
                        >
                          {copiedEmail ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Created Date */}
                      <div className="bg-muted/50 flex w-full items-center justify-between rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="text-muted-foreground h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">
                              Assigned Since
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {accountManager.createdAt
                                ? format(
                                    accountManager.createdAt instanceof Date
                                      ? accountManager.createdAt
                                      : parseISO(accountManager.createdAt),
                                    'MMM dd, yyyy'
                                  )
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {/* Keep empty div for alignment (so it matches Email layout) */}
                        <div className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Message - Full Width at Bottom */}
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Need help?</strong> Your account manager is here to
                    support you with any questions about your subscription,
                    features, or account management.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Company Information Section */}
      <div className="space-y-6">
        <Card className="bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            {/* Basic Details */}
            <section className="grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {basicDetails.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-md ${item.color} dark:bg-blue-900`}
                  >
                    <span className="text-black dark:text-green-400">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex min-h-[40px] flex-1 items-center">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                      </Label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(client.company?.address ||
                client.company?.city ||
                client.company?.state ||
                client.company?.country) && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-200 dark:bg-blue-900">
                    <MapPin className="h-5 w-5 text-black dark:text-green-400" />
                  </div>
                  <div className="flex min-h-[40px] flex-1 items-center">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                      </Label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {[
                          client.company?.city,
                          client.company?.state,
                          client.company?.zipCode,
                          client.company?.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Contact Information */}
            {(client.company?.contactName || client.company?.contactPhone) && (
              <section className="border-t pt-6 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  {client.company?.contactName && (
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <Label className="text-md font-bold text-gray-500 dark:text-gray-400">
                          Contact Person
                        </Label>
                        <p className="text-muted-foreground text-sm dark:text-white">
                          {client.company.contactName}
                        </p>
                      </div>
                    </div>
                  )}
                  {client.company?.contactPhone && (
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <Label className="text-md font-bold text-gray-500 dark:text-gray-400">
                          Phone
                        </Label>
                        <p className="text-muted-foreground text-sm dark:text-white">
                          {client.company.contactPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Website */}

            <section className="border-t pt-6 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                <div>
                  <Label className="text-md font-bold text-gray-500 dark:text-gray-400">
                    Website
                  </Label>
                  {client.profile?.basic?.website ? (
                    <a
                      href={client.profile.basic.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400"
                    >
                      <Globe className="h-4 w-4" />
                      {client.profile.basic.website}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Not specified
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-md font-bold text-gray-500 dark:text-gray-400">
                    LinkedIn
                  </Label>
                  {client.profile?.social?.linkedin ? (
                    <a
                      href={client.profile.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400"
                    >
                      <Linkedin className="h-4 w-4" />
                      {client.profile.social.linkedin}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Not specified
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-md font-bold text-gray-500 dark:text-gray-400">
                    Twitter
                  </Label>
                  {client.profile?.social?.twitter ? (
                    <a
                      href={client.profile.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400"
                    >
                      <Twitter className="h-4 w-4" />
                      {client.profile.social.twitter}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Not specified
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-md font-bold text-gray-500 dark:text-gray-400">
                    GitHub
                  </Label>
                  {client.profile?.social?.github ? (
                    <a
                      href={client.profile.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400"
                    >
                      <Github className="h-4 w-4" />
                      {client.profile.social.github}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Not specified
                    </p>
                  )}
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>

      {client.financialData?.annualRevenue ? (
        <Card className="bg-card">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
              <TrendingUp className="h-5 w-5" />
              Revenue Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground block text-sm font-bold">
                  Annual Revenue
                </label>
                <div className="text-sm text-gray-500">
                  {client.financialData.annualRevenue}
                </div>
              </div>
              <div>
                <label className="text-muted-foreground block text-sm font-bold">
                  Tax ID
                </label>
                <div className="text-sm text-gray-500">
                  {client.financialData.taxId || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-muted-foreground block text-sm font-bold">
                  VAT Number
                </label>
                <div className="text-sm text-gray-500">
                  {client.financialData.vatNumber || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-muted-foreground block text-sm font-bold">
                  GST Number
                </label>
                <div className="text-sm text-gray-500">
                  {client.financialData.gstNumber || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4 dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
              Financial Data Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-orange-500">
                No financial data available
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Media & Culture Section */}
      {(client.company?.social || client.company?.culture) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Social Media Links */}
          {client.company?.social &&
            Object.values(client.company.social).some(Boolean) && (
              <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <Share2 className="h-5 w-5" />
                    Social Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  {client.company.social.linkedin && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                        <Linkedin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <a
                        href={client.company.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline dark:text-purple-400"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {client.company.social.twitter && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/20">
                        <Twitter className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      </div>
                      <a
                        href={client.company.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-sky-600 hover:underline dark:text-sky-400"
                      >
                        Twitter Profile
                      </a>
                    </div>
                  )}
                  {client.company.social.facebook && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                        <Facebook className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                      </div>
                      <a
                        href={client.company.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-700 hover:underline dark:text-purple-400"
                      >
                        Facebook Page
                      </a>
                    </div>
                  )}
                  {client.company.social.github && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                        <Github className="h-4 w-4 text-gray-700 dark:text-gray-400" />
                      </div>
                      <a
                        href={client.company.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-700 hover:underline dark:text-gray-400"
                      >
                        GitHub Profile
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Company Culture */}
          {client.company?.culture &&
            (client.company.culture.mission ||
              client.company.culture.vision ||
              (client.company.culture.values &&
                client.company.culture.values.length > 0)) && (
              <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <Heart className="h-5 w-5" />
                    Company Culture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {client.company.culture.mission && (
                    <div>
                      <Label className="text-md font-bold text-gray-500 dark:text-gray-400">
                        Mission
                      </Label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {client.company.culture.mission}
                      </p>
                    </div>
                  )}
                  {client.company.culture.vision && (
                    <div>
                      <Label className="text-md font-bold text-gray-500 dark:text-gray-400">
                        Vision
                      </Label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {client.company.culture.vision}
                      </p>
                    </div>
                  )}
                  {client.company.culture.values &&
                    client.company.culture.values.length > 0 && (
                      <div>
                        <Label className="text-md font-bold text-gray-500 dark:text-gray-400">
                          Values
                        </Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {client.company.culture.values.map(
                            (value: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="border-[#6e55cf]/20 text-xs text-[#6e55cf] dark:border-purple-700/30 dark:text-purple-300"
                              >
                                {value}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}
