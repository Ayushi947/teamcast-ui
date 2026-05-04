'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { IResumeProject } from '@/lib/shared';
import {
  ChevronDown,
  Pencil,
  Trash2,
  Github,
  Layers,
  Calendar,
  Users,
  ListChecks,
  Code2,
  Award,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { formatEnumValue } from '@/lib/utils';

interface ProjectCardProps {
  project: IResumeProject;
  onEdit: (project: IResumeProject) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  isReadOnly,
}: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper function to format skills consistently
  function formatSkill(skill: string): string {
    // Check if it's a structured skill (name:level:years format)
    if (skill.includes(':')) {
      const [name, level, years] = skill.split(':');
      const formattedName = formatEnumValue(name);

      // If level and years are missing or undefined, just return formatted name
      if (!level || !years || level === 'undefined' || years === 'undefined') {
        return formattedName;
      }

      // Return formatted skill with level and years
      return `${formattedName} (${level}, ${years} Years)`;
    }

    // If it's just a plain skill name, format it properly
    return formatEnumValue(skill);
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-l-primary/50 hover:border-l-primary border-l-4 bg-white transition-colors dark:bg-gray-800/50">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="pb-2 text-base">{project.name}</CardTitle>
            <div className="text-muted-foreground flex flex-col gap-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {project.role && (
                  <>
                    <p className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {project.role}
                    </p>
                  </>
                )}
                {project.startDate && (
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {project.startDate
                      ? format(new Date(project.startDate), 'MMM yyyy')
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
            </div>
            <div
              className={`transition-all duration-300 ${isOpen ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'}`}
            >
              <p className="flex items-center gap-1.5 first-letter:uppercase">
                <span className="text-muted-foreground line-clamp-2 text-sm">
                  {project.description}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(project)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(project.id)}
              >
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
            <div>
              <h4 className="flex items-center gap-1.5 font-medium">
                <ListChecks className="h-4 w-4" />
                Description
              </h4>
              <div
                className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'h-0 overflow-hidden opacity-0'}`}
              >
                <p className="text-muted-foreground mt-1 text-sm">
                  {project.description}
                </p>
              </div>
            </div>

            {project.skills?.length > 0 && (
              <div>
                <h4 className="flex items-center gap-1.5 font-medium">
                  <Code2 className="h-4 w-4" />
                  Skills
                </h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {project.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium"
                    >
                      {formatSkill(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {project.responsibilities?.length > 0 && (
                <div className="col-span-1 space-y-1">
                  <h4 className="flex items-center gap-1.5 font-medium">
                    <ListChecks className="h-4 w-4" />
                    Responsibilities
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {project.responsibilities.map((responsibility, index) => (
                      <li key={index} className="text-muted-foreground">
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.achievements?.length > 0 && (
                <div className="col-span-1 space-y-1">
                  <h4 className="flex items-center gap-1.5 font-medium">
                    <Award className="h-4 w-4" />
                    Achievements
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {project.achievements.map((achievement, index) => (
                      <li key={index} className="text-muted-foreground">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.challenges?.length > 0 && (
                <div className="col-span-1 space-y-1">
                  <h4 className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Challenges
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {project.challenges.map((challenge, index) => (
                      <li key={index} className="text-muted-foreground">
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.solutions?.length > 0 && (
                <div className="col-span-1 space-y-1">
                  <h4 className="flex items-center gap-1.5 font-medium">
                    <Lightbulb className="h-4 w-4" />
                    Solutions
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {project.solutions.map((solution, index) => (
                      <li key={index} className="text-muted-foreground">
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.impact?.length > 0 && (
                <div className="col-span-1 space-y-1">
                  <h4 className="flex items-center gap-1.5 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    Impact
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {project.impact.map((impact, index) => (
                      <li key={index} className="text-muted-foreground">
                        {impact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Demo
                </a>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
