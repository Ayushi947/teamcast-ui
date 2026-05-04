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
  Edit,
  Trash,
  GraduationCap,
  Building2,
  Calendar,
  Award,
  FileText,
} from 'lucide-react';
import { IResumeEducation } from '@/lib/shared';
import { useState } from 'react';
import { format } from 'date-fns';
import { enumToReadableText, formatEnumValue } from '@/lib/utils';

interface EducationCardProps {
  education: IResumeEducation;
  onEdit: () => void;
  onDelete: () => void;
  isReadOnly?: boolean;
}

export function EducationCard({
  education,
  onEdit,
  onDelete,
  isReadOnly = false,
}: EducationCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 pb-2">
              {education.degree} in {formatEnumValue(education.fieldOfStudy)}
            </CardTitle>
            <div className="text-muted-foreground flex flex-col gap-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="first-letter:uppercase">
                    {education.institution}
                  </span>
                </p>
                <span className="text-muted-foreground">•</span>
                <p className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(education.startDate), 'MMM yyyy')}
                  {education.currentlyPursuing
                    ? ' - Present'
                    : education.endDate
                      ? ` - ${format(new Date(education.endDate), 'MMM yyyy')}`
                      : ''}
                  {education.currentlyPursuing && (
                    <span className="bg-primary/10 text-primary dark:bg-primary/20 ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
                      Current
                    </span>
                  )}
                </p>
                <span className="text-muted-foreground">•</span>
                <p className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span className="first-letter:uppercase">
                    {enumToReadableText(education.level)}
                  </span>
                </p>
                {education.gpa && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      GPA: {education.gpa}
                    </p>
                  </>
                )}
              </div>
              {education.achievements?.length > 0 && (
                <div
                  className={`transition-all duration-300 ${isOpen ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'}`}
                >
                  <p className="flex items-center gap-1.5 first-letter:uppercase">
                    <span className="text-muted-foreground line-clamp-2 text-sm">
                      {education.achievements[0]}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            {!isReadOnly && (
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {!isReadOnly && (
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash className="h-4 w-4" />
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
              <h4 className="flex items-center gap-2 font-medium">
                <FileText className="text-primary h-4 w-4" />
                Achievements
              </h4>
              {education.achievements?.length > 0 ? (
                <div
                  className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'h-0 overflow-hidden opacity-0'}`}
                >
                  <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1 text-sm">
                    {education.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted-foreground mt-2 text-sm">
                  No achievements added yet
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
