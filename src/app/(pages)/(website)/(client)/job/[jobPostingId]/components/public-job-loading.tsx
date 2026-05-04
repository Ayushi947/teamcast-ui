import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PublicJobLoading: React.FC = () => {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Background pattern */}
      <div className="bg-grid-pattern pointer-events-none fixed inset-0 opacity-[0.02]" />

      <div className="relative">
        {/* Navigation padding for fixed header */}
        <div className="h-14 md:h-16" />

        {/* Main content */}
        <div className="mx-auto w-[70%] px-3 pb-12 sm:px-4 lg:px-6">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="pt-6 md:pt-8">
              <div className="space-y-6">
                {/* Job Title and Company */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-96" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>

                  {/* Key Job Details */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Salary and Type Info */}
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-6 w-24" />
                  ))}
                </div>
              </div>
            </div>

            {/* Job Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
              {/* Left Column - Job Card */}
              <div className="lg:col-span-4">
                <div className="sticky top-20">
                  <Card className="shadow-lg">
                    <CardHeader className="pb-4">
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Apply Button */}
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>

                      <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Column - Job Description & Details */}
              <div className="lg:col-span-8">
                <div className="space-y-6">
                  {/* Job Description */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-6 w-40" />
                        </div>
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <Skeleton className="mt-0.5 h-4 w-4" />
                              <Skeleton className="h-4 w-64" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job Details */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-6 w-20" />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
