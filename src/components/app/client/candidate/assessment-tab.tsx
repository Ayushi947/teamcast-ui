import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import {
  IClientJobApplicationAiAssessment,
  ICandidateOnboardingAssessment,
  IResumeAssessment,
  ICandidateJobAiAssessment,
} from '@/lib/shared';
import { RecommendationBadge } from '@/components/ui/recommendation-badge';
import {
  AlertTriangle,
  Brain,
  Target,
  Video,
  CheckCircle2,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { formatEnumValue, formatScore, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AIPoweredLogo from '../../common/animations/ai-powered-logo';
import { CommonTags } from '@/components/ui/common-tags';
import StrengthsCard from '@/components/ui/strengths-card';
import AreasOfImprovementsCard from '@/components/ui/areas-of-improvements-card';
import { OnboardingVideoChunksPlayer } from '@/components/video/onboarding-video-chunks-player';
import { JobAiAssessmentVideoChunksPlayer } from '@/components/video/job-ai-assessment-video-chunks-player';
import { clientCandidateApiService } from '@/lib/services/services';

interface AssessmentTabProps {
  clientJobApplicationAiAssessment?: IClientJobApplicationAiAssessment;
  onboardingAssessment: ICandidateOnboardingAssessment;
  resumeAssessment: IResumeAssessment;
  jobAssessmentDetails?: ICandidateJobAiAssessment;
}

export const AssessmentTab = ({
  clientJobApplicationAiAssessment,
  onboardingAssessment,
  resumeAssessment,
  jobAssessmentDetails,
}: AssessmentTabProps) => {
  const [isJobAiFullVideo, setIsJobAiFullVideo] = useState(false);
  // Add collapsible state for screening assessment
  const [isScreeningExpanded, setIsScreeningExpanded] = useState(false);
  // Add collapsible state for resume assessment
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);
  // Add collapsible state for job AI assessment
  const [isJobAiExpanded, setIsJobAiExpanded] = useState(false);

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

  // Add tab state for onboarding assessment
  const [onboardingActiveTab, setOnboardingActiveTab] = useState<
    'overview' | 'sections' | 'video'
  >('overview');
  const [jobActiveTab, setJobActiveTab] = useState<
    'overview' | 'sections' | 'video'
  >('overview');
  // Add tab state for job AI assessment
  const [jobAiActiveTab, setJobAiActiveTab] = useState<
    'overview' | 'sections' | 'video'
  >('overview');

  // Check if any assessment is available
  const hasAnyAssessment =
    resumeAssessment ||
    onboardingAssessment ||
    jobAssessmentDetails ||
    clientJobApplicationAiAssessment;

  return (
    <div className="space-y-3">
      {/* Fallback message when no assessments are available */}
      {!hasAnyAssessment && (
        <Card className="bg-card shadow-none dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-700">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No Assessments Available
            </h3>
            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              Assessments will appear here once the candidate completes their
              screening, resume evaluation, or job-specific assessments.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resume Assessment - Collapsible */}
      {resumeAssessment && (
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
                recommendation={resumeAssessment?.recommendation}
              />
            </div>
            <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {resumeAssessment.overallFeedback && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {resumeAssessment.overallFeedback}
                </p>
              )}
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
                  {/* Strengths */}
                  <div className="mb-6">
                    <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                      Strengths
                    </h3>
                    {(() => {
                      const strengths = Array.isArray(
                        resumeAssessment?.strengths
                      )
                        ? resumeAssessment.strengths.filter(
                            (s) => typeof s === 'string' && s.trim() !== ''
                          )
                        : [];

                      return strengths.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {strengths.map((strength, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {strength}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Not available
                        </p>
                      );
                    })()}
                  </div>

                  {/* Areas for Improvement */}
                  <div className="mb-6">
                    <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                      Areas for Improvement
                    </h3>
                    {(() => {
                      const rawAreas = resumeAssessment?.areasForImprovement;
                      const areas =
                        Array.isArray(rawAreas) && rawAreas.length > 0
                          ? rawAreas.filter(
                              (a) =>
                                typeof a === 'string' &&
                                a.trim() !== '' &&
                                a.trim() !== '00'
                            )
                          : [];

                      return areas.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {areas.map((area, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20"
                            >
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {area}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Not available
                        </p>
                      );
                    })()}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Screening Assessment - Collapsible */}
      {onboardingAssessment && (
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
                  transition={{ duration: 0.2, ease: 'easeOut' as const }}
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
                recommendation={onboardingAssessment?.recommendation}
              />
            </div>
            <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {onboardingAssessment?.overallFeedback && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {onboardingAssessment.overallFeedback}
                </p>
              )}
            </CardDescription>
          </CardHeader>

          {/* Collapsible Content */}
          <AnimatePresence>
            {isScreeningExpanded && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={collapsibleVariants}
                className="overflow-hidden"
              >
                <>
                  {/* Tabs */}
                  <div className="mx-6 mb-2">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setOnboardingActiveTab('overview')}
                        className={cn(
                          'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                          onboardingActiveTab === 'overview'
                            ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                        )}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setOnboardingActiveTab('sections')}
                        className={cn(
                          'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                          onboardingActiveTab === 'sections'
                            ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                        )}
                      >
                        Assessment Sections
                      </button>
                      {onboardingAssessment?.id && (
                        <button
                          onClick={() => setOnboardingActiveTab('video')}
                          className={cn(
                            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                            onboardingActiveTab === 'video'
                              ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                          )}
                        >
                          Video Analysis
                        </button>
                      )}
                    </div>
                  </div>

                  <CardContent>
                    {/* Tab Content */}
                    {onboardingActiveTab === 'overview' && (
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
                                {onboardingAssessment?.technicalSkills?.length >
                                0 ? (
                                  <CommonTags
                                    values={
                                      onboardingAssessment?.technicalSkills
                                    }
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
                                {onboardingAssessment?.softSkills?.length >
                                0 ? (
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
                                {onboardingAssessment?.industriesFit?.length >
                                0 ? (
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
                                {onboardingAssessment?.jobRolesFit?.length >
                                0 ? (
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

                    {onboardingActiveTab === 'sections' && (
                      <div className="space-y-6">
                        {onboardingAssessment?.sections?.map(
                          (section, index) => (
                            <div
                              key={index}
                              className="bg-background rounded-lg border border-gray-100 p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {formatEnumValue(section.title)}
                                </h3>

                                {/* Section completion indicator */}
                                {section.questions &&
                                  section.questions.length > 0 && (
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
                                        {
                                          section.questions.filter(
                                            (q) => q.isAnswered
                                          ).length
                                        }
                                        /{section.questions.length}
                                      </span>
                                    </div>
                                  )}
                              </div>

                              <p className="border-primary/30 mb-4 border-l-2 pl-3 text-sm text-gray-700 italic dark:text-gray-300">
                                {section.description}
                              </p>

                              {section.questions &&
                                section.questions.length > 0 && (
                                  <div className="mt-4">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                                      <span className="bg-primary h-1 w-1 rounded-full"></span>
                                      Questions
                                      <span className="bg-primary h-1 w-1 rounded-full"></span>
                                    </h4>
                                    <ul className="space-y-4 text-sm">
                                      {section.questions.map(
                                        (question, qIndex) => (
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
                                                  {question.answerGiven ||
                                                    'No answer given'}
                                                </p>
                                              </div>
                                            )}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {onboardingActiveTab === 'video' && (
                      <div className="space-y-4">
                        {/* Video Chunks Player - Smaller size */}
                        {onboardingAssessment?.id && (
                          <div className="mx-auto max-w-2xl">
                            <OnboardingVideoChunksPlayer
                              assessmentId={onboardingAssessment.id}
                              service={clientCandidateApiService}
                              className="bg-background rounded-lg p-4"
                              videoUrl={
                                onboardingAssessment?.videoAnalysis?.videoUrl
                              }
                              highlightsVideoUrl={
                                onboardingAssessment?.videoAnalysis
                                  ?.highlightsVideoUrl
                              }
                              preloadedChunks={
                                onboardingAssessment?.videoChunks
                              }
                            />
                          </div>
                        )}

                        {/* Strengths and Areas for Improvement from Video Analysis */}
                        {onboardingAssessment?.videoAnalysis && (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Strengths from Video Analysis */}
                            {onboardingAssessment.videoAnalysis.strengths &&
                              onboardingAssessment.videoAnalysis.strengths
                                .length > 0 && (
                                <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                                  <div className="mb-3 flex items-center justify-between">
                                    <h4 className="text-sm font-semibold dark:text-white">
                                      Video Analysis Strengths
                                    </h4>
                                  </div>
                                  <div className="space-y-2">
                                    {onboardingAssessment.videoAnalysis.strengths.map(
                                      (strength, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20"
                                        >
                                          <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-500" />
                                          <span className="text-xs text-gray-900 dark:text-white">
                                            {strength}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Areas for Improvement from Video Analysis */}
                            {onboardingAssessment.videoAnalysis
                              .areasForImprovement &&
                              onboardingAssessment.videoAnalysis
                                .areasForImprovement.length > 0 && (
                                <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                                  <div className="mb-3 flex items-center justify-between">
                                    <h4 className="text-sm font-semibold dark:text-white">
                                      Video Analysis Areas for Improvement
                                    </h4>
                                  </div>
                                  <div className="space-y-2">
                                    {onboardingAssessment.videoAnalysis.areasForImprovement.map(
                                      (area, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-2 dark:border-orange-800 dark:bg-orange-900/20"
                                        >
                                          <AlertTriangle className="h-3 w-3 flex-shrink-0 text-orange-500" />
                                          <span className="text-xs text-gray-900 dark:text-white">
                                            {area}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
      {/* Job AI Assessment - Collapsible */}
      {jobAssessmentDetails && (
        <Card className="bg-card shadow-none hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader
            className="cursor-pointer rounded-xl pb-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            onClick={() => setIsJobAiExpanded(!isJobAiExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  variants={chevronVariants}
                  animate={isJobAiExpanded ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' as const }}
                >
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                </motion.div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <Target className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                  Job AI Assessment
                  <AIPoweredLogo />
                </CardTitle>
              </div>

              <RecommendationBadge
                recommendation={jobAssessmentDetails?.recommendation}
              />
            </div>
            <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {jobAssessmentDetails?.overallFeedback && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {jobAssessmentDetails.overallFeedback}
                </p>
              )}
            </CardDescription>
          </CardHeader>

          {/* Collapsible Content for Job AI Assessment */}
          <AnimatePresence>
            {isJobAiExpanded && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={collapsibleVariants}
                className="overflow-hidden"
              >
                <>
                  {/* Tabs */}
                  <div className="mx-6 mb-2">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setJobAiActiveTab('overview')}
                        className={cn(
                          'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                          jobAiActiveTab === 'overview'
                            ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                        )}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setJobAiActiveTab('sections')}
                        className={cn(
                          'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                          jobAiActiveTab === 'sections'
                            ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                        )}
                      >
                        Assessment Sections
                      </button>
                      {jobAssessmentDetails?.id && (
                        <button
                          onClick={() => setJobAiActiveTab('video')}
                          className={cn(
                            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                            jobAiActiveTab === 'video'
                              ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                          )}
                        >
                          Video Analysis
                        </button>
                      )}
                    </div>
                  </div>

                  <CardContent>
                    {/* Tab Content for Job AI Assessment */}
                    {jobAiActiveTab === 'overview' && (
                      <div className="mb-2">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Strengths */}
                          <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                            <h3 className="mb-3 text-base font-medium dark:text-white">
                              Strengths
                            </h3>
                            <StrengthsCard
                              className="grid grid-cols-1 gap-2 md:grid-cols-1"
                              values={jobAssessmentDetails?.strengths}
                            />
                          </div>

                          {/* Areas for Improvement */}
                          <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                            <h3 className="mb-3 text-base font-medium dark:text-white">
                              Areas for Improvement
                            </h3>
                            <AreasOfImprovementsCard
                              className="grid grid-cols-1 gap-2 md:grid-cols-1"
                              values={jobAssessmentDetails?.areasForImprovement}
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
                                {jobAssessmentDetails?.technicalSkills?.length >
                                0 ? (
                                  <CommonTags
                                    values={
                                      jobAssessmentDetails?.technicalSkills
                                    }
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
                                {jobAssessmentDetails?.softSkills?.length >
                                0 ? (
                                  <CommonTags
                                    values={jobAssessmentDetails?.softSkills}
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
                                {jobAssessmentDetails?.industriesFit?.length >
                                0 ? (
                                  <CommonTags
                                    values={jobAssessmentDetails?.industriesFit}
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
                                {jobAssessmentDetails?.jobRolesFit?.length >
                                0 ? (
                                  <CommonTags
                                    values={jobAssessmentDetails?.jobRolesFit}
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

                    {jobAiActiveTab === 'sections' && (
                      <div className="space-y-6">
                        {jobAssessmentDetails?.sections?.map(
                          (section, index) => (
                            <div
                              key={index}
                              className="bg-background rounded-lg border border-gray-100 p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {formatEnumValue(section.title)}
                                </h3>
                              </div>

                              <p className="border-primary/30 mb-4 border-l-2 pl-3 text-sm text-gray-700 italic dark:text-gray-300">
                                {section.description}
                              </p>

                              {section.questions &&
                                section.questions.length > 0 && (
                                  <div className="mt-4">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                                      <span className="bg-primary h-1 w-1 rounded-full"></span>
                                      Questions
                                      <span className="bg-primary h-1 w-1 rounded-full"></span>
                                    </h4>
                                    <ul className="space-y-4 text-sm">
                                      {section.questions.map(
                                        (question, qIndex) => (
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
                                                    question.answerGiven
                                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                  )}
                                                >
                                                  {question.answerGiven
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
                                                  {question.answerGiven ||
                                                    'No answer given'}
                                                </p>
                                              </div>
                                            )}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {jobAiActiveTab === 'video' && (
                      <div className="space-y-4">
                        {/* Video Chunks Player - Smaller size */}
                        {jobAssessmentDetails?.id && (
                          <div className="mx-auto max-w-2xl">
                            <JobAiAssessmentVideoChunksPlayer
                              assessmentId={jobAssessmentDetails.id}
                              service={clientCandidateApiService}
                              className="bg-background rounded-lg p-4"
                              videoUrl={
                                jobAssessmentDetails?.videoAnalysis?.videoUrl
                              }
                              highlightsVideoUrl={
                                jobAssessmentDetails?.videoAnalysis
                                  ?.highlightsVideoUrl
                              }
                            />
                          </div>
                        )}

                        {/* Strengths and Areas for Improvement from Video Analysis */}
                        {jobAssessmentDetails?.videoAnalysis && (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Strengths from Video Analysis */}
                            {jobAssessmentDetails.videoAnalysis.strengths &&
                              jobAssessmentDetails.videoAnalysis.strengths
                                .length > 0 && (
                                <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                                  <div className="mb-3 flex items-center justify-between">
                                    <h4 className="text-sm font-semibold dark:text-white">
                                      Video Analysis Strengths
                                    </h4>
                                  </div>
                                  <div className="space-y-2">
                                    {jobAssessmentDetails.videoAnalysis.strengths.map(
                                      (strength, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20"
                                        >
                                          <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-500" />
                                          <span className="text-xs text-gray-900 dark:text-white">
                                            {strength}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Areas for Improvement from Video Analysis */}
                            {jobAssessmentDetails.videoAnalysis
                              .areasForImprovement &&
                              jobAssessmentDetails.videoAnalysis
                                .areasForImprovement.length > 0 && (
                                <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                                  <div className="mb-3 flex items-center justify-between">
                                    <h4 className="text-sm font-semibold dark:text-white">
                                      Video Analysis Areas for Improvement
                                    </h4>
                                  </div>
                                  <div className="space-y-2">
                                    {jobAssessmentDetails.videoAnalysis.areasForImprovement.map(
                                      (area, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-2 dark:border-orange-800 dark:bg-orange-900/20"
                                        >
                                          <AlertTriangle className="h-3 w-3 flex-shrink-0 text-orange-500" />
                                          <span className="text-xs text-gray-900 dark:text-white">
                                            {area}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Job Assessment (Legacy) - Only show if jobAssessmentDetails is not available */}
      {clientJobApplicationAiAssessment && !jobAssessmentDetails && (
        <Card
          key={clientJobApplicationAiAssessment.id}
          className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <Target className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
                  Job Assessment
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Score: {formatScore(clientJobApplicationAiAssessment.score)}%
                  • Duration:{' '}
                  {clientJobApplicationAiAssessment.duration
                    ? Math.round(clientJobApplicationAiAssessment.duration / 60)
                    : 0}{' '}
                  min • Result:{' '}
                  {formatEnumValue(
                    clientJobApplicationAiAssessment.result || ''
                  )}
                </CardDescription>
              </div>
              <RecommendationBadge
                recommendation={clientJobApplicationAiAssessment.recommendation}
              />
            </div>
          </CardHeader>

          {/* Tabs for Job Assessment */}
          <div className="mx-6 mb-2">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setJobActiveTab('overview')}
                className={cn(
                  'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  jobActiveTab === 'overview'
                    ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setJobActiveTab('sections')}
                className={cn(
                  'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  jobActiveTab === 'sections'
                    ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                )}
              >
                Assessment Sections
              </button>
              {clientJobApplicationAiAssessment?.videoAnalysis?.videoUrl && (
                <button
                  onClick={() => setJobActiveTab('video')}
                  className={cn(
                    'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                    jobActiveTab === 'video'
                      ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                  )}
                >
                  Video Analysis
                </button>
              )}
            </div>
          </div>

          <CardContent>
            {/* Tab Content for Job Assessment */}
            {jobActiveTab === 'overview' && (
              <div className="mb-2">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Strengths */}
                  <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                    <h3 className="mb-3 text-base font-medium dark:text-white">
                      Strengths
                    </h3>
                    <StrengthsCard
                      className="grid grid-cols-1 gap-2 md:grid-cols-1"
                      values={clientJobApplicationAiAssessment?.strengths}
                    />
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                    <h3 className="mb-3 text-base font-medium dark:text-white">
                      Areas for Improvement
                    </h3>
                    <AreasOfImprovementsCard
                      className="grid grid-cols-1 gap-2 md:grid-cols-1"
                      values={
                        clientJobApplicationAiAssessment?.areasForImprovement
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {jobActiveTab === 'sections' && (
              <div className="space-y-6">
                {clientJobApplicationAiAssessment?.sections?.map(
                  (section, index) => (
                    <div
                      key={index}
                      className="bg-background rounded-lg border border-gray-100 p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatEnumValue(section.title)}
                        </h3>
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
                                        question.answerGiven
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                      )}
                                    >
                                      {question.answerGiven
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
                                      {question.answerGiven ||
                                        'No answer given'}
                                    </p>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {jobActiveTab === 'video' &&
              clientJobApplicationAiAssessment?.videoAnalysis && (
                <div className="space-y-4">
                  <div className="bg-background rounded-lg p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <Video className="h-5 w-5" />
                        Video Analysis
                      </h3>

                      {/* Video Toggle */}
                      {clientJobApplicationAiAssessment.videoAnalysis
                        .highlightsVideoUrl &&
                        clientJobApplicationAiAssessment.videoAnalysis
                          .videoUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {isJobAiFullVideo ? 'Full Video' : 'Highlights'}
                            </span>
                            <Switch
                              checked={isJobAiFullVideo}
                              onCheckedChange={setIsJobAiFullVideo}
                            />
                          </div>
                        )}
                    </div>

                    {/* Video Player */}
                    {((clientJobApplicationAiAssessment.videoAnalysis
                      .highlightsVideoUrl &&
                      !isJobAiFullVideo) ||
                      (clientJobApplicationAiAssessment.videoAnalysis
                        .videoUrl &&
                        isJobAiFullVideo)) && (
                      <div className="mx-auto max-w-2xl">
                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                          <video
                            src={
                              isJobAiFullVideo
                                ? clientJobApplicationAiAssessment.videoAnalysis
                                    .videoUrl
                                : clientJobApplicationAiAssessment.videoAnalysis
                                    .highlightsVideoUrl
                            }
                            controls
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Analysis Summary */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Strengths from Video Analysis */}
                    {clientJobApplicationAiAssessment.videoAnalysis.strengths &&
                      clientJobApplicationAiAssessment.videoAnalysis.strengths
                        .length > 0 && (
                        <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold dark:text-white">
                              Video Analysis Strengths
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {clientJobApplicationAiAssessment.videoAnalysis.strengths.map(
                              (strength, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20"
                                >
                                  <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-500" />
                                  <span className="text-xs text-gray-900 dark:text-white">
                                    {strength}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Areas for Improvement from Video Analysis */}
                    {clientJobApplicationAiAssessment.videoAnalysis
                      .areasForImprovement &&
                      clientJobApplicationAiAssessment.videoAnalysis
                        .areasForImprovement.length > 0 && (
                        <div className="bg-background rounded-lg border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold dark:text-white">
                              Video Analysis Areas for Improvement
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {clientJobApplicationAiAssessment.videoAnalysis.areasForImprovement.map(
                              (area, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-2 dark:border-orange-800 dark:bg-orange-900/20"
                                >
                                  <AlertTriangle className="h-3 w-3 flex-shrink-0 text-orange-500" />
                                  <span className="text-xs text-gray-900 dark:text-white">
                                    {area}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Transcript */}
                    {clientJobApplicationAiAssessment.videoAnalysis
                      .transcriptText && (
                      <div className="bg-background rounded-lg border border-gray-100 p-4 md:col-span-2 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-semibold dark:text-white">
                            Transcript
                          </h4>
                        </div>
                        <p className="max-h-32 overflow-y-auto text-sm text-gray-700 dark:text-gray-300">
                          {
                            clientJobApplicationAiAssessment.videoAnalysis
                              .transcriptText
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
