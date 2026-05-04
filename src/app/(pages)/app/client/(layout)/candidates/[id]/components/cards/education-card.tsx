'use client';

import { Button } from '@/components/ui/button';
import { Award, GraduationCap, Plus } from 'lucide-react';
import { EducationCard } from '@/components/app/candidate/education/education-card';
import { EducationForm } from '@/components/app/candidate/education/education-form';
import { CertificationCard } from '@/components/app/candidate/education/certification-card';
import { CertificationForm } from '@/components/app/candidate/education/certification-form';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { candidateResumeService } from '@/lib/services/services';
import { useParams } from 'next/navigation';

export function EducationContainer() {
  const [isEducationFormOpen, setIsEducationFormOpen] = useState(false);
  const [isCertificationFormOpen, setIsCertificationFormOpen] = useState(false);
  const params = useParams();
  const candidateId = params.id as string;
  const isPublicView = !!candidateId;

  // For public view, fetch the entire resume
  const { data: publicResume, isLoading: isPublicResumeLoading } = useQuery({
    queryKey: ['resume', candidateId],
    queryFn: () => candidateResumeService.getPublicResume(candidateId),
    enabled: isPublicView,
  });

  // Determine which educations to display
  const educations = isPublicView ? publicResume?.education : [];

  // Create empty handler functions for public view
  const emptyFn = () => {};
  const emptyAsyncFn = async () => {};

  // Render
  const displayedEducations = educations || [];
  const displayedCertifications = isPublicView
    ? publicResume?.certifications
    : [];

  if (isPublicResumeLoading) {
    return (
      <div className="border-muted flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center justify-center">
          <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">
            Loading education history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground sm:text2xl mb-2 flex items-center gap-2 text-2xl font-bold">
              <GraduationCap className="text-primary h-8 w-8 pr-2" />
              Education
            </h2>
            <p className="text-muted-foreground text-sm">
              Educational background and achievements.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {displayedEducations.length === 0 ? (
            <div className="border-muted flex h-[200px] items-center justify-center rounded-lg border border-dashed">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm">
                  No education history added yet
                </p>
                <p className="text-muted-foreground/70 mt-1 text-xs">
                  {isPublicView
                    ? "This candidate hasn't added any education history yet."
                    : 'Click the button above to add your education'}
                </p>
              </div>
            </div>
          ) : (
            displayedEducations.map((education) => (
              <EducationCard
                key={education.id}
                isReadOnly={isPublicView}
                education={education}
                onEdit={isPublicView ? emptyFn : () => emptyFn()}
                onDelete={isPublicView ? emptyAsyncFn : () => emptyAsyncFn()}
              />
            ))
          )}
        </div>
        {!isPublicView && (
          <div className="mt-4 flex gap-4">
            <Button
              onClick={() => setIsEducationFormOpen(true)}
              variant="outline"
              className="h-10 px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground sm:text2xl mb-2 flex items-center gap-2 text-2xl font-bold">
              <Award className="text-primary h-8 w-8 pr-2" />
              Certifications
            </h2>
            <p className="text-muted-foreground text-sm">
              Certifications and achievements.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {displayedCertifications?.length === 0 ? (
            <div className="border-muted flex h-[200px] items-center justify-center rounded-lg border border-dashed">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm">
                  No certifications added yet
                </p>
                <p className="text-muted-foreground/70 mt-1 text-xs">
                  {isPublicView
                    ? "This candidate hasn't added any certifications yet."
                    : 'Click the button above to add your certifications'}
                </p>
              </div>
            </div>
          ) : (
            displayedCertifications?.map((certification) => (
              <CertificationCard
                key={certification.id}
                certification={certification}
                onEdit={isPublicView ? emptyFn : () => emptyFn()}
                onDelete={isPublicView ? emptyAsyncFn : () => emptyAsyncFn()}
                isReadOnly={isPublicView}
              />
            ))
          )}
        </div>
        {!isPublicView && (
          <div className="mt-4 flex gap-4">
            <Button
              onClick={() => setIsCertificationFormOpen(true)}
              variant="outline"
              className="h-10 px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          </div>
        )}
      </div>

      {!isPublicView && (
        <>
          <EducationForm
            isOpen={isEducationFormOpen}
            onClose={emptyFn}
            onSubmit={emptyAsyncFn}
            education={undefined}
          />

          <CertificationForm
            open={isCertificationFormOpen}
            onOpenChange={emptyFn}
            onSubmit={emptyAsyncFn}
            certification={undefined}
          />
        </>
      )}
    </div>
  );
}
