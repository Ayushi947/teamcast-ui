'use client';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronDown,
  Pencil,
  Trash2,
  Building2,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  Award,
  Code2,
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import { IResumeExperience, IResumeProject } from '@/lib/shared';
import { useState } from 'react';
import { ProjectCard } from './project-card';
import { enumToReadableText, formatEnumValue } from '@/lib/utils';

export interface ExperienceCardProps {
  experience: IResumeExperience;
  onEdit: () => void;
  onDelete: () => void;
  onEditProject: (project: IResumeProject) => void;
  onDeleteProject: (id: string) => void;
  isReadOnly?: boolean;
}

export function ExperienceCard({
  experience,
  onEdit,
  onDelete,
  onEditProject,
  onDeleteProject,
  isReadOnly,
}: ExperienceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  function parseSkills(skills: string[]): string[] {
    return skills
      .map((skill) => {
        // Check if it's a structured skill (name:level:years format)
        if (skill.includes(':')) {
          const [name, level, experience] = skill.split(':');
          const formattedName = formatEnumValue(name);

          // If level and years are missing or undefined, just return formatted name
          if (
            !level ||
            !experience ||
            level === 'undefined' ||
            experience === 'undefined'
          ) {
            return formattedName;
          }

          // Return formatted skill with level and years
          return `${formattedName} (${level}, ${experience} Years)`;
        }

        // If it's just a plain skill name, format it properly
        return formatEnumValue(skill);
      })
      .filter((skill) => skill);
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 pb-2">
              {experience.position} at {experience.company}
            </CardTitle>
            <div className="text-muted-foreground flex flex-col gap-1 text-sm">
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(experience.startDate), 'MMM yyyy')}
                  {experience.currentlyWorking
                    ? ' - Present'
                    : experience.endDate
                      ? ` - ${format(new Date(experience.endDate), 'MMM yyyy')}`
                      : ''}
                  {experience.currentlyWorking && (
                    <span className="bg-primary/10 text-primary dark:bg-primary/20 ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
                      Current
                    </span>
                  )}
                </p>
                {experience.type && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="flex items-center gap-1.5 first-letter:uppercase">
                      <Briefcase className="h-3.5 w-3.5" />
                      {enumToReadableText(experience.type)}
                    </p>
                  </>
                )}
                {experience.commitment && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="flex items-center gap-1.5 first-letter:uppercase">
                      <Clock className="h-3.5 w-3.5" />
                      {enumToReadableText(experience.commitment)}
                    </p>
                  </>
                )}
                {experience.location && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {experience.location}
                    </p>
                  </>
                )}
                {experience.industry && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {enumToReadableText(experience.industry)}
                    </p>
                  </>
                )}
              </div>
              <div
                className={`transition-all duration-300 ${isOpen ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'}`}
              >
                <p className="flex items-center gap-1.5 first-letter:uppercase">
                  <span className="text-muted-foreground line-clamp-2 text-sm">
                    {experience.description}
                  </span>
                </p>

                {/* Project Names Preview */}
                {experience.projects && experience.projects.length > 0 && (
                  <div className="mt-3">
                    <h1 className="text-md font-bold">Projects: </h1>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {experience.projects.slice(0, 3).map((project) => (
                        <span
                          key={project.id}
                          className="bg-primary text-primary-foreground rounded-lg px-2 py-1 text-xs font-medium"
                        >
                          {project.name}
                        </span>
                      ))}
                      {experience.projects.length > 3 && (
                        <span className="bg-primary/20 text-primary rounded-lg px-2 py-1 text-xs font-medium">
                          +{experience.projects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            {!isReadOnly && (
              <div data-tour="experience-edit-section">
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            {!isReadOnly && (
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="lg:col-span-2">
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
                <ListChecks className="h-4 w-4" />
                Description
              </h4>
              <div
                className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'h-0 overflow-hidden opacity-0'}`}
              >
                <p className="text-muted-foreground mt-1 text-sm">
                  {experience.description}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
                <ListChecks className="text-muted-foreground h-4 w-4" />
                Responsibilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {experience.responsibilities?.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {experience.responsibilities.map(
                      (responsibility, index) => (
                        <li key={index} className="text-muted-foreground">
                          {responsibility}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No responsibilities listed
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
                <Code2 className="text-muted-foreground h-4 w-4" />
                Skills & Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {experience.skills?.length > 0 ? (
                  parseSkills(experience.skills).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary dark:bg-primary/20 rounded-full px-3 py-1 text-xs"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No skills listed
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
                <Award className="text-muted-foreground h-4 w-4" />
                Achievements
              </h4>
              <div className="flex flex-wrap gap-2">
                {experience.achievements?.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {experience.achievements.map((achievement, index) => (
                      <li key={index} className="text-muted-foreground">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No achievements listed
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-medium">Projects</h4>
              </div>
              {experience.projects && experience.projects.length > 0 ? (
                <div
                  className="space-y-4"
                  data-tour="experience-projects-section"
                >
                  {experience.projects.map((project) => (
                    <ProjectCard
                      isReadOnly={isReadOnly || false}
                      key={project.id}
                      project={project}
                      onEdit={onEditProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No projects added yet
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
