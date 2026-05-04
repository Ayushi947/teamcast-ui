'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { IPartnerCandidate, logger } from '@/lib/shared';

interface AssessmentsUpdateTabProps {
  candidate: IPartnerCandidate;
}

export function AssessmentsUpdateTab({ candidate }: AssessmentsUpdateTabProps) {
  logger.info('candidate', candidate);
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <ClipboardList className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
            Assessments Update
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            Update assessment information and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            <p>Assessment update form will be implemented here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
