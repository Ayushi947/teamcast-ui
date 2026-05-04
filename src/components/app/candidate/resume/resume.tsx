import { useQuery } from '@tanstack/react-query';
import { candidateResumeService } from '@/lib/services/services';
import { IResume } from '@/lib/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  ExternalLink,
  Calendar,
  Building2,
  MapPinIcon,
  Star,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface ResumeProps {
  candidateId?: string;
}

export const Resume = ({ candidateId }: ResumeProps) => {
  const { data: resume, isLoading } = useQuery<IResume>({
    queryKey: ['candidate-resume', candidateId],
    queryFn: () =>
      candidateId
        ? candidateResumeService.getPublicResume(candidateId)
        : candidateResumeService.getResume(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-8 py-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No resume data available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4"
    >
      {/* Tour Help Icon */}
      <div className="mb-2 flex justify-end">
        {/* The DriverTour component was removed, so this section is now empty */}
      </div>
      {/* Header Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div className="flex items-start gap-4">
              {resume.image ? (
                <img
                  src={resume.image}
                  alt={resume.name}
                  className="resume-profile-image h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="resume-profile-image bg-primary/10 text-primary flex h-32 w-32 items-center justify-center rounded-full text-2xl font-semibold">
                  {resume.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
              )}
              <div className="resume-name-title space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{resume.name}</h1>
                  {resume.jobTitle && (
                    <div className="text-muted-foreground mt-1 text-lg">
                      {resume.jobTitle}
                    </div>
                  )}
                </div>
                <div className="resume-contact-info flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  {resume.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{resume.email}</span>
                    </div>
                  )}
                  {resume.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{resume.phone}</span>
                    </div>
                  )}
                  {resume.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{resume.location}</span>
                    </div>
                  )}
                  {resume.social && (
                    <div className="flex gap-2">
                      {resume.social.linkedin && (
                        <a
                          href={resume.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {resume.social.github && (
                        <a
                          href={resume.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {resume.social.twitter && (
                        <a
                          href={resume.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {resume.social && (
              <div className="flex gap-4">
                {resume.social.linkedin && (
                  <a
                    href={resume.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {resume.social.github && (
                  <a
                    href={resume.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {resume.social.twitter && (
                  <a
                    href={resume.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      {resume.summary && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Professional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{resume.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      {resume.resumeSkills.length > 0 && (
        <Card className="resume-skills mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {resume.resumeSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Section */}
      <Card className="resume-experience mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {resume.experience.map((exp) => (
              <div
                key={exp.id}
                className="border-primary relative border-l-2 pl-6"
              >
                <div className="bg-primary absolute top-0 -left-[9px] h-4 w-4 rounded-full" />
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold">{exp.position}</h3>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(exp.startDate), 'MMM yyyy')} -
                        {exp.currentlyWorking
                          ? 'Present'
                          : format(new Date(exp.endDate!), 'MMM yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{exp.company}</span>
                    {exp.location && (
                      <>
                        <span>•</span>
                        <MapPinIcon className="h-4 w-4" />
                        <span>{exp.location}</span>
                      </>
                    )}
                  </div>
                  <p className="text-muted-foreground">{exp.description}</p>

                  {/* Responsibilities */}
                  {exp.responsibilities.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium">
                        Key Responsibilities
                      </h4>
                      <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                        {exp.responsibilities.map((responsibility, index) => (
                          <li key={index}>{responsibility}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Achievements */}
                  {exp.achievements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium">
                        Key Achievements
                      </h4>
                      <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                        {exp.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills */}
                  {exp.skills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium">Skills Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {exp.projects.length > 0 && (
                    <div className="mt-6 space-y-6">
                      <h4 className="text-sm font-medium">Projects</h4>
                      {exp.projects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-muted/50 rounded-lg p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium">{project.name}</h4>
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2 text-sm">
                            {project.description}
                          </p>

                          {/* Project Role and Team Size */}
                          <div className="text-muted-foreground mb-4 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Role: {project.role}</span>
                            </div>
                            {project.startDate && (
                              <p className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {project.startDate
                                  ? format(
                                      new Date(project.startDate),
                                      'MMM yyyy'
                                    )
                                  : ''}
                                {project.currentlyWorking
                                  ? ' - Present'
                                  : project.endDate
                                    ? ` - ${format(new Date(project.endDate), 'MMM yyyy')}`
                                    : ''}
                                {project.currentlyWorking && (
                                  <span className="bg-primary/10 text-primary dark:bg-primary/20 ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
                                    Current
                                  </span>
                                )}
                              </p>
                            )}
                          </div>

                          {/* Project Links */}
                          {(project.githubUrl || project.demoUrl) && (
                            <div className="mb-4 flex gap-4">
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary flex items-center gap-2"
                                >
                                  <Github className="h-4 w-4" />
                                  <span className="text-sm">View Code</span>
                                </a>
                              )}
                              {project.demoUrl && (
                                <a
                                  href={project.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary flex items-center gap-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="text-sm">Live Demo</span>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Project Skills */}
                          {project.skills.length > 0 && (
                            <div className="mb-4">
                              <h5 className="mb-2 text-sm font-medium">
                                Technologies Used
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {project.skills.map((skill, index) => (
                                  <Badge key={index} variant="outline">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Project Responsibilities */}
                          {project.responsibilities.length > 0 && (
                            <div className="mb-4">
                              <h5 className="mb-2 text-sm font-medium">
                                Responsibilities
                              </h5>
                              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                                {project.responsibilities.map(
                                  (responsibility, index) => (
                                    <li key={index}>{responsibility}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Project Achievements */}
                          {project.achievements.length > 0 && (
                            <div className="mb-4">
                              <h5 className="mb-2 text-sm font-medium">
                                Achievements
                              </h5>
                              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                                {project.achievements.map(
                                  (achievement, index) => (
                                    <li key={index}>{achievement}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Project Challenges & Solutions */}
                          {project.challenges.length > 0 &&
                            project.solutions.length > 0 && (
                              <div className="mb-4">
                                <h5 className="mb-2 text-sm font-medium">
                                  Challenges & Solutions
                                </h5>
                                <div className="space-y-2">
                                  {project.challenges.map(
                                    (challenge, index) => (
                                      <div
                                        key={index}
                                        className="text-muted-foreground text-sm"
                                      >
                                        <p className="font-medium">
                                          Challenge: {challenge}
                                        </p>
                                        {project.solutions[index] && (
                                          <p className="ml-4">
                                            Solution: {project.solutions[index]}
                                          </p>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Project Impact */}
                          {project.impact.length > 0 && (
                            <div>
                              <h5 className="mb-2 text-sm font-medium">
                                Impact
                              </h5>
                              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                                {project.impact.map((impact, index) => (
                                  <li key={index}>{impact}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card className="resume-education mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resume.education.map((edu) => (
              <div
                key={edu.id}
                className="border-primary relative border-l-2 pl-6"
              >
                <div className="bg-primary absolute top-0 -left-[9px] h-4 w-4 rounded-full" />
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold">{edu.degree}</h3>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(edu.startDate), 'MMM yyyy')} -
                        {edu.currentlyPursuing
                          ? 'Present'
                          : format(new Date(edu.endDate!), 'MMM yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{edu.institution}</span>
                  </div>
                  <p className="text-muted-foreground">{edu.fieldOfStudy}</p>
                  {edu.gpa && (
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>GPA: {edu.gpa}</span>
                    </div>
                  )}
                  {edu.achievements.length > 0 && (
                    <div className="mt-2">
                      <h4 className="mb-2 text-sm font-medium">Achievements</h4>
                      <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                        {edu.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications Section */}
      {resume.certifications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {resume.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="border-primary relative border-l-2 pl-6"
                >
                  <div className="bg-primary absolute top-0 -left-[9px] h-4 w-4 rounded-full" />
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{cert.name}</h3>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(cert.issueDate), 'MMM yyyy')}
                          {cert.expiryDate &&
                            ` - ${format(new Date(cert.expiryDate), 'MMM yyyy')}`}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{cert.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
