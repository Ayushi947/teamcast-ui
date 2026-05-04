'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Award,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Sparkles,
  Target,
  ThumbsUp,
  Building2,
  UserCog,
  AlertCircle,
  ThumbsDown,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import {
  ICandidateOnboardingAssessment,
  OnboardingAssessmentRecommendationEnum,
  OnboardingAssessmentSectionResultEnum,
} from '@/lib/shared';
import { cn, enumToReadableText } from '@/lib/utils';
import React from 'react';

interface OnboardingAssessmentProps {
  assessment: ICandidateOnboardingAssessment;
}

export function OnboardingAssessment({
  assessment,
}: OnboardingAssessmentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getRecommendationStyles = (
    recommendation?: OnboardingAssessmentRecommendationEnum
  ) => {
    switch (recommendation) {
      case OnboardingAssessmentRecommendationEnum.HIGHLY_RECOMMENDED:
        return {
          color:
            'text-primary bg-primary/10 dark:text-primary dark:bg-primary/20',
          text: 'Highly Recommended',
          icon: ThumbsUp,
          bgColor: 'bg-primary/10 dark:bg-primary/20',
          textColor: 'text-primary dark:text-primary/90',
          borderColor: 'border-primary/20',
        };
      case OnboardingAssessmentRecommendationEnum.RECOMMENDED:
        return {
          color:
            'text-primary bg-primary/10 dark:text-primary dark:bg-primary/20',
          text: 'Recommended',
          icon: ThumbsUp,
          bgColor: 'bg-primary/10 dark:bg-primary/20',
          textColor: 'text-primary dark:text-primary/90',
          borderColor: 'border-primary/20',
        };
      case OnboardingAssessmentRecommendationEnum.NOT_RECOMMENDED:
        return {
          color:
            'text-destructive bg-destructive/10 dark:text-destructive dark:bg-destructive/20',
          text: 'Not Recommended',
          icon: ThumbsDown,
          bgColor: 'bg-destructive/10 dark:bg-destructive/20',
          textColor: 'text-destructive dark:text-destructive/90',
          borderColor: 'border-destructive/20',
        };
      default:
        return {
          color:
            'text-muted-foreground bg-muted dark:text-muted-foreground dark:bg-muted/50',
          text: 'No Recommendation',
          icon: AlertCircle,
          bgColor: 'bg-muted dark:bg-muted/50',
          textColor: 'text-muted-foreground dark:text-muted-foreground',
          borderColor: 'border-muted',
        };
    }
  };

  const styles = getRecommendationStyles(assessment.recommendation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-border bg-card-secondary overflow-hidden rounded-xl border shadow-sm"
    >
      {/* Header with Score and Recommendation */}
      <div className="dark:border-border/50 border-b p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2', styles.bgColor)}>
              <Award className={cn('h-5 w-5', styles.textColor)} />
            </div>
            <h3 className="text-foreground text-xl font-semibold">
              Screening Assessment
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Recommendation Badge */}
            {assessment.recommendation && (
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2',
                  styles.color
                )}
              >
                {React.createElement(styles.icon, {
                  className: 'h-4 w-4',
                })}
                <span className="text-sm font-medium">{styles.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overall Feedback */}
        {assessment.overallFeedback && (
          <div className={cn('rounded-lg p-8', styles.bgColor)}>
            <h4 className={cn('mb-2 text-lg font-semibold', styles.textColor)}>
              Overall Feedback
            </h4>
            <p className="text-muted-foreground text-md pt-4 leading-relaxed">
              {assessment.overallFeedback}
            </p>
          </div>
        )}
      </div>

      {/* Expandable Content */}
      <div className="border-t">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:bg-muted flex w-full items-center justify-between px-6 py-4 transition-colors"
        >
          <span className="text-muted-foreground text-sm font-medium">
            View Detailed Analysis
          </span>
          {isExpanded ? (
            <ChevronUp className="text-muted-foreground h-5 w-5" />
          ) : (
            <ChevronDown className="text-muted-foreground h-5 w-5" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-6 p-6">
                {/* Key Recommendations - Always Visible */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {assessment.strengths?.length > 0 ? (
                    <div className={cn('rounded-lg p-4', 'bg-primary/10')}>
                      <h4
                        className={cn(
                          'mb-2 flex items-center gap-2 text-lg font-semibold',
                          'text-primary'
                        )}
                      >
                        <Sparkles className="h-4 w-4" />
                        Key Strengths
                      </h4>
                      <ul className="space-y-2 pt-4">
                        {assessment.strengths.map(
                          (strength: string, index: number) => (
                            <li
                              key={index}
                              className={cn(
                                'flex items-start gap-2 text-sm',
                                'text-primary'
                              )}
                            >
                              <CheckCircle2
                                className={cn(
                                  'mt-0.5 h-4 w-4 flex-shrink-0',
                                  'text-primary'
                                )}
                              />
                              <span>{strength}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-muted dark:bg-muted/50 rounded-lg p-4">
                      <h4 className="text-foreground mb-2 flex items-center gap-2 text-lg font-semibold">
                        <Sparkles className="h-4 w-4" />
                        Key Strengths
                      </h4>
                      <p className="text-muted-foreground pt-4 text-sm">
                        No strengths data available
                      </p>
                    </div>
                  )}

                  {assessment.areasForImprovement?.length > 0 ? (
                    <div className={cn('rounded-lg p-4', 'bg-destructive/10')}>
                      <h4
                        className={cn(
                          'mb-2 flex items-center gap-2 text-lg font-semibold',
                          'text-destructive'
                        )}
                      >
                        <Target className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2 pt-4">
                        {assessment.areasForImprovement.map(
                          (area: string, index: number) => (
                            <li
                              key={index}
                              className={cn(
                                'flex items-start gap-2 text-sm',
                                'text-destructive'
                              )}
                            >
                              <XCircle
                                className={cn(
                                  'mt-0.5 h-4 w-4 flex-shrink-0',
                                  'text-destructive'
                                )}
                              />
                              <span>{area}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-muted dark:bg-muted/50 rounded-lg p-4">
                      <h4 className="text-foreground mb-2 flex items-center gap-2 text-lg font-semibold">
                        <Target className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <p className="text-muted-foreground pt-4 text-sm">
                        No improvement areas data available
                      </p>
                    </div>
                  )}
                </div>
                {/* Skills Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                      <Briefcase className="text-primary dark:text-primary/90 h-4 w-4" />
                      Technical Skills
                    </h4>
                    {assessment.technicalSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {assessment.technicalSkills.map(
                          (skill: string, index: number) => (
                            <span
                              key={index}
                              className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90 rounded-full px-3 py-1 text-sm font-medium"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground pt-4 text-sm">
                        No technical skills data available
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                      <GraduationCap className="text-primary dark:text-primary/90 h-4 w-4" />
                      Soft Skills
                    </h4>
                    {assessment.softSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {assessment.softSkills.map(
                          (skill: string, index: number) => (
                            <span
                              key={index}
                              className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90 rounded-full px-3 py-1 text-sm font-medium"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground pt-4 text-sm">
                        No soft skills data available
                      </p>
                    )}
                  </div>
                </div>

                {/* Industry & Role Fit */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                      <Building2 className="text-primary dark:text-primary/90 h-4 w-4" />
                      Industry Fit
                    </h4>
                    {assessment.industriesFit?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {assessment.industriesFit.map(
                          (industry: string, index: number) => (
                            <span
                              key={index}
                              className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90 rounded-full px-3 py-1 text-sm font-medium"
                            >
                              {industry}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground pt-4 text-sm">
                        No industry fit data available
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                      <UserCog className="text-primary dark:text-primary/90 h-4 w-4" />
                      Role Fit
                    </h4>
                    {assessment.jobRolesFit?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {assessment.jobRolesFit.map(
                          (role: string, index: number) => (
                            <span
                              key={index}
                              className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90 rounded-full px-3 py-1 text-sm font-medium"
                            >
                              {role}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground pt-4 text-sm">
                        No role fit data available
                      </p>
                    )}
                  </div>
                </div>

                {/* Video Analysis Section */}
                {assessment.videoAnalysis && (
                  <div className="space-y-6">
                    <h4 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                      <Video className="text-primary dark:text-primary/90 h-4 w-4" />
                      Video Analysis
                    </h4>

                    {/* Overall Feedback */}
                    {assessment.videoAnalysis.overallFeedback && (
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h5 className="text-primary mb-2 text-sm font-medium">
                          Overall Feedback
                        </h5>
                        <p className="text-primary text-sm">
                          {assessment.videoAnalysis.overallFeedback}
                        </p>
                      </div>
                    )}

                    {/* Video Analysis Grid Layout */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {/* Left Column - Content Sections */}
                      <div className="space-y-6 md:col-span-2">
                        {/* Scores Row */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          {assessment.videoAnalysis.engagementScore !==
                            undefined && (
                            <div className="bg-primary/10 rounded-lg p-4">
                              <h5 className="text-primary text-sm font-medium">
                                Engagement Score
                              </h5>
                              <p className="text-primary mt-2 text-2xl font-bold">
                                {assessment.videoAnalysis.engagementScore}%
                              </p>
                            </div>
                          )}
                          {assessment.videoAnalysis.confidenceScore !==
                            undefined && (
                            <div className="bg-primary/10 rounded-lg p-4">
                              <h5 className="text-primary text-sm font-medium">
                                Confidence Score
                              </h5>
                              <p className="text-primary mt-2 text-2xl font-bold">
                                {assessment.videoAnalysis.confidenceScore}%
                              </p>
                            </div>
                          )}
                          {assessment.videoAnalysis.clarityScore !==
                            undefined && (
                            <div className="bg-primary/10 rounded-lg p-4">
                              <h5 className="text-primary text-sm font-medium">
                                Clarity Score
                              </h5>
                              <p className="text-primary mt-2 text-2xl font-bold">
                                {assessment.videoAnalysis.clarityScore}%
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Strengths and Areas for Improvement Row */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {assessment.videoAnalysis.strengths &&
                            assessment.videoAnalysis.strengths.length > 0 && (
                              <div className="bg-primary/10 rounded-lg p-4">
                                <h5 className="text-primary mb-2 text-sm font-medium">
                                  Key Strengths
                                </h5>
                                <ul className="space-y-2">
                                  {assessment.videoAnalysis.strengths.map(
                                    (strength, index) => (
                                      <li
                                        key={index}
                                        className="text-primary flex items-start gap-2 text-sm"
                                      >
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>{strength}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          {assessment.videoAnalysis.areasForImprovement &&
                            assessment.videoAnalysis.areasForImprovement
                              .length > 0 && (
                              <div className="bg-destructive/10 rounded-lg p-4">
                                <h5 className="text-destructive mb-2 text-sm font-medium">
                                  Areas for Improvement
                                </h5>
                                <ul className="space-y-2">
                                  {assessment.videoAnalysis.areasForImprovement.map(
                                    (area, index) => (
                                      <li
                                        key={index}
                                        className="text-destructive flex items-start gap-2 text-sm"
                                      >
                                        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>{area}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>

                        {/* Professional Demeanor and Communication Row */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {assessment.videoAnalysis
                            .professionalDemeanorScore && (
                            <div className="bg-primary/10 rounded-lg p-4">
                              <h5 className="text-primary mb-2 text-sm font-medium">
                                Professional Demeanor
                              </h5>
                              <p className="text-primary text-sm">
                                {
                                  assessment.videoAnalysis
                                    .professionalDemeanorScore
                                }
                              </p>
                            </div>
                          )}
                          {assessment.videoAnalysis.clarityScore && (
                            <div className="bg-primary/10 rounded-lg p-4">
                              <h5 className="text-primary mb-2 text-sm font-medium">
                                Communication Clarity
                              </h5>
                              <p className="text-primary text-sm">
                                {assessment.videoAnalysis.clarityScore}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column - Video */}
                      <div className="space-y-4">
                        <h5 className="text-foreground text-sm font-medium">
                          Assessment Video
                        </h5>

                        {assessment.videoAnalysis.videoUrl && (
                          <video
                            src={assessment.videoAnalysis.videoUrl}
                            controls
                            className="w-full rounded-lg"
                          >
                            <track
                              kind="captions"
                              srcLang="en"
                              label="English captions"
                            />
                          </video>
                        )}
                        {assessment.videoAnalysis.highlightsVideoUrl && (
                          <video
                            src={assessment.videoAnalysis.highlightsVideoUrl}
                            controls
                            className="w-full rounded-lg"
                          >
                            <track
                              kind="captions"
                              srcLang="en"
                              label="English captions"
                            />
                          </video>
                        )}
                      </div>
                    </div>

                    {/* Proctoring Feedback */}
                    {assessment.videoAnalysis.proctoringFeedback && (
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <h5 className="text-destructive mb-2 text-sm font-medium">
                          Proctoring Feedback
                        </h5>
                        <p className="text-destructive text-sm">
                          {assessment.videoAnalysis.proctoringFeedback}
                        </p>
                      </div>
                    )}

                    {/* Assessment Sections and Questions */}
                    <div className="space-y-8">
                      <h4 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                        <Briefcase className="text-primary dark:text-primary/90 h-4 w-4" />
                        Assessment Sections
                      </h4>

                      {assessment.sections.map((section) => (
                        <div
                          key={section.id}
                          className="overflow-hidden rounded-lg border"
                        >
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="hover:bg-muted/50 flex w-full items-start justify-between p-6 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex flex-col items-start gap-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                  <h5 className="text-foreground text-lg font-semibold">
                                    {section.title}
                                  </h5>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={cn(
                                        'rounded-full px-3 py-1 text-sm font-medium',
                                        section.result ===
                                          OnboardingAssessmentSectionResultEnum.PASSED
                                          ? 'bg-primary/10 text-primary'
                                          : section.result ===
                                                OnboardingAssessmentSectionResultEnum.FAILED_AI_REVIEW ||
                                              section.result ===
                                                OnboardingAssessmentSectionResultEnum.FAILED_MANUAL_REVIEW
                                            ? 'bg-destructive/10 text-destructive'
                                            : 'bg-muted text-muted-foreground'
                                      )}
                                    >
                                      {enumToReadableText(section.result)}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                      Score: {section.score}%
                                    </span>
                                  </div>
                                </div>
                                <div className="text-muted-foreground text-left text-sm">
                                  {section.description}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              {expandedSections[section.id] ? (
                                <ChevronUp className="text-muted-foreground h-5 w-5" />
                              ) : (
                                <ChevronDown className="text-muted-foreground h-5 w-5" />
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedSections[section.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.3,
                                  ease: 'easeInOut',
                                }}
                                className="overflow-hidden"
                              >
                                <motion.div
                                  initial={{ y: -20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: -20, opacity: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: 0.1,
                                    ease: 'easeOut',
                                  }}
                                  className="space-y-4 p-6 pt-0"
                                >
                                  {section.questions.map((question) => (
                                    <div
                                      key={question.id}
                                      className="bg-muted/50 mt-4 space-y-2 rounded-lg p-4"
                                    >
                                      <div className="flex items-start gap-2">
                                        <span className="text-muted-foreground text-sm">
                                          Q{question.order + 1}:
                                        </span>
                                        <div className="flex-1">
                                          <h6 className="text-foreground font-medium">
                                            {question.question}
                                          </h6>
                                          {question.options && (
                                            <ul className="mt-2 space-y-2">
                                              {Object.entries(
                                                question.options as Record<
                                                  string,
                                                  string
                                                >
                                              ).map(([key, value]) => (
                                                <li
                                                  key={key}
                                                  className="text-muted-foreground flex items-center gap-2"
                                                >
                                                  <span className="text-sm">
                                                    {key}. {value}
                                                  </span>
                                                </li>
                                              ))}
                                            </ul>
                                          )}

                                          {question.answerGiven && (
                                            <div className="mt-2 space-y-2">
                                              <div className="bg-background rounded-lg p-3">
                                                <p className="text-sm font-medium">
                                                  Answer: {question.answerGiven}
                                                </p>
                                              </div>
                                              {question.feedback && (
                                                <div className="bg-primary/10 rounded-lg p-3">
                                                  <p className="text-primary text-sm font-medium">
                                                    Feedback:
                                                  </p>
                                                  <p className="text-primary mt-1 text-sm">
                                                    {question.feedback}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
