'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApp } from '@/lib/context/app-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Clock } from 'lucide-react';
import { clientPanelInterviewService } from '@/lib/services/services';
import {
  JobPanelAssessmentFeedbackDecisionEnum,
  JobPanelAssessmentRecommendationEnum,
  IClientJobPanelAssessmentFeedbackSubmit,
} from '@/lib/shared';

const decisionOptions = [
  { value: JobPanelAssessmentFeedbackDecisionEnum.HIRE, label: 'Hire' },
  { value: JobPanelAssessmentFeedbackDecisionEnum.NO_HIRE, label: 'No Hire' },
  {
    value: JobPanelAssessmentFeedbackDecisionEnum.NEEDS_ANOTHER_ROUND,
    label: 'Needs Another Round',
  },
];

const recommendationOptions = [
  {
    value: JobPanelAssessmentRecommendationEnum.HIGHLY_RECOMMENDED,
    label: 'Highly Recommended',
  },
  {
    value: JobPanelAssessmentRecommendationEnum.RECOMMENDED,
    label: 'Recommended',
  },
  {
    value: JobPanelAssessmentRecommendationEnum.NOT_RECOMMENDED,
    label: 'Not Recommended',
  },
  {
    value: JobPanelAssessmentRecommendationEnum.REQUIRES_FURTHER_REVIEW,
    label: 'Requires Further Review',
  },
];

export default function FeedbackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();
  const queryClient = useQueryClient();
  const panelAssessmentId = searchParams.get('panelAssessmentId');
  const applicationId = searchParams.get('applicationId');

  const [formData, setFormData] = useState<
    IClientJobPanelAssessmentFeedbackSubmit & { panelMemberEmail: string }
  >({
    detailedFeedback: '',
    decision: JobPanelAssessmentFeedbackDecisionEnum.HIRE,
    recommendation: JobPanelAssessmentRecommendationEnum.RECOMMENDED,
    panelMemberEmail: user?.email || 'current-user@example.com',
  });

  // Update panel member email when user changes
  React.useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, panelMemberEmail: user.email }));
    }
  }, [user?.email]);

  // Check if there's a selected slot for this panel assessment
  const { data: panelSlots } = useQuery({
    queryKey: ['panelAssessmentSlots', panelAssessmentId],
    queryFn: () =>
      clientPanelInterviewService.getPanelAssessmentSlots({
        panelAssessmentId: panelAssessmentId as string,
      }),
    enabled: !!panelAssessmentId,
  });

  // Check if there's a selected slot
  const hasSelectedSlot = panelSlots?.items?.some((slot) => slot.isSelected);

  // Submit feedback mutation
  const { mutate: submitFeedback, isPending: isSubmitting } = useMutation({
    mutationFn: (
      data: IClientJobPanelAssessmentFeedbackSubmit & {
        panelMemberEmail: string;
      }
    ) =>
      clientPanelInterviewService.submitPanelAssessmentFeedback(
        panelAssessmentId as string,
        data
      ),
    onSuccess: () => {
      toast.success('Feedback submitted successfully!');
      // Invalidate feedback queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['panelAssessmentFeedback', panelAssessmentId],
      });
      // Also invalidate all panel assessment feedback queries
      queryClient.invalidateQueries({
        queryKey: ['panelAssessmentFeedback'],
      });
      // Also invalidate panel assessment slots to refresh any dependent data
      queryClient.invalidateQueries({
        queryKey: ['panelAssessmentSlots'],
      });
      // Invalidate the specific application's panel assessment slots
      queryClient.invalidateQueries({
        queryKey: ['panelAssessmentSlots', applicationId],
      });
      // Add a small delay to ensure invalidation completes before navigation
      setTimeout(() => {
        router.push(
          `/app/client/candidates/applications/${applicationId}?tab=schedule`
        );
      }, 100);
    },
    onError: (error: any) => {
      toast.error(
        error?.message || 'Failed to submit feedback. Please try again.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.detailedFeedback.trim()) {
      toast.error('Please provide detailed feedback');
      return;
    }
    submitFeedback(formData);
  };

  const handleBack = () => {
    router.push(
      `/app/client/candidates/applications/${applicationId}?tab=schedule`
    );
  };

  if (!panelAssessmentId || !applicationId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Invalid parameters</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user?.email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              Please log in to submit feedback
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if there's a selected slot
  if (panelSlots && !hasSelectedSlot) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Application</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Waiting for Candidate Response
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                The candidate needs to accept the panel assessment invitation
                and select a time slot before you can submit feedback.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Once candidate selects a slot, you will be able to submit the
                feedback here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Application</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700"
              >
                Panel Assessment Feedback
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5 text-blue-600" />
                  <span>Submit Panel Assessment Feedback</span>
                </CardTitle>
                <CardDescription>
                  Provide detailed feedback about the candidate during the panel
                  assessment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Decision */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Decision *
                    </label>
                    <Select
                      value={formData.decision}
                      onValueChange={(
                        value: JobPanelAssessmentFeedbackDecisionEnum
                      ) =>
                        setFormData((prev) => ({ ...prev, decision: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your decision" />
                      </SelectTrigger>
                      <SelectContent>
                        {decisionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recommendation *
                    </label>
                    <Select
                      value={formData.recommendation}
                      onValueChange={(
                        value: JobPanelAssessmentRecommendationEnum
                      ) =>
                        setFormData((prev) => ({
                          ...prev,
                          recommendation: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your recommendation" />
                      </SelectTrigger>
                      <SelectContent>
                        {recommendationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Detailed Feedback */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Detailed Feedback *
                    </label>
                    <Textarea
                      placeholder="Provide detailed feedback about the candidate's performance, strengths, areas for improvement, and overall assessment..."
                      value={formData.detailedFeedback}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          detailedFeedback: e.target.value,
                        }))
                      }
                      className="min-h-[200px] resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Please be specific and constructive in your feedback.
                      Include examples and observations from the assessment.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || !formData.detailedFeedback.trim()
                      }
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
