'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Award,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  Building2,
  UserCog,
  AlertCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
  IResumeAssessment,
  ResumeAssessmentRecommendationEnum,
} from '@/lib/shared';
import { cn } from '@/lib/utils';
import React from 'react';

interface ResumeAssessmentProps {
  assessment: IResumeAssessment;
}

export function ResumeAssessment({ assessment }: ResumeAssessmentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRecommendationStyles = (
    recommendation?: ResumeAssessmentRecommendationEnum
  ) => {
    switch (recommendation) {
      case ResumeAssessmentRecommendationEnum.HIGHLY_RECOMMENDED:
        return {
          color: 'text-primary bg-primary/10',
          text: 'Highly Recommended',
          icon: ThumbsUp,
          bgColor: 'bg-primary/10',
          textColor: 'text-primary',
          borderColor: 'border-primary/20',
        };
      case ResumeAssessmentRecommendationEnum.RECOMMENDED:
        return {
          color: 'text-primary bg-primary/10',
          text: 'Recommended',
          icon: ThumbsUp,
          bgColor: 'bg-primary/10',
          textColor: 'text-primary',
          borderColor: 'border-primary/20',
        };
      case ResumeAssessmentRecommendationEnum.NOT_RECOMMENDED:
        return {
          color: 'text-destructive bg-destructive/10',
          text: 'Not Recommended',
          icon: XCircle,
          bgColor: 'bg-destructive/10',
          textColor: 'text-destructive',
          borderColor: 'border-destructive/20',
        };
      default:
        return {
          color: 'text-muted-foreground bg-muted',
          text: 'No Recommendation',
          icon: AlertCircle,
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
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
      <div className="border-border border-b p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2', styles.bgColor)}>
              <Award className={cn('h-5 w-5', styles.textColor)} />
            </div>
            <h3 className="text-foreground text-xl font-semibold">
              Resume Assessment
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
      <div className="border-border border-t">
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
                    <div className="bg-muted rounded-lg p-4">
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
                        <AlertCircle className="h-4 w-4" />
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
                              <AlertTriangle
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
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="text-foreground mb-2 flex items-center gap-2 text-lg font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <p className="text-muted-foreground pt-4 text-sm">
                        No improvement areas identified
                      </p>
                    </div>
                  )}
                </div>

                {/* Skills Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                      <Briefcase className="text-primary h-4 w-4" />
                      Technical Skills
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Core technical competencies and specialized expertise
                      identified from your experience
                    </p>
                    {assessment.technicalSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {assessment.technicalSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground pt-4 text-sm">
                        No technical skills data available
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                      <GraduationCap className="text-primary h-4 w-4" />
                      Soft Skills
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Interpersonal abilities and professional attributes that
                      enhance your workplace effectiveness
                    </p>
                    {assessment.softSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {assessment.softSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
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
                      <Building2 className="text-primary h-4 w-4" />
                      Industry Fit
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Industries where your skills and experience align best
                      with current market demands
                    </p>
                    {assessment.industriesFit?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {assessment.industriesFit.map((industry, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground pt-4 text-sm">
                        No industry fit data available
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                      <UserCog className="text-primary h-4 w-4" />
                      Role Fit
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Job roles that match your qualifications and career
                      progression potential
                    </p>
                    {assessment.jobRolesFit?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {assessment.jobRolesFit.map((role, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground pt-4 text-sm">
                        No role fit data available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ResumeAssessment;
