'use client';

import React, { useCallback, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  User,
  Star,
  Clock,
  BookOpen,
  Eye,
  Loader2,
} from 'lucide-react';
import { ISupportCandidate } from '@/lib/shared';
import { format } from 'date-fns';
import { formatEnumValue } from '@/lib/utils';
import { CommonTags } from '@/components/ui/common-tags';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supportResumeViewService } from '@/lib/services/services';
import { SupportResumeViewDialog } from './support-resume-view-dialog';

interface ResumeTabProps {
  candidate: ISupportCandidate;
}

const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateRange = (
  startDate: string | Date,
  endDate?: string | Date
): string => {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Present';
  return `${start} - ${end}`;
};

export function ResumeTab({ candidate }: ResumeTabProps) {
  const resume = candidate.resume;
  const hasPositiveNumber = (value?: number | null): value is number =>
    typeof value === 'number' && !Number.isNaN(value) && value > 0;
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [resumeViewUrl, setResumeViewUrl] = useState<string | null>(null);

  const handleCloseResumeDialog = useCallback((open: boolean) => {
    setIsResumeDialogOpen(open);
    if (!open) {
      setResumeViewUrl(null);
    }
  }, []);

  const handleViewResume = useCallback(async () => {
    if (!candidate?.id) {
      toast.error('Candidate ID not found. Cannot view resume.');
      return;
    }

    setIsLoadingResume(true);

    try {
      const response = await supportResumeViewService.viewResume(candidate.id);
      const viewUrl = response?.result?.viewUrl;

      if (viewUrl) {
        setResumeViewUrl(viewUrl);
        setIsResumeDialogOpen(true);
        toast.success('Resume ready to view.');
      } else {
        toast.error('Resume view URL not available.');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load resume.';
      toast.error(errorMessage);
    } finally {
      setIsLoadingResume(false);
    }
  }, [candidate?.id]);

  if (!resume) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <FileText className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Resume Details
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Professional resume and experience information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No Resume Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                This candidate has not uploaded a resume yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resume Overview */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <FileText className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
            Resume Overview
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewResume}
            disabled={isLoadingResume}
            className="gap-2"
          >
            {isLoadingResume ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Resume
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                View Resume
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          {resume.summary && (
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-bold">
                Professional Summary
              </h4>
              <p className="bg-background rounded-md px-4 py-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {resume.summary}
              </p>
            </div>
          )}

          {/* Current Position */}
          {resume.currentJobTitle && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground text-sm font-semibold">
                    Current Position :
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {resume.currentJobTitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground text-sm font-semibold">
                    Location :
                  </span>
                </div>
                <p className="text-sm text-gray-900 dark:text-white">
                  {resume.currentWorkLocation || 'Not specified'}
                </p>
              </div>

              {hasPositiveNumber(resume.currentSalary) ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-muted-foreground text-sm font-semibold">
                      Current Salary :
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {resume.currentSalary.toLocaleString()}{' '}
                    {resume.currentSalaryCurrency}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-muted-foreground text-sm font-semibold">
                      Current Salary :
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Not specified
                  </p>
                </div>
              )}

              {hasPositiveNumber(resume.totalExperience) ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-muted-foreground text-sm font-semibold">
                      Total Experience :
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {resume.totalExperience} years
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-muted-foreground text-sm font-semibold">
                      Total Experience :
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Not specified
                  </p>
                </div>
              )}

              {resume.highestEducationLevel && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-muted-foreground text-sm font-semibold">
                      Education Level :
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatEnumValue(resume.highestEducationLevel)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills and Industries */}
      {((resume.skills && resume.skills.length > 0) ||
        (resume.industries && resume.industries.length > 0)) && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Star className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Skills & Industries
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Professional skills and industry expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resume.skills && resume.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  <CommonTags
                    values={resume?.skills}
                    maxVisible={8}
                    className="border-purple-200 text-purple-700 dark:border-blue-700 dark:text-purple-300"
                  />
                </div>
              </div>
            )}

            {resume.industries && resume.industries.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Industries
                </h4>
                <div className="flex flex-wrap gap-2">
                  <CommonTags
                    values={resume?.industries}
                    maxVisible={8}
                    className="border-green-200 text-green-700 dark:border-green-700 dark:text-green-300"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Work Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Briefcase className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Work Experience
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Professional work history and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {resume.experience.map((exp, index) => (
                <div
                  key={exp.id || index}
                  className="space-y-3 border-l-4 border-[#6e55cf] pl-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {exp.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Building className="h-4 w-4" />
                        <span>{exp.company}</span>
                      </div>
                    </div>
                    {exp.startDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDateRange(exp.startDate, exp.endDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {exp.description}
                    </p>
                  )}

                  {/* Projects */}
                  {exp.projects && exp.projects.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Key Projects
                      </h5>
                      <div className="space-y-2">
                        {exp.projects.map((project, projectIndex) => (
                          <div
                            key={project.id || projectIndex}
                            className="space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                          >
                            <div className="flex items-start justify-between">
                              <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                                {project.name}
                              </h6>
                              {project.startDate && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDateRange(
                                    project.startDate,
                                    project.endDate
                                  )}
                                </span>
                              )}
                            </div>
                            {project.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {project.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <GraduationCap className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Education
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Academic background and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resume.education.map((edu, index) => (
                <div
                  key={edu.id || index}
                  className="space-y-2 border-l-4 border-green-500 pl-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {edu.degree} in {edu.fieldOfStudy}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Building className="h-4 w-4" />
                        <span>{edu.institution}</span>
                      </div>
                    </div>
                    {edu.startDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Award className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Certifications
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Professional certifications and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resume.certifications.map((cert, index) => (
                <div
                  key={cert.id || index}
                  className="space-y-2 border-l-4 border-yellow-500 pl-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {cert.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4" />
                        <span>Issued by {cert.issuer}</span>
                      </div>
                    </div>
                    {cert.date && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(cert.date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <SupportResumeViewDialog
        isOpen={isResumeDialogOpen}
        onOpenChange={handleCloseResumeDialog}
        candidateName={candidate.fullName}
        viewUrl={resumeViewUrl}
        isLoading={isLoadingResume && !resumeViewUrl}
      />
    </div>
  );
}
