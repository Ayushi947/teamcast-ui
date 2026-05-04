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
  Award,
  Calendar,
  Link,
  FileText,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { IResumeCertification } from '@/lib/shared';
import { useState } from 'react';
import { enumToReadableText } from '@/lib/utils';

export interface CertificationCardProps {
  certification: IResumeCertification;
  onEdit: () => void;
  onDelete: () => void;
  isReadOnly?: boolean;
}

export function CertificationCard({
  certification,
  onEdit,
  onDelete,
  isReadOnly,
}: CertificationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentlyPursuing = !certification.expiryDate;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 pb-2">
              {certification.name}
            </CardTitle>
            <div className="text-muted-foreground flex flex-col gap-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="first-letter:uppercase">
                    {certification.issuer}
                  </span>
                </p>
                <span className="text-muted-foreground">•</span>
                <p className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(certification.issueDate), 'MMM yyyy')}
                  {currentlyPursuing
                    ? ' - Present'
                    : certification.expiryDate
                      ? ` - ${format(new Date(certification.expiryDate), 'MMM yyyy')}`
                      : ''}
                  {currentlyPursuing && (
                    <span className="bg-primary/10 text-primary dark:bg-primary/20 ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
                      Current
                    </span>
                  )}
                </p>
                {certification.level && (
                  <span className="text-muted-foreground">•</span>
                )}
                {certification.level && (
                  <p className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span className="first-letter:uppercase">
                      {enumToReadableText(certification.level)}
                    </span>
                  </p>
                )}
                {certification.category && (
                  <span className="text-muted-foreground">•</span>
                )}
                {certification.category && (
                  <p className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span className="first-letter:uppercase">
                      {certification.category}
                    </span>
                  </p>
                )}
              </div>
              {certification.description && (
                <div
                  className={`transition-all duration-300 ${isOpen ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'}`}
                >
                  <p className="flex items-center gap-1.5 first-letter:uppercase">
                    <span className="text-muted-foreground line-clamp-2 text-sm">
                      {certification.description}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            {!isReadOnly && (
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
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
            {certification.description && (
              <div>
                <h4 className="flex items-center gap-2 font-medium">
                  <FileText className="text-primary h-4 w-4" />
                  Description
                </h4>
                <div
                  className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'h-0 overflow-hidden opacity-0'}`}
                >
                  <p className="text-muted-foreground mt-1 text-sm">
                    {certification.description}
                  </p>
                </div>
              </div>
            )}

            {(certification.credentialId || certification.credentialUrl) && (
              <div>
                <h4 className="flex items-center gap-2 font-medium">
                  <Link className="text-primary h-4 w-4" />
                  Credential Details
                </h4>
                <div className="mt-1 space-y-2">
                  {certification.credentialId && (
                    <p className="flex items-center gap-2 text-sm">
                      <span className="font-medium">ID:</span>{' '}
                      {certification.credentialId}
                    </p>
                  )}
                  {certification.credentialUrl && (
                    <a
                      href={certification.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm"
                    >
                      <Link className="h-4 w-4" />
                      View Credential
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
