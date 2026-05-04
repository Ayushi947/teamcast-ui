'use client';

import { useQuery } from '@tanstack/react-query';
import { ICandidateProfile, IResume, IResumeSocial } from '@/lib/shared';
import { ProfileCard } from '@/components/app/candidate/profile/profile-card';
import { useParams } from 'next/navigation';

interface ProfileContainerProps {
  profile: ICandidateProfile;
  resume: IResume;
}

export function ProfileContainer({ profile, resume }: ProfileContainerProps) {
  const params = useParams();
  const candidateId = params.id as string;
  const isPublicView = !!candidateId;

  // Fetch social links data - for public view, we'll get it from resume
  const { data: social, isLoading: isSocialLoading } = useQuery<IResumeSocial>({
    queryKey: ['candidate-resume-social', candidateId],
    queryFn: async () => {
      if (isPublicView && resume?.social) {
        return resume.social;
      }
      return {} as IResumeSocial;
    },
    enabled: isPublicView ? !!resume : true,
  });

  if (isSocialLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          </div>
          <h1 className="text-foreground mb-3 text-2xl font-semibold">
            Loading Profile
          </h1>
          <p className="text-muted-foreground">
            Please wait while we fetch the information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {profile && resume ? (
        <ProfileCard
          profile={profile}
          resume={resume}
          social={social || ({} as IResumeSocial)}
          onEdit={() => {}}
          isReadOnly={isPublicView}
        />
      ) : (
        <div className="border-muted flex w-full flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No profile information available.
            {!isPublicView && ' Click edit to add your details.'}
          </p>
        </div>
      )}
    </div>
  );
}
