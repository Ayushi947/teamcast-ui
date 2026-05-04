import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Briefcase,
  Building2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Timeline, TimelineItem } from '@/components/ui/timeline';

import {
  IResume,
  IResumeCertification,
  IResumeEducation,
  IResumeExperience,
  IResumeProject,
} from '@/lib/shared';
import { CommonTags } from '@/components/ui/common-tags';

interface OverviewTabProps {
  candidateResumeData: IResume;
}

export const OverviewTab = ({ candidateResumeData }: OverviewTabProps) => {
  if (!candidateResumeData) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No resume data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Candidate Summary Card */}
      <div className="space-y-4 lg:col-span-2">
        {/* Professional Summary */}
        <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-muted-foreground text-base dark:text-gray-400">
                {candidateResumeData.summary || 'No summary available'}
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Work Experience */}
        {candidateResumeData.experience &&
          candidateResumeData.experience.length > 0 && (
            <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-primary h-4 w-4 dark:text-purple-400" />
                    Work Experience
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline>
                  {candidateResumeData.experience.map(
                    (experience: IResumeExperience, index: number) => (
                      <TimelineItem
                        key={index}
                        title={`${experience.position} at ${experience.company}`}
                        description={experience.description}
                        date={`${formatDate(experience.startDate)} - ${experience.endDate ? formatDate(experience.endDate) : 'Present'}`}
                        icon={
                          <Building2 className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                        }
                        isLast={
                          index === candidateResumeData.experience.length - 1
                        }
                      />
                    )
                  )}
                </Timeline>
              </CardContent>
            </Card>
          )}

        {/* Education */}
        {candidateResumeData.education &&
          candidateResumeData.education.length > 0 && (
            <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {candidateResumeData.education.map(
                    (education: IResumeEducation, index: number) => (
                      <div key={index}>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {education.degree}
                        </h3>
                        <p className="text-muted-foreground text-sm dark:text-gray-400">
                          {education.institution} - {education.fieldOfStudy}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Certifications */}
        {candidateResumeData.certifications &&
          candidateResumeData.certifications.length > 0 && (
            <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {candidateResumeData.certifications.map(
                    (certification: IResumeCertification, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span>•</span>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {certification.name}
                        </h3>
                        <p className="text-muted-foreground text-sm dark:text-gray-400">
                          {certification.issuer}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Projects */}
        {candidateResumeData.experience &&
          candidateResumeData.experience.some(
            (exp) => exp.projects?.length > 0
          ) && (
            <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {candidateResumeData.experience
                    .filter(
                      (
                        exp
                      ): exp is IResumeExperience & {
                        projects: IResumeProject[];
                      } => Boolean(exp.projects?.length)
                    )
                    .flatMap((experience) => experience.projects)
                    .map((project: IResumeProject, index: number) => (
                      <div key={index}>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {project.name
                            ? project.name.charAt(0).toUpperCase() +
                              project.name.slice(1)
                            : 'Untitled Project'}
                        </h3>
                        <p className="text-muted-foreground text-sm dark:text-gray-400">
                          {project.description || 'No description available'}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Quick Stats & Contact */}
      <div className="space-y-6">
        {(candidateResumeData.email ||
          candidateResumeData.phone ||
          candidateResumeData.location ||
          candidateResumeData.social?.portfolio ||
          candidateResumeData.social?.linkedin ||
          candidateResumeData.social?.github) && (
          <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidateResumeData.email && (
                <div className="flex items-center gap-3 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Mail className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {candidateResumeData.email}
                  </span>
                </div>
              )}
              {candidateResumeData.phone && (
                <div className="flex items-center gap-3 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Phone className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {candidateResumeData.phone}
                  </span>
                </div>
              )}
              {candidateResumeData.location && (
                <div className="flex items-center gap-3 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <MapPin className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {candidateResumeData.location}
                  </span>
                </div>
              )}
              {candidateResumeData.social?.portfolio && (
                <div className="flex items-center gap-3 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Globe className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {candidateResumeData.social.portfolio}
                  </span>
                </div>
              )}
              {candidateResumeData.social?.linkedin && (
                <div className="flex items-center gap-3 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Linkedin className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {candidateResumeData.social.linkedin}
                  </span>
                </div>
              )}
              {candidateResumeData.social?.github && (
                <div className="flex items-center gap-3 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Github className="h-4 w-4 text-[#6e55cf] dark:text-purple-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {candidateResumeData.social.github}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {candidateResumeData.resumeSkills &&
          candidateResumeData.resumeSkills.length > 0 && (
            <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Key Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <CommonTags
                    values={candidateResumeData.resumeSkills}
                    maxVisible={20}
                  />
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
};
