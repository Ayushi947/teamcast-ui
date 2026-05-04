import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ICandidateOnboardingAssessment } from '@/lib/shared';
import { AlertTriangle, CheckCircle2, Video } from 'lucide-react';
import { cn, formatEnumValue } from '@/lib/utils';
import { useState } from 'react';
import { CommonTags } from '@/components/ui/common-tags';
import StrengthsCard from '@/components/ui/strengths-card';
import AreasOfImprovementsCard from '@/components/ui/areas-of-improvements-card';
import { RecommendationBadge } from '@/components/ui/recommendation-badge';
import { candidateOnboardingAssessmentService } from '@/lib/services/services';
import { OnboardingVideoChunksPlayer } from '@/components/video/onboarding-video-chunks-player';

interface OnboardingDetailedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onboardingAssessment: ICandidateOnboardingAssessment;
  videoAnalysisVariant?: 'metrics' | 'strengths';
}

export const OnboardingDetailedDialog = ({
  open,
  onOpenChange,
  onboardingAssessment,
  videoAnalysisVariant = 'metrics',
}: OnboardingDetailedDialogProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'video'>(
    'overview'
  );

  const filterInsightValues = (values?: string[] | null) => {
    if (!Array.isArray(values)) {
      return [];
    }

    return values.filter(
      (value) =>
        typeof value === 'string' && value.trim() && value.trim() !== '00'
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto bg-white dark:bg-gray-900 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700">
        <DialogHeader>
          <DialogTitle className="mb-4 flex justify-between text-2xl font-bold dark:text-white">
            <p>Onboarding Assessment</p>
            <div className="flex items-center justify-end">
              <RecommendationBadge
                recommendation={onboardingAssessment?.recommendation}
              />
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Overall Feedback */}
        <div className="bg-background mb-6 rounded-lg p-4 dark:bg-gray-800">
          <h2 className="mb-2 text-lg font-semibold dark:text-white">
            Overall Feedback
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {onboardingAssessment?.overallFeedback}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-2">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'overview'
                  ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={cn(
                'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'sections'
                  ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              )}
            >
              Assessment Sections
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={cn(
                'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'video'
                  ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              )}
            >
              Interview Video
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="mb-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Strengths */}
                <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                  <h3 className="mb-3 text-base font-medium dark:text-white">
                    Strengths
                  </h3>
                  <StrengthsCard
                    className="grid grid-cols-1 gap-2 md:grid-cols-1"
                    values={onboardingAssessment?.strengths}
                  />
                </div>

                {/* Areas for Improvement */}
                <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                  <h3 className="mb-3 text-base font-medium dark:text-white">
                    Areas for Improvement
                  </h3>
                  <AreasOfImprovementsCard
                    className="grid grid-cols-1 gap-2 md:grid-cols-1"
                    values={onboardingAssessment?.areasForImprovement}
                  />
                </div>
              </div>

              {/* Skills Section */}
              <div className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Technical Skills */}
                  <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                    <h3 className="mb-3 text-base font-medium dark:text-white">
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {onboardingAssessment?.technicalSkills?.length > 0 ? (
                        <CommonTags
                          values={onboardingAssessment?.technicalSkills}
                          maxVisible={4}
                        />
                      ) : (
                        <div className="flex w-full items-center gap-3 rounded-md border border-yellow-100 bg-yellow-50 px-4 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            No technical skills identified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Soft Skills */}
                  <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                    <h3 className="mb-3 text-base font-medium dark:text-white">
                      Soft Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {onboardingAssessment?.softSkills?.length > 0 ? (
                        <CommonTags
                          values={onboardingAssessment?.softSkills}
                          maxVisible={4}
                        />
                      ) : (
                        <div className="flex w-full items-center gap-3 rounded-md border border-yellow-100 bg-yellow-50 px-4 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            No soft skills identified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Industry & Role Fit */}
              <div className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Industry Fit */}
                  <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                    <h3 className="mb-3 text-base font-medium dark:text-white">
                      Industry Fit
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {onboardingAssessment?.industriesFit?.length > 0 ? (
                        <CommonTags
                          values={onboardingAssessment?.industriesFit}
                          maxVisible={4}
                        />
                      ) : (
                        <div className="flex w-full items-center gap-3 rounded-md border border-yellow-100 bg-yellow-50 px-4 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            No industry fit identified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role Fit */}
                  <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                    <h3 className="mb-3 text-base font-medium dark:text-white">
                      Role Fit
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {onboardingAssessment?.jobRolesFit?.length > 0 ? (
                        <CommonTags
                          values={onboardingAssessment?.jobRolesFit}
                          maxVisible={4}
                        />
                      ) : (
                        <div className="flex w-full items-center gap-3 rounded-md border border-yellow-100 bg-yellow-50 px-4 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            No role fit identified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-6">
              {onboardingAssessment?.sections?.map((section, index) => (
                <div
                  key={index}
                  className="bg-background rounded-lg border border-gray-100 p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatEnumValue(section.title)}
                    </h3>

                    {/* Section completion indicator */}
                    {section.questions && section.questions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="bg-primary h-full"
                            style={{
                              width: `${(section.questions.filter((q) => q.isAnswered).length / section.questions.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {section.questions.filter((q) => q.isAnswered).length}
                          /{section.questions.length}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="border-primary/30 mb-4 border-l-2 pl-3 text-sm text-gray-700 italic dark:text-gray-300">
                    {section.description}
                  </p>

                  {section.questions && section.questions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                        <span className="bg-primary h-1 w-1 rounded-full"></span>
                        Questions
                        <span className="bg-primary h-1 w-1 rounded-full"></span>
                      </h4>
                      <ul className="space-y-4 text-sm">
                        {section.questions.map((question, qIndex) => (
                          <li
                            key={qIndex}
                            className="rounded-md border border-gray-200 bg-gray-50 p-4 shadow-sm transition-all hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                          >
                            <div className="flex items-start justify-between">
                              <p className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                                {question.question}
                              </p>
                              <div className="ml-4 flex items-center gap-2">
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                                    question.isAnswered
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                  )}
                                >
                                  {question.isAnswered
                                    ? 'Answered'
                                    : 'Not answered'}
                                </span>
                              </div>
                            </div>

                            {question.answerGiven && (
                              <div className="mt-3 rounded-md border border-gray-100 bg-white p-3 dark:border-gray-600 dark:bg-gray-700/50">
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  <span className="font-medium text-gray-900 dark:text-gray-200">
                                    Answer:
                                  </span>{' '}
                                  {question.answerGiven || 'No answer given'}
                                </p>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4 overflow-hidden">
              <div className="bg-background rounded-lg p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Video className="h-5 w-5" />
                    Interview Video
                  </h3>
                </div>

                {/* Video Chunks Player with fallback to video URLs */}
                {onboardingAssessment?.id && (
                  <OnboardingVideoChunksPlayer
                    assessmentId={onboardingAssessment.id}
                    service={{
                      getOnboardingVideoChunks: async (
                        assessmentId,
                        options
                      ) => {
                        const result =
                          await candidateOnboardingAssessmentService.getVideoChunks(
                            assessmentId,
                            options
                          );
                        // Convert createdAt from string to Date
                        return {
                          chunks: result.chunks.map((chunk) => ({
                            ...chunk,
                            createdAt: new Date(chunk.createdAt),
                          })),
                        };
                      },
                    }}
                    className="bg-background rounded-lg"
                    videoUrl={onboardingAssessment?.videoAnalysis?.videoUrl}
                    highlightsVideoUrl={
                      onboardingAssessment?.videoAnalysis?.highlightsVideoUrl
                    }
                    preloadedChunks={onboardingAssessment?.videoChunks}
                  />
                )}
              </div>

              {videoAnalysisVariant === 'metrics' &&
              onboardingAssessment?.videoAnalysis ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {onboardingAssessment.videoAnalysis?.overallFeedback && (
                    <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold dark:text-white">
                          Overall Video Analysis
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {onboardingAssessment.videoAnalysis.overallFeedback}
                      </p>
                    </div>
                  )}

                  {(onboardingAssessment.videoAnalysis?.clarityScore ||
                    onboardingAssessment.videoAnalysis?.clarityFeedback) && (
                    <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold dark:text-white">
                          Clarity
                        </h4>
                      </div>
                      {onboardingAssessment.videoAnalysis?.clarityFeedback && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {onboardingAssessment.videoAnalysis.clarityFeedback}
                        </p>
                      )}
                    </div>
                  )}

                  {(onboardingAssessment.videoAnalysis?.confidenceScore ||
                    onboardingAssessment.videoAnalysis?.confidenceFeedback) && (
                    <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold dark:text-white">
                          Confidence
                        </h4>
                      </div>
                      {onboardingAssessment.videoAnalysis
                        ?.confidenceFeedback && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {
                            onboardingAssessment.videoAnalysis
                              .confidenceFeedback
                          }
                        </p>
                      )}
                    </div>
                  )}

                  {(onboardingAssessment.videoAnalysis?.engagementScore ||
                    onboardingAssessment.videoAnalysis?.engagementFeedback) && (
                    <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold dark:text-white">
                          Engagement
                        </h4>
                      </div>
                      {onboardingAssessment.videoAnalysis
                        ?.engagementFeedback && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {
                            onboardingAssessment.videoAnalysis
                              .engagementFeedback
                          }
                        </p>
                      )}
                    </div>
                  )}

                  {(onboardingAssessment.videoAnalysis
                    ?.professionalDemeanorScore ||
                    onboardingAssessment.videoAnalysis
                      ?.professionalDemeanorFeedback) && (
                    <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold dark:text-white">
                          Professional Demeanor
                        </h4>
                      </div>
                      {onboardingAssessment.videoAnalysis
                        ?.professionalDemeanorFeedback && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {
                            onboardingAssessment.videoAnalysis
                              .professionalDemeanorFeedback
                          }
                        </p>
                      )}
                    </div>
                  )}

                  {(onboardingAssessment.videoAnalysis?.proctoringScore ||
                    onboardingAssessment.videoAnalysis?.proctoringFeedback) && (
                    <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold dark:text-white">
                          Proctoring
                        </h4>
                      </div>
                      {onboardingAssessment.videoAnalysis
                        ?.proctoringFeedback && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {
                            onboardingAssessment.videoAnalysis
                              .proctoringFeedback
                          }
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Video Strengths
                      </h3>
                      {(() => {
                        const strengths = filterInsightValues(
                          onboardingAssessment.strengths
                        );

                        if (strengths.length === 0) {
                          return (
                            <div className="flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                No strengths found
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-2">
                            {strengths.map((strength, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
                              >
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {strength}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Areas for Improvement
                      </h3>
                      {(() => {
                        const areas = filterInsightValues(
                          onboardingAssessment.areasForImprovement
                        );

                        if (areas.length === 0) {
                          return (
                            <div className="flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                No areas for improvement found
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-2">
                            {areas.map((area, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20"
                              >
                                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {area}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
