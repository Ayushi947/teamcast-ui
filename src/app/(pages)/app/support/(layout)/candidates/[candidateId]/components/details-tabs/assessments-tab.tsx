'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';
import { RecommendationBadge } from '@/components/ui/recommendation-badge';
import {
  FileText,
  Brain,
  CheckCircle2,
  AlertTriangle,
  // VideoIcon,
  Target,
  ChevronRight,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import {
  ISupportCandidate,
  OnboardingAssessmentResultEnum,
  JobAiAssessmentStatusEnum,
} from '@/lib/shared';
import { logger } from '@/lib/logger';
import { formatEnumValue, formatScore } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AIPoweredLogo from '@/components/app/common/animations/ai-powered-logo';
import { CommonTags } from '@/components/ui/common-tags';
import StrengthsCard from '@/components/ui/strengths-card';
import AreasOfImprovementsCard from '@/components/ui/areas-of-improvements-card';
import { getLatestOnboardingAssessment } from '@/lib/utils/assessment.utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  supportCandidateManagementService,
  publicPracticeAssessmentService,
} from '@/lib/services/services';
import { UserTypeEnum, UserRoleEnum } from '@/lib/shared/models/common/enums';
import { useApp } from '@/lib/context/app-context';
import { OnboardingVideoChunksPlayer } from '@/components/video/onboarding-video-chunks-player';
import { JobAiAssessmentVideoChunksPlayer } from '@/components/video/job-ai-assessment-video-chunks-player';
import { PublicPracticeAssessmentVideoChunksPlayer } from '@/components/video/public-practice-assessment-video-chunks-player';

interface AssessmentsTabProps {
  candidate: ISupportCandidate;
}

// interface VideoPlayerProps {
//   hasFullVideo: boolean;
//   hasHighlightsVideo: boolean;
//   fullVideoUrl?: string;
//   highlightsVideoUrl?: string;
// }

type CandidateApplication = NonNullable<
  ISupportCandidate['applications']
>[number];

// const VideoPlayer: React.FC<VideoPlayerProps> = ({
//   hasFullVideo,
//   hasHighlightsVideo,
//   fullVideoUrl,
//   highlightsVideoUrl,
// }) => {
//   const [showFullVideo, setShowFullVideo] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const initializeVideos = async () => {
//       try {
//         setLoading(true);

//         // Check if we have at least one video URL
//         if (!fullVideoUrl && !highlightsVideoUrl) {
//           setError('No video URLs available');
//           return;
//         }

//         // Set default video preference
//         if (hasHighlightsVideo && highlightsVideoUrl) {
//           setShowFullVideo(false); // Default to highlights if available
//         } else if (hasFullVideo && fullVideoUrl) {
//           setShowFullVideo(true); // Fall back to full video
//         }

//         setLoading(false);
//       } catch (err) {
//         logger.error('Error initializing videos:', err);
//         setError('Failed to load video');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeVideos();
//   }, [hasFullVideo, hasHighlightsVideo, fullVideoUrl, highlightsVideoUrl]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#6e55cf]"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="py-4 text-center text-red-500">{error}</div>;
//   }

//   const currentVideoUrl = showFullVideo ? fullVideoUrl : highlightsVideoUrl;

//   if (!currentVideoUrl) {
//     return (
//       <div className="py-4 text-center text-gray-500">No video available</div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-base font-semibold text-gray-900 dark:text-white">
//           Video Analysis Results
//         </h3>

//         {hasFullVideo &&
//           hasHighlightsVideo &&
//           fullVideoUrl &&
//           highlightsVideoUrl && (
//             <div className="flex items-center gap-2">
//               <Label htmlFor="video-toggle" className="text-sm">
//                 {showFullVideo ? 'Full Video' : 'Highlights'}
//               </Label>
//               <Switch
//                 id="video-toggle"
//                 checked={showFullVideo}
//                 onCheckedChange={setShowFullVideo}
//               />
//             </div>
//           )}
//       </div>

//       <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-blue-50 to-purple-50 p-4 hover:border-[#6e55cf]/30 dark:border-gray-700 dark:from-blue-900/20 dark:to-purple-900/20 dark:hover:border-purple-400/30">
//         <div className="mb-3 flex items-center gap-2">
//           <VideoIcon className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
//           <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
//             {showFullVideo ? 'Full Assessment' : 'Key Highlights'}
//           </h4>
//         </div>

//         <video
//           controls
//           className="aspect-video w-full rounded-lg border border-gray-200 object-cover dark:border-gray-600"
//           preload="metadata"
//           src={currentVideoUrl}
//         >
//           Your browser does not support the video tag.
//         </video>
//       </div>
//     </div>
//   );
// };

export function AssessmentsTab({ candidate }: AssessmentsTabProps) {
  const { user } = useApp();

  // Add collapsible state for resume assessment
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);
  // Add collapsible state for screening assessment
  const [isScreeningExpanded, setIsScreeningExpanded] = useState(false);
  // Add collapsible state for job AI assessment
  const [isJobAiExpanded, setIsJobAiExpanded] = useState<{
    [key: string]: boolean;
  }>({});

  // Add collapsible state for public practice assessments
  const [isPublicPracticeExpanded, setIsPublicPracticeExpanded] = useState<{
    [key: string]: boolean;
  }>({});

  // Resubmit state for job AI assessments
  const [isResubmitting, setIsResubmitting] = useState<{
    [key: string]: boolean;
  }>({});

  // Add tab state for onboarding assessment
  const [onboardingActiveTab, setOnboardingActiveTab] = useState<
    'overview' | 'sections' | 'video'
  >('overview');
  // Add tab state for job AI assessment
  const [jobAiActiveTab, setJobAiActiveTab] = useState<{
    [key: string]: 'overview' | 'sections' | 'video';
  }>({});
  // Add tab state for public practice assessments
  const [publicPracticeActiveTab, setPublicPracticeActiveTab] = useState<{
    [key: string]: 'overview' | 'sections' | 'video';
  }>({});

  useEffect(() => {
    const assessments = candidate.jobAiAssessments ?? [];

    if (!assessments.length) {
      return;
    }

    setJobAiActiveTab((prev) => {
      const next = { ...prev };
      let hasChanged = false;

      const currentIds = new Set<string>();

      assessments.forEach((assessment) => {
        if (!assessment?.id) {
          return;
        }
        currentIds.add(assessment.id);
        if (!next[assessment.id]) {
          next[assessment.id] = 'overview';
          hasChanged = true;
        }
      });

      Object.keys(next).forEach((id) => {
        if (!currentIds.has(id)) {
          delete next[id];
          hasChanged = true;
        }
      });

      return hasChanged ? next : prev;
    });
  }, [candidate.jobAiAssessments]);

  // Animation variants for collapsible content
  const collapsibleVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      height: 'auto',
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
        opacity: { duration: 0.2 },
        scale: { duration: 0.25 },
        y: { duration: 0.3 },
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.25,
        ease: 'easeIn' as const,
      },
    },
  };

  // Chevron rotation animation variants
  const chevronVariants = {
    closed: { rotate: 0 },
    open: {
      rotate: 90,
      transition: { duration: 0.2, ease: 'easeOut' as const },
    },
  };

  const latestOnboardingAssessment = useMemo(() => {
    return getLatestOnboardingAssessment(candidate);
  }, [candidate]);

  const jobApplicationsById = useMemo(() => {
    const map: Record<string, CandidateApplication> = {};

    candidate.applications?.forEach((application) => {
      if (application?.id) {
        map[application.id] = application;
      }
    });

    return map;
  }, [candidate.applications]);

  // Handler for resubmitting job AI assessment
  const handleResubmitJobAssessment = async (assessmentId: string) => {
    try {
      setIsResubmitting((prev) => ({ ...prev, [assessmentId]: true }));

      const response =
        await supportCandidateManagementService.resubmitJobAssessment(
          assessmentId
        );

      toast.success(
        response.message ||
          'Assessment resubmitted successfully. Processing in background...'
      );
    } catch (error: any) {
      logger.error('Error resubmitting job assessment:', error);

      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to resubmit assessment. Please try again.';

      toast.error(errorMessage);
    } finally {
      setIsResubmitting((prev) => ({ ...prev, [assessmentId]: false }));
    }
  };

  const isSupportAdmin =
    user?.type === UserTypeEnum.SUPPORT && user?.role === UserRoleEnum.ADMIN;

  const hasAssessments =
    (candidate.resumeAssessments && candidate.resumeAssessments.length > 0) ||
    (candidate.onboardingAssessments &&
      candidate.onboardingAssessments.length > 0) ||
    (candidate.jobAiAssessments && candidate.jobAiAssessments.length > 0) ||
    (isSupportAdmin &&
      candidate.publicPracticeAssessments &&
      candidate.publicPracticeAssessments.length > 0);

  if (!hasAssessments) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Brain className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          No Assessments Found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This candidate has not completed any assessments yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resume Assessment */}
      {candidate.resumeAssessments?.[0] && (
        <Card className="bg-card shadow-none hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader
            className="cursor-pointer rounded-xl pb-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            onClick={() => setIsResumeExpanded(!isResumeExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  variants={chevronVariants}
                  animate={isResumeExpanded ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                </motion.div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                  Resume Assessment
                  <AIPoweredLogo />
                </CardTitle>
              </div>
              <RecommendationBadge
                recommendation={candidate.resumeAssessments[0].recommendation}
              />
            </div>
            <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {candidate.resumeAssessments[0].overallFeedback}
              </p>
            </CardDescription>
          </CardHeader>

          {/* Collapsible Content for Resume Assessment */}
          <AnimatePresence>
            {isResumeExpanded && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={collapsibleVariants}
                className="overflow-hidden"
              >
                <CardContent>
                  {/* Strengths and Areas for Improvement */}
                  <div className="mb-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                          Strengths
                        </h3>
                        <StrengthsCard
                          values={
                            candidate.resumeAssessments?.[0]?.strengths || []
                          }
                        />
                      </div>
                      <div>
                        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                          Areas for Improvement
                        </h3>
                        <AreasOfImprovementsCard
                          values={
                            candidate.resumeAssessments?.[0]
                              ?.areasForImprovement || []
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Screening Assessment */}
      {latestOnboardingAssessment &&
        latestOnboardingAssessment.result !==
          OnboardingAssessmentResultEnum.NOT_AVAILABLE && (
          <Card className="bg-card shadow-none hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CardHeader
              className="cursor-pointer rounded-xl pb-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              onClick={() => setIsScreeningExpanded(!isScreeningExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    variants={chevronVariants}
                    animate={isScreeningExpanded ? 'open' : 'closed'}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </motion.div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <Brain className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                    Screening Assessment
                    <AIPoweredLogo />
                  </CardTitle>
                </div>
                <RecommendationBadge
                  recommendation={latestOnboardingAssessment?.recommendation}
                />
              </div>
              <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {latestOnboardingAssessment?.overallFeedback && (
                  <span className="mt-2 block">
                    {latestOnboardingAssessment.overallFeedback}
                  </span>
                )}
              </CardDescription>
            </CardHeader>

            {/* Collapsible Content for Screening Assessment */}
            <AnimatePresence>
              {isScreeningExpanded && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={collapsibleVariants}
                  className="overflow-hidden"
                >
                  <CardContent>
                    {/* Tab Navigation */}
                    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-8">
                        <button
                          onClick={() => setOnboardingActiveTab('overview')}
                          className={`pb-2 text-sm font-medium transition-colors ${
                            onboardingActiveTab === 'overview'
                              ? 'border-b-2 border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                        >
                          Overview
                        </button>
                        <button
                          onClick={() => setOnboardingActiveTab('sections')}
                          className={`pb-2 text-sm font-medium transition-colors ${
                            onboardingActiveTab === 'sections'
                              ? 'border-b-2 border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                        >
                          Assessment Sections
                        </button>
                        <button
                          onClick={() => setOnboardingActiveTab('video')}
                          className={`pb-2 text-sm font-medium transition-colors ${
                            onboardingActiveTab === 'video'
                              ? 'border-b-2 border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                        >
                          Video Analysis
                        </button>
                      </div>
                    </div>

                    {/* Tab Content */}
                    {onboardingActiveTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Strengths and Areas for Improvement */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                          <div>
                            <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                              Strengths
                            </h3>
                            <StrengthsCard
                              values={
                                latestOnboardingAssessment?.strengths || []
                              }
                            />
                          </div>
                          <div>
                            <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                              Areas for Improvement
                            </h3>
                            <AreasOfImprovementsCard
                              values={
                                latestOnboardingAssessment?.areasForImprovement ||
                                []
                              }
                            />
                          </div>
                        </div>

                        {/* Common Tags */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Assessment Summary
                          </h3>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Technical Skills
                              </h4>
                              <CommonTags
                                values={[
                                  'Problem Solving',
                                  'Technical Knowledge',
                                ]}
                              />
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Soft Skills
                              </h4>
                              <CommonTags
                                values={['Communication', 'Teamwork']}
                              />
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Industry Fit
                              </h4>
                              <CommonTags
                                values={['Domain Knowledge', 'Experience']}
                              />
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Role Fit
                              </h4>
                              <CommonTags
                                values={['Skills Match', 'Cultural Fit']}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {onboardingActiveTab === 'sections' && (
                      <div className="space-y-6">
                        {latestOnboardingAssessment?.sections?.length &&
                        latestOnboardingAssessment?.sections?.length > 0 ? (
                          latestOnboardingAssessment.sections.map((section) => (
                            <div key={section.id} className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {formatEnumValue(section.title || 'Section')}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {section.questions?.length || 0} questions
                                  </span>
                                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {section.questions?.length &&
                                section.questions?.length > 0 ? (
                                  section.questions.map((question) => (
                                    <div
                                      key={question.id}
                                      className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700"
                                    >
                                      <div className="bg-background p-4 dark:bg-gray-800">
                                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {question.question}
                                        </h5>
                                      </div>
                                      <div className="bg-green-50 p-4 dark:bg-gray-700">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                          {question.answerGiven?.trim()
                                            ? question.answerGiven
                                            : 'No answer provided'}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                    No questions available in this section.
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                            No sections found in this assessment.
                          </div>
                        )}
                      </div>
                    )}

                    {onboardingActiveTab === 'video' && (
                      <div className="space-y-6">
                        {/* Video Chunks Player */}
                        {latestOnboardingAssessment?.id && (
                          <OnboardingVideoChunksPlayer
                            assessmentId={latestOnboardingAssessment.id}
                            service={supportCandidateManagementService}
                            className="bg-background rounded-lg p-4"
                            videoUrl={
                              latestOnboardingAssessment?.videoAnalysis
                                ?.videoUrl
                            }
                            highlightsVideoUrl={
                              latestOnboardingAssessment?.videoAnalysis
                                ?.highlightsVideoUrl
                            }
                          />
                        )}

                        {/* Video Analysis Feedback */}
                        <div className="space-y-6">
                          {/* Overall Feedback - Full Width */}
                          {latestOnboardingAssessment?.videoAnalysis
                            ?.overallFeedback && (
                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                Overall Video Feedback
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {
                                  latestOnboardingAssessment.videoAnalysis
                                    .overallFeedback
                                }
                              </p>
                            </div>
                          )}

                          {/* Strengths and Areas for Improvement in 2-column grid */}
                          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Strengths */}
                            <div className="space-y-3">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                Video Strengths
                              </h3>
                              {(() => {
                                const rawStrengths =
                                  latestOnboardingAssessment?.strengths;
                                const strengths =
                                  Array.isArray(rawStrengths) &&
                                  rawStrengths.length > 0
                                    ? rawStrengths.filter(
                                        (s) =>
                                          typeof s === 'string' &&
                                          s.trim() &&
                                          s.trim() !== '00'
                                      )
                                    : [];

                                return strengths.length > 0 ? (
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
                                ) : (
                                  <div className="flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-gray-900/20">
                                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                                    <span className="text-sm text-gray-900 dark:text-white">
                                      No strengths found
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Areas for Improvement */}
                            <div className="space-y-3">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                Areas for Improvement
                              </h3>
                              {(() => {
                                const rawAreas =
                                  latestOnboardingAssessment?.areasForImprovement;
                                const areas =
                                  Array.isArray(rawAreas) && rawAreas.length > 0
                                    ? rawAreas.filter(
                                        (area) =>
                                          typeof area === 'string' &&
                                          area.trim() &&
                                          area.trim() !== '00'
                                      )
                                    : [];

                                return areas.length > 0 ? (
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
                                ) : (
                                  <div className="flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-gray-900/20">
                                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                                    <span className="text-sm text-gray-900 dark:text-white">
                                      No areas for improvement found
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}

      {/* Job AI Assessments */}
      {candidate.jobAiAssessments && candidate.jobAiAssessments.length > 0
        ? candidate.jobAiAssessments
            .filter((assessment) => {
              const completedStatuses = [
                JobAiAssessmentStatusEnum.AI_REVIEW_COMPLETED,
                JobAiAssessmentStatusEnum.MANUAL_REVIEW_COMPLETED,
                JobAiAssessmentStatusEnum.ASSESSMENT_COMPLETED,
              ];
              return completedStatuses.includes(
                assessment.status as JobAiAssessmentStatusEnum
              );
            })
            .map((assessment, index) => {
              if (!assessment?.id) {
                return null;
              }

              const jobApplication =
                (assessment.jobApplicationId &&
                  jobApplicationsById[assessment.jobApplicationId]) ||
                undefined;

              const jobTitle =
                jobApplication?.jobPosting?.title ||
                assessment.jobPosting?.title ||
                `Assessment ${index + 1}`;

              const companyName =
                jobApplication?.jobPosting?.company?.name ||
                assessment.jobPosting?.client?.company?.name ||
                '';

              const activeJobAiTab =
                jobAiActiveTab[assessment.id] ?? 'overview';
              const isExpanded = !!isJobAiExpanded[assessment.id];

              const sortedSections = assessment.sections
                ? [...assessment.sections].sort(
                    (a, b) => (a?.order ?? 0) - (b?.order ?? 0)
                  )
                : [];

              return (
                <Card
                  key={assessment.id}
                  className="bg-card shadow-none hover:shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <CardHeader
                    className="cursor-pointer rounded-xl pb-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() =>
                      setIsJobAiExpanded((prev) => ({
                        ...prev,
                        [assessment.id]: !prev[assessment.id],
                      }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          variants={chevronVariants}
                          animate={isExpanded ? 'open' : 'closed'}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        </motion.div>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                          <Target className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                          Job Assessment - {jobTitle}
                          <AIPoweredLogo />
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <RecommendationBadge
                          recommendation={assessment.recommendation}
                        />
                        {/* Resubmit Assessment Button - Show for support users */}
                        {user?.type === UserTypeEnum.SUPPORT &&
                          (user?.role === UserRoleEnum.ADMIN ||
                            user?.role === UserRoleEnum.RECRUITER ||
                            user?.role === UserRoleEnum.ACCOUNT_MANAGER) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-2 px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResubmitJobAssessment(assessment.id);
                              }}
                              disabled={isResubmitting[assessment.id]}
                              title="Resubmit assessment for re-analysis (Rate limited: 10 min)"
                            >
                              <RefreshCw
                                className={`h-3 w-3 ${
                                  isResubmitting[assessment.id]
                                    ? 'animate-spin'
                                    : ''
                                }`}
                              />
                              {isResubmitting[assessment.id]
                                ? 'Resubmitting...'
                                : 'Resubmit'}
                            </Button>
                          )}
                      </div>
                    </div>
                    {assessment.overallFeedback && (
                      <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {assessment.overallFeedback}
                      </CardDescription>
                    )}
                  </CardHeader>

                  {/* Collapsible Content for Job AI Assessment */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={collapsibleVariants}
                        className="overflow-hidden"
                      >
                        <CardContent>
                          <div className="mb-6 space-y-4">
                            {(typeof assessment.score === 'number' ||
                              assessment.result ||
                              typeof assessment.duration === 'number') && (
                              <div className="grid gap-4 rounded-lg border border-gray-100 bg-white p-4 text-sm sm:grid-cols-2 dark:border-gray-700 dark:bg-gray-900">
                                {typeof assessment.score === 'number' && (
                                  <div>
                                    <p className="text-bold text-gray-500 dark:text-gray-400">
                                      Score
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                                      {formatScore(assessment.score)}%
                                    </p>
                                  </div>
                                )}
                                {assessment.result && (
                                  <div>
                                    <p className="text-bold text-gray-500 dark:text-gray-400">
                                      Result
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                                      {formatEnumValue(assessment.result ?? '')}
                                    </p>
                                  </div>
                                )}
                                {companyName && (
                                  <div>
                                    <p className="text-bold text-gray-500 dark:text-gray-400">
                                      Company Name
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                                      {companyName}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Tab Navigation */}
                          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-8">
                              <button
                                onClick={() =>
                                  setJobAiActiveTab((prev) => ({
                                    ...prev,
                                    [assessment.id]: 'overview',
                                  }))
                                }
                                className={`pb-2 text-sm font-medium transition-colors ${
                                  activeJobAiTab === 'overview'
                                    ? 'border-b-2 border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                              >
                                Overview
                              </button>
                              <button
                                onClick={() =>
                                  setJobAiActiveTab((prev) => ({
                                    ...prev,
                                    [assessment.id]: 'sections',
                                  }))
                                }
                                className={`pb-2 text-sm font-medium transition-colors ${
                                  activeJobAiTab === 'sections'
                                    ? 'border-b-2 border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                              >
                                Assessment Sections
                              </button>
                              <button
                                onClick={() =>
                                  setJobAiActiveTab((prev) => ({
                                    ...prev,
                                    [assessment.id]: 'video',
                                  }))
                                }
                                className={`pb-2 text-sm font-medium transition-colors ${
                                  activeJobAiTab === 'video'
                                    ? 'border-b-2 border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                              >
                                Video Analysis
                              </button>
                            </div>
                          </div>

                          {/* Tab Content */}
                          {activeJobAiTab === 'overview' && (
                            <div className="space-y-6">
                              {/* Strengths and Areas for Improvement */}
                              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div>
                                  <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                                    Strengths
                                  </h3>
                                  <StrengthsCard
                                    values={assessment?.strengths || []}
                                  />
                                </div>
                                <div>
                                  <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                                    Areas for Improvement
                                  </h3>
                                  <AreasOfImprovementsCard
                                    values={
                                      assessment?.areasForImprovement || []
                                    }
                                  />
                                </div>
                              </div>

                              {/* Common Tags */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  Assessment Summary
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Technical Skills
                                    </h4>
                                    <CommonTags
                                      values={[
                                        'Problem Solving',
                                        'Technical Knowledge',
                                      ]}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Soft Skills
                                    </h4>
                                    <CommonTags
                                      values={['Communication', 'Teamwork']}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Industry Fit
                                    </h4>
                                    <CommonTags
                                      values={[
                                        'Domain Knowledge',
                                        'Experience',
                                      ]}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Role Fit
                                    </h4>
                                    <CommonTags
                                      values={['Skills Match', 'Cultural Fit']}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeJobAiTab === 'sections' && (
                            <div className="space-y-6">
                              {sortedSections.length > 0 ? (
                                sortedSections.map((section) => (
                                  <div
                                    key={
                                      section.id ??
                                      `${assessment.id}-${section.order ?? 0}`
                                    }
                                    className="space-y-4"
                                  >
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatEnumValue(
                                          section.title || 'Section'
                                        )}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                          {section.questions?.length || 0}{' '}
                                          questions
                                        </span>
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      {section.questions?.length &&
                                      section.questions.length > 0 ? (
                                        section.questions.map((question) => (
                                          <div
                                            key={question.id}
                                            className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700"
                                          >
                                            <div className="bg-background p-4 dark:bg-gray-800">
                                              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {question.question}
                                              </h5>
                                            </div>
                                            <div className="bg-green-50 p-4 dark:bg-gray-700">
                                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {question.answerGiven?.trim()
                                                  ? question.answerGiven
                                                  : 'No answer provided'}
                                              </p>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                          No questions available in this
                                          section.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                  No sections found in this assessment.
                                </div>
                              )}
                            </div>
                          )}

                          {activeJobAiTab === 'video' && (
                            <div className="space-y-6">
                              {/* Video Chunks Player */}
                              {assessment.id && (
                                <JobAiAssessmentVideoChunksPlayer
                                  assessmentId={assessment.id}
                                  service={supportCandidateManagementService}
                                  className="bg-background rounded-lg p-4"
                                  videoUrl={assessment.videoAnalysis?.videoUrl}
                                  highlightsVideoUrl={
                                    assessment.videoAnalysis?.highlightsVideoUrl
                                  }
                                />
                              )}

                              {/* Video Analysis Feedback */}
                              {assessment.videoAnalysis && (
                                <div className="space-y-6">
                                  {/* Overall Feedback - Full Width */}
                                  {assessment.videoAnalysis
                                    ?.overallFeedback && (
                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                      <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                        Overall Video Feedback
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {
                                          assessment.videoAnalysis
                                            .overallFeedback
                                        }
                                      </p>
                                    </div>
                                  )}

                                  {/* Strengths and Areas for Improvement in 2-column grid */}
                                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Strengths */}
                                    <div className="space-y-3">
                                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                        Video Strengths
                                      </h3>
                                      {(() => {
                                        const rawStrengths =
                                          assessment.videoAnalysis?.strengths ??
                                          assessment?.strengths;
                                        const strengths =
                                          Array.isArray(rawStrengths) &&
                                          rawStrengths.length > 0
                                            ? rawStrengths.filter(
                                                (s) =>
                                                  typeof s === 'string' &&
                                                  s.trim() &&
                                                  s.trim() !== '00'
                                              )
                                            : [];

                                        return strengths.length > 0 ? (
                                          <div className="space-y-2">
                                            {strengths.map((strength, i) => (
                                              <div
                                                key={i}
                                                className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
                                              >
                                                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                  {strength}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                              No strengths found.
                                            </span>
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    {/* Areas for Improvement */}
                                    <div className="space-y-3">
                                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                        Areas for Improvement
                                      </h3>
                                      {(() => {
                                        const rawAreas =
                                          assessment.videoAnalysis
                                            ?.areasForImprovement ??
                                          assessment?.areasForImprovement;
                                        const areas =
                                          Array.isArray(rawAreas) &&
                                          rawAreas.length > 0
                                            ? rawAreas.filter(
                                                (a) =>
                                                  typeof a === 'string' &&
                                                  a.trim() &&
                                                  a.trim() !== '00'
                                              )
                                            : [];

                                        return areas.length > 0 ? (
                                          <div className="space-y-2">
                                            {areas.map((area, i) => (
                                              <div
                                                key={i}
                                                className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20"
                                              >
                                                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500" />
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                  {area}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                              No areas for improvement found.
                                            </span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })
        : null}

      {/* Public Practice Assessments - Only show to Support Admins */}
      {isSupportAdmin &&
      candidate.publicPracticeAssessments &&
      candidate.publicPracticeAssessments.length > 0
        ? candidate.publicPracticeAssessments
            .filter((assessment) => {
              // Show completed assessments
              return (
                assessment.status === 'COMPLETED' ||
                assessment.status === 'AI_REVIEW_COMPLETED'
              );
            })
            .map((assessment, _index) => {
              if (!assessment?.id) {
                return null;
              }

              const activeTab =
                publicPracticeActiveTab[assessment.id] ?? 'overview';
              const isExpanded = !!isPublicPracticeExpanded[assessment.id];

              const sortedSections = assessment.sections
                ? [...assessment.sections].sort(
                    (a, b) => (a?.order ?? 0) - (b?.order ?? 0)
                  )
                : [];

              return (
                <Card
                  key={assessment.id}
                  className="bg-card shadow-none hover:shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <CardHeader
                    className="cursor-pointer rounded-xl pb-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() =>
                      setIsPublicPracticeExpanded((prev) => ({
                        ...prev,
                        [assessment.id]: !prev[assessment.id],
                      }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          variants={chevronVariants}
                          animate={isExpanded ? 'open' : 'closed'}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        </motion.div>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                          <BookOpen className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                          Practice Assessment - {assessment.title}
                          <AIPoweredLogo />
                        </CardTitle>
                      </div>
                      <RecommendationBadge
                        recommendation={assessment.recommendation}
                      />
                    </div>
                    {assessment.overallFeedback && (
                      <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {assessment.overallFeedback}
                      </CardDescription>
                    )}
                  </CardHeader>

                  {/* Collapsible Content for Public Practice Assessment */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={collapsibleVariants}
                        className="overflow-hidden"
                      >
                        <CardContent>
                          <div className="mb-6 space-y-4">
                            {(typeof assessment.score === 'number' ||
                              assessment.result ||
                              typeof assessment.duration === 'number') && (
                              <div className="grid gap-4 rounded-lg border border-gray-100 bg-white p-4 text-sm sm:grid-cols-2 dark:border-gray-700 dark:bg-gray-900">
                                {typeof assessment.score === 'number' && (
                                  <div>
                                    <p className="text-bold text-gray-500 dark:text-gray-400">
                                      Score
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                                      {Math.round(
                                        formatScore(assessment.score)
                                      )}
                                      %
                                    </p>
                                  </div>
                                )}
                                {assessment.result && (
                                  <div>
                                    <p className="text-bold text-gray-500 dark:text-gray-400">
                                      Result
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                                      {formatEnumValue(assessment.result ?? '')}
                                    </p>
                                  </div>
                                )}
                                {assessment.sourceJobUrl && (
                                  <div>
                                    <p className="text-bold text-gray-500 dark:text-gray-400">
                                      Source Job
                                    </p>
                                    <a
                                      href={assessment.sourceJobUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-base font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                      View Job Posting
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Tab Navigation */}
                          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-8">
                              <button
                                onClick={() =>
                                  setPublicPracticeActiveTab((prev) => ({
                                    ...prev,
                                    [assessment.id]: 'overview',
                                  }))
                                }
                                className={`pb-2 text-sm font-medium transition-colors ${
                                  activeTab === 'overview'
                                    ? 'border-b-2 border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                              >
                                Overview
                              </button>
                              <button
                                onClick={() =>
                                  setPublicPracticeActiveTab((prev) => ({
                                    ...prev,
                                    [assessment.id]: 'sections',
                                  }))
                                }
                                className={`pb-2 text-sm font-medium transition-colors ${
                                  activeTab === 'sections'
                                    ? 'border-b-2 border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                              >
                                Assessment Sections
                              </button>
                              <button
                                onClick={() =>
                                  setPublicPracticeActiveTab((prev) => ({
                                    ...prev,
                                    [assessment.id]: 'video',
                                  }))
                                }
                                className={`pb-2 text-sm font-medium transition-colors ${
                                  activeTab === 'video'
                                    ? 'border-b-2 border-[#6e55cf] text-[#6e55cf] dark:border-purple-400 dark:text-purple-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                              >
                                Video Analysis
                              </button>
                            </div>
                          </div>

                          {/* Tab Content */}
                          {activeTab === 'overview' && (
                            <div className="space-y-6">
                              {/* Strengths and Areas for Improvement */}
                              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div>
                                  <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                                    Strengths
                                  </h3>
                                  <StrengthsCard
                                    values={assessment?.strengths || []}
                                  />
                                </div>
                                <div>
                                  <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                                    Areas for Improvement
                                  </h3>
                                  <AreasOfImprovementsCard
                                    values={
                                      assessment?.areasForImprovement || []
                                    }
                                  />
                                </div>
                              </div>

                              {/* Skills Tags */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  Assessment Summary
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  {assessment.technicalSkills &&
                                    assessment.technicalSkills.length > 0 && (
                                      <div>
                                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                          Technical Skills
                                        </h4>
                                        <CommonTags
                                          values={assessment.technicalSkills}
                                        />
                                      </div>
                                    )}
                                  {assessment.softSkills &&
                                    assessment.softSkills.length > 0 && (
                                      <div>
                                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                          Soft Skills
                                        </h4>
                                        <CommonTags
                                          values={assessment.softSkills}
                                        />
                                      </div>
                                    )}
                                  {assessment.industriesFit &&
                                    assessment.industriesFit.length > 0 && (
                                      <div>
                                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                          Industry Fit
                                        </h4>
                                        <CommonTags
                                          values={assessment.industriesFit}
                                        />
                                      </div>
                                    )}
                                  {assessment.jobRolesFit &&
                                    assessment.jobRolesFit.length > 0 && (
                                      <div>
                                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                          Role Fit
                                        </h4>
                                        <CommonTags
                                          values={assessment.jobRolesFit}
                                        />
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'sections' && (
                            <div className="space-y-6">
                              {sortedSections.length > 0 ? (
                                sortedSections.map((section) => (
                                  <div
                                    key={
                                      section.id ??
                                      `${assessment.id}-${section.order ?? 0}`
                                    }
                                    className="space-y-4"
                                  >
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatEnumValue(
                                          section.title || 'Section'
                                        )}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                          {section.questions?.length || 0}{' '}
                                          questions
                                        </span>
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      {section.questions?.length &&
                                      section.questions.length > 0 ? (
                                        section.questions.map((question) => (
                                          <div
                                            key={question.id}
                                            className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700"
                                          >
                                            <div className="bg-background p-4 dark:bg-gray-800">
                                              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {question.question}
                                              </h5>
                                            </div>
                                            <div className="bg-green-50 p-4 dark:bg-gray-700">
                                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {question.answerGiven?.trim()
                                                  ? question.answerGiven
                                                  : 'No answer provided'}
                                              </p>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                          No questions available in this
                                          section.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                  No sections found in this assessment.
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === 'video' && (
                            <div className="space-y-6">
                              {/* Video Chunks Player */}
                              {assessment.id && (
                                <PublicPracticeAssessmentVideoChunksPlayer
                                  assessmentId={assessment.id}
                                  service={publicPracticeAssessmentService}
                                  className="bg-background rounded-lg p-4"
                                  videoUrl={assessment.videoAnalysis?.videoUrl}
                                  highlightsVideoUrl={
                                    assessment.videoAnalysis?.highlightsVideoUrl
                                  }
                                />
                              )}

                              {/* Video Analysis Feedback */}
                              <div className="space-y-6">
                                {/* Overall Feedback */}
                                {assessment.videoAnalysis?.overallFeedback && (
                                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                      Overall Video Feedback
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {assessment.videoAnalysis.overallFeedback}
                                    </p>
                                  </div>
                                )}

                                {/* Strengths and Areas for Improvement */}
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                  {/* Strengths */}
                                  <div className="space-y-3">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                      Video Strengths
                                    </h3>
                                    {(() => {
                                      const rawStrengths =
                                        assessment.videoAnalysis?.strengths ??
                                        assessment?.strengths;
                                      const strengths =
                                        Array.isArray(rawStrengths) &&
                                        rawStrengths.length > 0
                                          ? rawStrengths.filter(
                                              (s) =>
                                                typeof s === 'string' &&
                                                s.trim() &&
                                                s.trim() !== '00'
                                            )
                                          : [];

                                      return strengths.length > 0 ? (
                                        <div className="space-y-2">
                                          {strengths.map((strength, i) => (
                                            <div
                                              key={i}
                                              className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
                                            >
                                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                                              <span className="text-sm text-gray-900 dark:text-white">
                                                {strength}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                                          <span className="text-sm text-gray-900 dark:text-white">
                                            No strengths found.
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  {/* Areas for Improvement */}
                                  <div className="space-y-3">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                      Areas for Improvement
                                    </h3>
                                    {(() => {
                                      const rawAreas =
                                        assessment.videoAnalysis
                                          ?.areasForImprovement ??
                                        assessment?.areasForImprovement;
                                      const areas =
                                        Array.isArray(rawAreas) &&
                                        rawAreas.length > 0
                                          ? rawAreas.filter(
                                              (a) =>
                                                typeof a === 'string' &&
                                                a.trim() &&
                                                a.trim() !== '00'
                                            )
                                          : [];

                                      return areas.length > 0 ? (
                                        <div className="space-y-2">
                                          {areas.map((area, i) => (
                                            <div
                                              key={i}
                                              className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20"
                                            >
                                              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500" />
                                              <span className="text-sm text-gray-900 dark:text-white">
                                                {area}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                                          <span className="text-sm text-gray-900 dark:text-white">
                                            No areas for improvement found.
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })
        : null}
    </div>
  );
}
