'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle,
  Calendar,
  User,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { IClientJobPanelAssessmentFeedback } from '@/lib/shared';
import { formatDateAndTime } from '@/lib/utils';

interface FeedbackViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feedback?: IClientJobPanelAssessmentFeedback;
}

export const FeedbackViewDialog: React.FC<FeedbackViewDialogProps> = ({
  isOpen,
  onOpenChange,
  feedback,
}) => {
  if (!feedback) {
    return null;
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'HIRE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'NO_HIRE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'NEEDS_ANOTHER_ROUND':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'HIGHLY_RECOMMENDED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'RECOMMENDED':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800';
      case 'NOT_RECOMMENDED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800';
      case 'REQUIRES_FURTHER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800';
    }
  };

  const formatEnumValue = (value: string) => {
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Panel Assessment Feedback
          </DialogTitle>
          <DialogDescription>
            Your submitted feedback for this panel assessment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feedback Header */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/40">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-green-800 dark:text-green-300">
                      {feedback.panelMemberName}
                    </CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-400">
                      {feedback.panelMemberEmail}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Submitted
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <Calendar className="h-4 w-4" />
                Submitted on{' '}
                {formatDateAndTime(feedback.submittedAt || feedback.createdAt)}
              </div>
            </CardContent>
          </Card>

          {/* Decision and Recommendation */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ThumbsUp className="h-4 w-4 text-blue-600" />
                  Decision
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge
                  variant="secondary"
                  className={`px-3 py-1 text-base ${getDecisionColor(feedback.decision)}`}
                >
                  {formatEnumValue(feedback.decision)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-base ${getRecommendationColor(feedback.recommendation)}`}
                >
                  {formatEnumValue(feedback.recommendation)}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Detailed Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <p className="leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                  {feedback.detailedFeedback}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
