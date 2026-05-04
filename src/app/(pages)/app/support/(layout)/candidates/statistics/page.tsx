'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  Copy,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  supportInvitationImportService,
  supportInvitationService,
} from '@/lib/services/services';
import { SupportInvitationStatusEnum } from '@/lib/shared';

interface StatisticsData {
  totalCandidates: number;
  totalUploads: number;
  duplicateCandidates: number;
  failedImports: number;
  acceptedInvites: number;
}

export default function CampaignInvitationsStatisticsPage() {
  const router = useRouter();
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalCandidates: 0,
    totalUploads: 0,
    duplicateCandidates: 0,
    failedImports: 0,
    acceptedInvites: 0,
  });

  // Fetch import statistics
  const { data: importStats, isLoading: isLoadingImportStats } = useQuery({
    queryKey: ['support-invitation-import-statistics'],
    queryFn: () => supportInvitationImportService.getImportStatistics(),
  });

  // Fetch accepted invitations count
  const { data: acceptedInvitationsResponse, isLoading: isLoadingAccepted } =
    useQuery({
      queryKey: ['support-accepted-invitations-count'],
      queryFn: async () => {
        const response =
          await supportInvitationService.getAllSupportInvitations({
            page: 1,
            limit: 1,
            status: SupportInvitationStatusEnum.ACCEPTED,
            isCampaign: true,
          });
        return response;
      },
    });

  // Fetch per-upload statistics
  const { data: perUploadStats, isLoading: isLoadingPerUpload } = useQuery({
    queryKey: ['support-invitation-import-per-upload-statistics'],
    queryFn: () => supportInvitationImportService.getPerUploadStatistics(),
  });

  useEffect(() => {
    if (importStats && acceptedInvitationsResponse) {
      setStatistics({
        totalCandidates: importStats.totalInvitations || 0,
        totalUploads: importStats.totalUploads || 0,
        duplicateCandidates: importStats.duplicateCandidates || 0,
        failedImports: importStats.failedImports || 0,
        acceptedInvites: acceptedInvitationsResponse.pagination?.total || 0,
      });
    }
  }, [importStats, acceptedInvitationsResponse]);

  const isLoading =
    isLoadingImportStats || isLoadingAccepted || isLoadingPerUpload;

  const statCards = [
    {
      title: 'Total Invitations',
      value: statistics.totalCandidates,
      description: 'Candidates imported from Excel files',
      icon: Users,
      color: 'bg-blue-500',
      trendUp: true,
    },
    {
      title: 'Accepted Invites',
      value: statistics.acceptedInvites,
      description: 'Invitations accepted by candidates',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      trendUp: true,
    },
    {
      title: 'Total Uploads',
      value: statistics.totalUploads,
      description: 'Excel files uploaded for processing',
      icon: Upload,
      color: 'bg-green-500',
      trendUp: true,
    },
    {
      title: 'Duplicate Candidates',
      value: statistics.duplicateCandidates,
      description: 'Candidates that were duplicates',
      icon: Copy,
      color: 'bg-orange-500',

      trendUp: false,
    },
    {
      title: 'Failed Imports',
      value: statistics.failedImports,
      description: 'Candidates that failed to import',
      icon: AlertCircle,
      color: 'bg-red-500',
      trendUp: false,
    },
  ];

  const calculateSuccessRate = (successful: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((successful / total) * 100);
  };

  const getSuccessRateBadgeVariant = (rate: number) => {
    if (rate >= 80) return 'default';
    if (rate >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Campaign Invitations Statistics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive overview of your invitation campaigns and import
              performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-5 w-5" />
          <span className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
        </div>
      ) : (
        <>
          {/* Statistics Overview Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((stat) => (
              <Card key={stat.title} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-muted-foreground text-sm font-bold">
                      {stat.title}
                    </CardTitle>
                    <div className={`rounded-full p-2 ${stat.color}`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs font-medium">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-2">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer font-bold data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="per-upload"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer font-bold data-[state=active]:shadow-sm"
              >
                Per-Upload Analysis
              </TabsTrigger>
              <TabsTrigger
                value="failure-analysis"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer font-bold data-[state=active]:shadow-sm"
              >
                Failure Analysis
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Import Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Import Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm font-bold">
                          Success Rate
                        </span>
                        <Badge variant="secondary">
                          {statistics.totalCandidates > 0
                            ? `${calculateSuccessRate(
                                statistics.totalCandidates -
                                  statistics.failedImports -
                                  statistics.duplicateCandidates,
                                statistics.totalCandidates
                              )}%`
                            : '0%'}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm font-bold">
                          Processing Rate
                        </span>
                        <Badge variant="outline">
                          {statistics.totalUploads > 0
                            ? `${Math.round(
                                statistics.totalCandidates /
                                  statistics.totalUploads
                              )} candidates/upload`
                            : '0'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Invitation Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Invitation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm font-bold">
                          Acceptance Rate
                        </span>
                        <Badge variant="secondary">
                          {statistics.totalCandidates > 0
                            ? `${calculateSuccessRate(
                                statistics.acceptedInvites,
                                statistics.totalCandidates
                              )}%`
                            : '0%'}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm font-bold">
                        Pending Responses
                      </span>
                      <Badge variant="outline">
                        {statistics.totalCandidates -
                          statistics.acceptedInvites}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Per-Upload Analysis Tab */}
            <TabsContent value="per-upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Per-Upload Statistics
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Detailed analysis of each Excel file upload performance
                  </p>
                </CardHeader>
                <CardContent>
                  {perUploadStats && perUploadStats.length > 0 ? (
                    <div className="space-y-6">
                      {perUploadStats.map((uploadStat, index) => (
                        <div
                          key={uploadStat.batchId || index}
                          className="rounded-lg border bg-gray-50/50 p-6"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-sm">
                                Batch #{uploadStat.batchId || index + 1}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {uploadStat.fileName || `Upload ${index + 1}`}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                {uploadStat.uploadDate
                                  ? new Date(
                                      uploadStat.uploadDate
                                    ).toLocaleDateString()
                                  : 'Unknown Date'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getSuccessRateBadgeVariant(
                                  calculateSuccessRate(
                                    uploadStat.invitedRecords +
                                      uploadStat.acceptedRecords,
                                    uploadStat.totalRecords
                                  )
                                )}
                                className="text-sm"
                              >
                                {calculateSuccessRate(
                                  uploadStat.invitedRecords +
                                    uploadStat.acceptedRecords,
                                  uploadStat.totalRecords
                                )}
                                % Success
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-5">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {uploadStat.totalRecords}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Total Records
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {uploadStat.failedRecords}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Failed
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {uploadStat.duplicateRecords}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Duplicates
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {uploadStat.invitedRecords}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Invited
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-emerald-600">
                                {uploadStat.acceptedRecords}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Accepted
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      No upload statistics available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Failure Analysis Tab */}
            <TabsContent value="failure-analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Failure Analysis
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Detailed breakdown of import failures and error patterns
                  </p>
                </CardHeader>
                <CardContent>
                  {perUploadStats &&
                  perUploadStats.some(
                    (stat) =>
                      stat.failureReasons && stat.failureReasons.length > 0
                  ) ? (
                    <div className="space-y-6">
                      {perUploadStats.map((uploadStat, index) => {
                        if (
                          !uploadStat.failureReasons ||
                          uploadStat.failureReasons.length === 0
                        )
                          return null;

                        return (
                          <div
                            key={uploadStat.batchId || index}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">
                                Batch #{uploadStat.batchId || index + 1}
                              </Badge>
                              <span className="text-sm font-medium">
                                {uploadStat.fileName || `Upload ${index + 1}`}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                ({uploadStat.failedRecords} failed records)
                              </span>
                            </div>

                            <div className="space-y-3">
                              {uploadStat.failureReasons.map(
                                (reason, reasonIndex) => (
                                  <div key={reasonIndex} className="space-y-2">
                                    <div className="text-sm font-medium text-red-800">
                                      {reason.reason}
                                    </div>
                                    {reason.examples &&
                                      reason.examples.length > 0 && (
                                        <div className="space-y-1">
                                          <div className="text-xs font-medium text-red-700">
                                            Example emails:
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {reason.examples
                                              .slice(0, 3)
                                              .map((email, emailIndex) => (
                                                <span
                                                  key={emailIndex}
                                                  className="rounded bg-red-100 px-2 py-1 text-xs text-red-600"
                                                >
                                                  {email}
                                                </span>
                                              ))}
                                            {reason.examples.length > 3 && (
                                              <span className="text-xs text-red-500">
                                                +{reason.examples.length - 3}{' '}
                                                more...
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                )
                              )}
                            </div>

                            {index < perUploadStats.length - 1 && <Separator />}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      No failure reasons available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
