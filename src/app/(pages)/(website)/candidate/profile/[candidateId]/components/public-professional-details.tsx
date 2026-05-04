import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ICandidateProfile, IResume } from '@/lib/shared';
import {
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  Code,
  Target,
  Clock,
} from 'lucide-react';
import { maskPersonalData } from '@/lib/utils/data-masking';
import { useState } from 'react';

interface PublicProfessionalDetailsProps {
  profile: ICandidateProfile;
  resume?: IResume;
}

export const PublicProfessionalDetails = ({
  resume,
}: PublicProfessionalDetailsProps) => {
  // State to track which experience items have expanded skills
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [showAllExperience, setShowAllExperience] = useState(false);

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const formatDuration = (
    startDate: Date | string,
    endDate?: Date | string,
    _currentlyWorking?: boolean
  ) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      end.getMonth() -
      start.getMonth();
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let duration = '';
    if (years > 0) duration += `${years} yr${years > 1 ? 's' : ''}`;
    if (remainingMonths > 0)
      duration += `${duration ? ' ' : ''}${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;

    return duration || '1 mo';
  };

  // Toggle skills expansion for a specific experience item
  const toggleSkillsExpansion = (expId: string) => {
    setExpandedSkills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(expId)) {
        newSet.delete(expId);
      } else {
        newSet.add(expId);
      }
      return newSet;
    });
  };

  // Check if skills are expanded for a specific experience item
  const isSkillsExpanded = (expId: string) => expandedSkills.has(expId);

  const experiences = resume?.experience ?? [];
  const displayedExperience = showAllExperience
    ? experiences
    : experiences.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Experience Section */}
      {experiences.length > 0 && (
        <Card className="group from-card via-card to-background/50 relative overflow-hidden bg-gradient-to-br p-4 shadow-xl transition-all duration-300 hover:shadow-2xl sm:p-6">
          {/* Background decoration */}
          <div className="bg-primary/5 group-hover:bg-primary/10 dark:bg-primary/10 dark:group-hover:bg-primary/20 absolute -right-6 -bottom-6 h-24 w-24 rounded-full blur-xl transition-all duration-500" />

          <div className="relative">
            <div className="border-border/50 flex items-center gap-2 border-b pb-3 sm:gap-3 sm:pb-4">
              <div className="bg-primary/10 dark:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10">
                <Briefcase className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-foreground text-lg font-bold sm:text-xl">
                  Work Experience
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Professional journey and achievements
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
              {displayedExperience.map((exp, index) => (
                <div key={exp.id || index} className="relative">
                  {/* Timeline connector */}
                  {index > 0 && (
                    <div className="bg-border absolute -top-3 left-5 h-3 w-px" />
                  )}

                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="from-primary/10 to-primary/5 relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-lg sm:h-10 sm:w-10">
                        <Briefcase className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                        {exp.currentlyWorking && (
                          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-lg sm:h-3 sm:w-3">
                            <div className="h-full w-full animate-pulse rounded-full bg-emerald-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-foreground text-base font-bold sm:text-lg">
                            {exp.position}
                          </h4>
                          <p className="text-primary text-sm font-semibold sm:text-base">
                            {exp.company}
                          </p>
                        </div>

                        <div className="text-muted-foreground flex flex-wrap gap-1.5 text-xs sm:gap-2">
                          <div className="bg-muted/50 flex items-center gap-1 rounded-md px-1.5 py-0.5 sm:gap-1.5 sm:px-2 sm:py-1">
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="text-xs font-medium">
                              {formatDate(exp.startDate)}
                              {exp.endDate ? (
                                <> - {formatDate(exp.endDate)}</>
                              ) : exp.currentlyWorking ? (
                                <> - Present</>
                              ) : null}
                            </span>
                          </div>
                          <div className="bg-muted/50 flex items-center gap-1 rounded-md px-1.5 py-0.5 sm:gap-1.5 sm:px-2 sm:py-1">
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="text-xs font-medium">
                              {formatDuration(
                                exp.startDate,
                                exp.endDate,
                                exp.currentlyWorking
                              )}
                            </span>
                          </div>
                          {exp.location && (
                            <div className="bg-muted/50 flex items-center gap-1 rounded-md px-1.5 py-0.5 sm:gap-1.5 sm:px-2 sm:py-1">
                              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span className="text-xs font-medium">
                                {maskPersonalData.location(exp.location)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {exp.description && (
                        <div className="bg-muted/30 rounded-lg p-2 sm:p-3">
                          <p className="text-foreground/90 text-xs leading-relaxed sm:text-sm">
                            {exp.description}
                          </p>
                        </div>
                      )}

                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-foreground flex items-center gap-1.5 text-xs font-semibold sm:gap-2 sm:text-sm">
                            <Target className="text-primary h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Key Achievements
                          </h5>
                          <ul className="space-y-1">
                            {exp.achievements
                              .slice(0, 3)
                              .map((achievement, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-1.5 text-xs sm:gap-2"
                                >
                                  <div className="bg-primary mt-1 h-1 w-1 flex-shrink-0 rounded-full sm:h-1.5 sm:w-1.5" />
                                  <span className="text-foreground/80 text-xs leading-relaxed">
                                    {achievement}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {exp.skills && exp.skills.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-foreground flex items-center gap-1.5 text-xs font-semibold sm:gap-2 sm:text-sm">
                            <Code className="text-accent-foreground h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Technologies Used
                          </h5>
                          <div className="flex flex-wrap gap-1 sm:gap-1.5">
                            {/* Show first 6 skills on mobile, 8 on larger screens */}
                            {exp.skills.slice(0, 6).map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20 text-xs transition-colors duration-200"
                              >
                                {skill}
                              </Badge>
                            ))}

                            {/* Show remaining skills if expanded */}
                            {isSkillsExpanded(exp.id || `exp-${index}`) &&
                              exp.skills.slice(6).map((skill, idx) => (
                                <Badge
                                  key={idx + 6}
                                  variant="outline"
                                  className="bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20 text-xs transition-colors duration-200"
                                >
                                  {skill}
                                </Badge>
                              ))}

                            {/* Show "more" button if there are more than 6 skills */}
                            {exp.skills.length > 6 && (
                              <button
                                onClick={() =>
                                  toggleSkillsExpansion(
                                    exp.id || `exp-${index}`
                                  )
                                }
                                className="border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md border border-dashed bg-transparent px-1.5 py-0.5 text-xs font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:px-2 sm:py-1"
                              >
                                {isSkillsExpanded(exp.id || `exp-${index}`)
                                  ? 'Show less'
                                  : `+${exp.skills.length - 6} more`}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {exp.projects && exp.projects.length > 0 && (
                        <div className="space-y-2 sm:space-y-3">
                          <h5 className="text-foreground flex items-center gap-1.5 text-xs font-semibold sm:gap-2 sm:text-sm">
                            <Code className="text-secondary-foreground h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Notable Projects
                          </h5>
                          <div className="grid gap-1.5 sm:gap-2">
                            {exp.projects.slice(0, 2).map((project, idx) => (
                              <div
                                key={project.id || idx}
                                className="group border-border/50 from-muted/30 to-muted/10 hover:border-primary/20 rounded-lg border bg-gradient-to-br p-2 transition-all duration-200 hover:shadow-md sm:p-3"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-1">
                                    <h6 className="text-foreground group-hover:text-primary text-xs font-semibold transition-colors duration-200 sm:text-sm">
                                      {project.name}
                                    </h6>
                                    {project.role && (
                                      <p className="text-primary text-xs font-medium">
                                        {project.role}
                                      </p>
                                    )}
                                  </div>
                                  {(project.url ||
                                    project.githubUrl ||
                                    project.demoUrl) && (
                                    <ExternalLink className="text-muted-foreground group-hover:text-primary h-3 w-3 transition-colors duration-200 sm:h-3.5 sm:w-3.5" />
                                  )}
                                </div>
                                {project.description && (
                                  <p className="text-foreground/80 mt-1 text-xs leading-relaxed sm:mt-2">
                                    {project.description}
                                  </p>
                                )}
                                {project.skills &&
                                  project.skills.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2">
                                      {project.skills
                                        .slice(0, 3)
                                        .map((skill, skillIdx) => (
                                          <Badge
                                            key={skillIdx}
                                            variant="secondary"
                                            className="bg-primary/10 text-primary hover:bg-primary/20 text-xs transition-colors duration-200"
                                          >
                                            {skill}
                                          </Badge>
                                        ))}
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {experiences.length > 5 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllExperience((prev) => !prev)}
                    className="text-primary hover:text-primary/80 focus:ring-ring inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    {showAllExperience
                      ? 'Show less experience'
                      : `Show ${experiences.length - 5} more work experience${
                          experiences.length - 5 > 1 ? 's' : ''
                        }`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Education Section */}
      {resume?.education && resume.education.length > 0 && (
        <Card className="bg-card border-border/50 relative overflow-hidden border p-4 shadow-xl sm:p-6">
          <div className="border-border/50 flex items-center gap-2 border-b pb-3 sm:gap-3 sm:pb-4">
            <div className="bg-primary/10 dark:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10">
              <GraduationCap className="text-primary dark:text-primary-400 h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-foreground text-lg font-bold sm:text-xl">
                Education
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Academic background and qualifications
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
            {resume.education.map((edu, index) => (
              <div key={edu.id || index} className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 dark:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg sm:h-10 sm:w-10">
                    <GraduationCap className="text-primary dark:text-primary-400 h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="text-foreground text-sm font-bold sm:text-base">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h4>
                    <p className="text-primary dark:text-primary-400 text-sm font-semibold sm:text-base">
                      {edu.institution}
                    </p>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="font-medium">
                      {formatDate(edu.startDate)} -{' '}
                      {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                    </span>
                  </div>
                  {edu.achievements && edu.achievements.length > 0 && (
                    <div className="bg-muted/30 rounded-md p-1.5 sm:p-2">
                      <p className="text-foreground/80 text-xs">
                        {edu.achievements.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Certifications Section */}
      {resume?.certifications && resume.certifications.length > 0 && (
        <Card className="from-card via-card to-background/50 relative overflow-hidden bg-gradient-to-br p-4 shadow-xl sm:p-6">
          <div className="border-border/50 flex items-center gap-2 border-b pb-3 sm:gap-3 sm:pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 sm:h-10 sm:w-10 dark:bg-yellow-900/30">
              <Award className="h-4 w-4 text-yellow-600 sm:h-5 sm:w-5 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-foreground text-lg font-bold sm:text-xl">
                Certifications & Awards
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Professional certifications and recognition
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-6 sm:gap-3">
            {resume.certifications.map((cert, index) => (
              <div
                key={cert.id || index}
                className="group border-border/50 from-muted/30 to-muted/10 rounded-lg border bg-gradient-to-br p-2 transition-all duration-200 hover:border-yellow-200 hover:shadow-md sm:p-3 dark:hover:border-yellow-800"
              >
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <div className="flex-shrink-0">
                    <Award className="h-4 w-4 text-yellow-600 sm:h-5 sm:w-5 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-foreground text-xs font-semibold transition-colors duration-200 group-hover:text-yellow-600 sm:text-sm dark:group-hover:text-yellow-400">
                      {cert.name}
                    </h4>
                    <p className="text-primary text-xs font-medium">
                      {cert.issuer}
                    </p>
                    {cert.issueDate && (
                      <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {formatDate(cert.issueDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
