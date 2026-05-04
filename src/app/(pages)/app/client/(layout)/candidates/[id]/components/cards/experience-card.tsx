import { useQuery } from '@tanstack/react-query';
import { candidateResumeService } from '@/lib/services/services';
import { IResumeExperience, IResumeProject } from '@/lib/shared';
import { ExperienceCard } from '@/components/app/candidate/experience/experience-card';
import { Briefcase } from 'lucide-react';
import { useParams } from 'next/navigation';

export function ExperienceContainer() {
  const params = useParams();
  const candidateId = params.id as string;
  const isPublicView = !!candidateId;

  // For public view, fetch the entire resume
  const { data: publicResume, isLoading: isPublicResumeLoading } = useQuery({
    queryKey: ['resume', candidateId],
    queryFn: () => candidateResumeService.getPublicResume(candidateId),
    enabled: isPublicView,
  });

  // Determine which experiences to display
  const experiences = isPublicView ? publicResume?.experience : [];

  const isLoading = isPublicView ? isPublicResumeLoading : false;

  const displayedExperiences = experiences || [];

  if (isLoading) {
    return (
      <div className="border-muted flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center justify-center">
          <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">
            Loading experiences...
          </p>
        </div>
      </div>
    );
  }

  // Create empty handler functions for public view
  const emptyFn = () => {};
  const emptyAsyncFn = async () => {};
  const emptyProjectFn = (_project: IResumeProject) => {};

  return (
    <>
      <div className="space-y-6">
        {displayedExperiences?.map((experience: IResumeExperience) => (
          <ExperienceCard
            key={experience.id}
            isReadOnly={isPublicView}
            experience={experience}
            onEdit={isPublicView ? emptyFn : () => emptyFn()}
            onDelete={isPublicView ? emptyFn : () => emptyAsyncFn()}
            onEditProject={isPublicView ? emptyProjectFn : emptyFn}
            onDeleteProject={isPublicView ? emptyFn : emptyAsyncFn}
          />
        ))}

        {(!displayedExperiences || displayedExperiences?.length === 0) && (
          <div className="border-muted flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="bg-muted rounded-full p-3">
              <Briefcase className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No experiences yet</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              {isPublicView
                ? "This candidate hasn't added any work experience yet."
                : 'Start by adding your first work experience to showcase your professional journey.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
