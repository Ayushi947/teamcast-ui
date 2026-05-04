import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PublicProfileLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-14 md:pt-20 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-6 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 space-y-6">
          {/* Profile info and Professional summary */}
          <div className="flex h-full w-full flex-col gap-6 md:min-h-[1px] md:flex-row md:items-stretch">
            {/* Profile info */}
            <div className="flex w-full basis-1/3 md:flex-col">
              <Card className="flex h-full flex-1 flex-col items-center justify-center bg-white p-6 dark:bg-gray-800">
                <div className="flex flex-col items-center gap-6">
                  {/* Profile photo skeleton */}
                  <Skeleton className="h-32 w-32 rounded-full" />

                  {/* Profile Information */}
                  <div className="flex flex-col items-center gap-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />

                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-44" />
                    </div>

                    <Skeleton className="h-6 w-28" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Professional Summary */}
            <div className="w-full md:flex-1">
              <Card className="flex h-full flex-1 flex-col bg-white p-6 dark:bg-gray-800">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-4 dark:border-gray-700">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-48" />
                </div>

                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <div className="flex flex-wrap gap-2">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-16" />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <div className="flex flex-wrap gap-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-20" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <div className="flex flex-wrap gap-2">
                        {[...Array(2)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-16" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Professional Details Skeleton */}
          <Card className="bg-white p-6 dark:bg-gray-800">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-4 dark:border-gray-700">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-36" />
            </div>

            <div className="mt-6 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2">
                      {[...Array(4)].map((_, j) => (
                        <Skeleton key={j} className="h-6 w-16" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
