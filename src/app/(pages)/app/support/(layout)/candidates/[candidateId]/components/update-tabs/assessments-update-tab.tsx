'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Target, Brain, FileText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ResumeAssessmentStatusEnum,
  ResumeAssessmentResultEnum,
  ResumeAssessmentRecommendationEnum,
  OnboardingAssessmentStatusEnum,
  OnboardingAssessmentResultEnum,
  JobAiAssessmentStatusEnum,
  JobAiAssessmentResultEnum,
  JobAiAssessmentRecommendationEnum,
  OnboardingAssessmentRecommendationEnum,
} from '@/lib/shared/models/common/enums';
import { formatEnumValue } from '@/lib/utils';

// Utility function to validate and clamp score values between 0 and 1
const validateScore = (value: string | number): number => {
  const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }
  if (parsedValue > 1) {
    return 1;
  }
  return parsedValue;
};

interface AssessmentsUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

export function AssessmentsUpdateTab({
  form,
  isSubmitting,
}: AssessmentsUpdateTabProps) {
  const resumeAssessments = form.watch('resumeAssessments') || [];
  const onboardingAssessments = form.watch('onboardingAssessments') || [];
  const jobAiAssessments = form.watch('jobAiAssessments') || [];

  return (
    <div className="space-y-6">
      {/* Resume Assessments */}
      {resumeAssessments.length > 0 && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#6e55cf]/10 p-2 dark:bg-purple-900/30">
                <FileText className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resume Assessments
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Edit resume assessment results and feedback
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {resumeAssessments.map((_assessment: any, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
                      <Badge
                        variant="secondary"
                        className="bg-[#6e55cf]/10 text-[#6e55cf] dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        Resume Assessment #{index + 1}
                      </Badge>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`resumeAssessments.${index}.status`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Status
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(ResumeAssessmentStatusEnum).map(
                                (status) => (
                                  <SelectItem key={status} value={status}>
                                    {formatEnumValue(status)}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resumeAssessments.${index}.result`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Result
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select result" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(ResumeAssessmentResultEnum).map(
                                (result) => (
                                  <SelectItem key={result} value={result}>
                                    {formatEnumValue(result)}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resumeAssessments.${index}.score`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Score (0-1)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              disabled={isSubmitting}
                              onChange={(e) => {
                                const validatedValue = validateScore(
                                  e.target.value
                                );
                                field.onChange(validatedValue);
                              }}
                              onBlur={(e) => {
                                const validatedValue = validateScore(
                                  e.target.value
                                );
                                field.onChange(validatedValue);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resumeAssessments.${index}.recommendation`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2 lg:col-span-3">
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Recommendation
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recommendation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(
                                ResumeAssessmentRecommendationEnum
                              ).map((recommendation) => (
                                <SelectItem
                                  key={recommendation}
                                  value={recommendation}
                                >
                                  {formatEnumValue(recommendation)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name={`resumeAssessments.${index}.overallFeedback`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Overall Feedback
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              disabled={isSubmitting}
                              placeholder="Provide overall assessment feedback..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`resumeAssessments.${index}.strengths`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Strengths
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                disabled={isSubmitting}
                                placeholder="Enter strengths separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const strengths = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(strengths);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`resumeAssessments.${index}.areasForImprovement`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Areas for Improvement
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                disabled={isSubmitting}
                                placeholder="Enter areas for improvement separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const areas = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(areas);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`resumeAssessments.${index}.technicalSkills`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Technical Skills
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter technical skills separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const skills = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(skills);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`resumeAssessments.${index}.softSkills`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Soft Skills
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter soft skills separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const skills = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(skills);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Assessments */}
      {onboardingAssessments.length > 0 && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#6e55cf]/10 p-2 dark:bg-purple-900/30">
                <Target className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Onboarding Assessments
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Edit onboarding assessment results and sections
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {onboardingAssessments.map((_assessment: any, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
                      <Badge
                        variant="secondary"
                        className="bg-[#6e55cf]/10 text-[#6e55cf] dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        Screening Assessment #{index + 1}
                      </Badge>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name={`onboardingAssessments.${index}.status`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Status
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(
                                OnboardingAssessmentStatusEnum
                              ).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {formatEnumValue(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`onboardingAssessments.${index}.result`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Result
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select result" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(
                                OnboardingAssessmentResultEnum
                              ).map((result) => (
                                <SelectItem key={result} value={result}>
                                  {formatEnumValue(result)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`onboardingAssessments.${index}.score`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Score (0-1)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              disabled={isSubmitting}
                              onChange={(e) => {
                                const validatedValue = validateScore(
                                  e.target.value
                                );
                                field.onChange(validatedValue);
                              }}
                              onBlur={(e) => {
                                const validatedValue = validateScore(
                                  e.target.value
                                );
                                field.onChange(validatedValue);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`onboardingAssessments.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Duration (Seconds)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              disabled={isSubmitting}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`onboardingAssessments.${index}.recommendation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Recommendation
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recommendation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(
                                OnboardingAssessmentRecommendationEnum
                              ).map((recommendation) => (
                                <SelectItem
                                  key={recommendation}
                                  value={recommendation}
                                >
                                  {formatEnumValue(recommendation)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name={`onboardingAssessments.${index}.overallFeedback`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Overall Feedback
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              disabled={isSubmitting}
                              placeholder="Provide overall assessment feedback..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`onboardingAssessments.${index}.strengths`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Strengths
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter strengths separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const strengths = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(strengths);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`onboardingAssessments.${index}.areasForImprovement`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Areas for Improvement
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter areas for improvement separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const areas = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(areas);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Onboarding Video Analysis - Strengths & Areas for Improvement */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`onboardingAssessments.${index}.videoAnalysis.strengths`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Video Analysis Strengths
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter video analysis strengths separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const strengths = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(strengths);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`onboardingAssessments.${index}.videoAnalysis.areasForImprovement`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Video Analysis Areas for Improvement
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter video analysis areas for improvement separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const areas = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(areas);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job AI Assessments */}
      {jobAiAssessments.length > 0 && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#6e55cf]/10 p-2 dark:bg-purple-900/30">
                <Brain className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Job AI Assessments
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Edit AI-powered job assessments and analysis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {jobAiAssessments.map((_assessment: any, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
                      <Badge
                        variant="secondary"
                        className="bg-[#6e55cf]/10 text-[#6e55cf] dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        Job AI Assessment #{index + 1}
                      </Badge>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name={`jobAiAssessments.${index}.status`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Status
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(JobAiAssessmentStatusEnum).map(
                                (status) => (
                                  <SelectItem key={status} value={status}>
                                    {formatEnumValue(status)}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`jobAiAssessments.${index}.result`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Result
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select result" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(JobAiAssessmentResultEnum).map(
                                (result) => (
                                  <SelectItem key={result} value={result}>
                                    {formatEnumValue(result)}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`jobAiAssessments.${index}.score`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Score (0-1)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              disabled={isSubmitting}
                              onChange={(e) => {
                                const validatedValue = validateScore(
                                  e.target.value
                                );
                                field.onChange(validatedValue);
                              }}
                              onBlur={(e) => {
                                const validatedValue = validateScore(
                                  e.target.value
                                );
                                field.onChange(validatedValue);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`jobAiAssessments.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Duration (Seconds)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              disabled={isSubmitting}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`jobAiAssessments.${index}.recommendation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Recommendation
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recommendation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(
                                JobAiAssessmentRecommendationEnum
                              ).map((recommendation) => (
                                <SelectItem
                                  key={recommendation}
                                  value={recommendation}
                                >
                                  {formatEnumValue(recommendation)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name={`jobAiAssessments.${index}.overallFeedback`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Overall Feedback
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              disabled={isSubmitting}
                              placeholder="Provide overall AI assessment feedback..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`jobAiAssessments.${index}.strengths`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Strengths
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter strengths separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const strengths = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(strengths);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`jobAiAssessments.${index}.areasForImprovement`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Areas for Improvement
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter areas for improvement separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const areas = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(areas);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Job AI Video Analysis - Strengths & Areas for Improvement */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`jobAiAssessments.${index}.videoAnalysis.strengths`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Video Analysis Strengths
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter video analysis strengths separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const strengths = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(strengths);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`jobAiAssessments.${index}.videoAnalysis.areasForImprovement`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Video Analysis Areas for Improvement
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                disabled={isSubmitting}
                                placeholder="Enter video analysis areas for improvement separated by commas"
                                value={
                                  Array.isArray(field.value)
                                    ? field.value.join(', ')
                                    : ''
                                }
                                onChange={(e) => {
                                  const areas = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  field.onChange(areas);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Assessments Message */}
      {resumeAssessments.length === 0 &&
        onboardingAssessments.length === 0 &&
        jobAiAssessments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
              <Brain className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No Assessments to Edit
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This candidate has not completed any assessments yet.
            </p>
          </div>
        )}
    </div>
  );
}
