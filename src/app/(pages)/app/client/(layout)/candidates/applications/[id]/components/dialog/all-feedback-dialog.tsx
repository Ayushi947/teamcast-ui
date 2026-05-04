import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateAndTime } from '@/lib/utils';
import {
  JobPanelAssessmentFeedbackDecisionEnum,
  JobPanelAssessmentRecommendationEnum,
} from '@/lib/shared';

interface AllFeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackList: any[];
}

export const AllFeedbackDialog: FC<AllFeedbackDialogProps> = ({
  isOpen,
  onOpenChange,
  feedbackList,
}) => {
  const submittedFeedback = feedbackList.filter(
    (feedback) => feedback.isSubmitted
  );
  const pendingFeedback = feedbackList.filter(
    (feedback) => !feedback.isSubmitted
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Panel Feedback
            <Badge variant="secondary" className="ml-2">
              {feedbackList.length} Total
            </Badge>
          </DialogTitle>
          <DialogDescription>
            View feedback from all panel members (both external and internal)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Submitted Feedback Section */}
            {submittedFeedback.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Submitted Feedback ({submittedFeedback.length})
                </h3>
                <div className="space-y-4">
                  {submittedFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {feedback.panelMemberName}
                            </h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {feedback.panelMemberEmail}
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            >
                              Submitted
                            </Badge>
                          </div>

                          <div className="mb-4 space-y-3">
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Decision:
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`ml-2 ${
                                    feedback.decision ===
                                    JobPanelAssessmentFeedbackDecisionEnum.HIRE
                                      ? 'border-green-500 text-green-700 dark:border-green-400 dark:text-green-300'
                                      : feedback.decision ===
                                          JobPanelAssessmentFeedbackDecisionEnum.NO_HIRE
                                        ? 'border-red-500 text-red-700 dark:border-red-400 dark:text-red-300'
                                        : 'border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300'
                                  }`}
                                >
                                  {feedback.decision ===
                                  JobPanelAssessmentFeedbackDecisionEnum.HIRE
                                    ? 'Hire'
                                    : feedback.decision ===
                                        JobPanelAssessmentFeedbackDecisionEnum.NO_HIRE
                                      ? 'No Hire'
                                      : 'Needs Another Round'}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Recommendation:
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`ml-2 ${
                                    feedback.recommendation ===
                                    JobPanelAssessmentRecommendationEnum.HIGHLY_RECOMMENDED
                                      ? 'border-green-500 text-green-700 dark:border-green-400 dark:text-green-300'
                                      : feedback.recommendation ===
                                          JobPanelAssessmentRecommendationEnum.RECOMMENDED
                                        ? 'border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-300'
                                        : feedback.recommendation ===
                                            JobPanelAssessmentRecommendationEnum.NOT_RECOMMENDED
                                          ? 'border-red-500 text-red-700 dark:border-red-400 dark:text-red-300'
                                          : 'border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300'
                                  }`}
                                >
                                  {feedback.recommendation ===
                                  JobPanelAssessmentRecommendationEnum.HIGHLY_RECOMMENDED
                                    ? 'Highly Recommended'
                                    : feedback.recommendation ===
                                        JobPanelAssessmentRecommendationEnum.RECOMMENDED
                                      ? 'Recommended'
                                      : feedback.recommendation ===
                                          JobPanelAssessmentRecommendationEnum.NOT_RECOMMENDED
                                        ? 'Not Recommended'
                                        : 'Requires Further Review'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Detailed Feedback:
                            </span>
                            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                              {feedback.detailedFeedback}
                            </p>
                          </div>

                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Submitted on{' '}
                            {formatDateAndTime(feedback.submittedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Feedback Section */}
            {pendingFeedback.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Feedback ({pendingFeedback.length})
                </h3>
                <div className="space-y-4">
                  {pendingFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {feedback.panelMemberName}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {feedback.panelMemberEmail}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300"
                        >
                          Pending
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Feedback not submitted yet
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
