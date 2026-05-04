'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Target } from 'lucide-react';

export const KpisHeader = () => {
  return (
    <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-600 p-3">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Candidate Analytics
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  Live
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Track candidate performance and platform metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Insights</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Metrics</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
