import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ICandidateProfile, IResume } from '@/lib/shared';
import { Building2, MapPin, Briefcase } from 'lucide-react';

interface ProfileCardProps {
  profile: ICandidateProfile;
  resume?: IResume;
}

export const ProfileCard = ({ profile, resume }: ProfileCardProps) => {
  return (
    <Card className="relative flex h-full flex-1 flex-col items-center justify-center bg-white p-4 dark:bg-gray-800">
      <div className="flex flex-col items-center gap-4">
        {/* Profile photo with circular progress bar */}
        <div className="relative h-36 w-36">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white p-0.5 dark:border-gray-700">
              {profile.image ? (
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={profile.image}
                    alt={profile.name || 'Profile'}
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-2xl">
                    {profile.name
                      ?.split(' ')
                      .filter(Boolean)
                      .map((n) => n[0]?.toUpperCase())
                      .join('') || ''}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-2xl">
                    {profile.name
                      ?.split(' ')
                      .filter(Boolean)
                      .map((n) => n[0]?.toUpperCase())
                      .join('') || ''}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            <p className="text-foreground text-lg font-bold dark:text-white">
              {profile.name}
            </p>
          </div>

          <div className="text-muted-foreground flex flex-col flex-wrap items-center justify-center gap-1.5 text-sm dark:text-gray-400">
            {resume?.jobTitle && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{resume.jobTitle}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {resume?.totalExperience && resume?.totalExperience > 0 ? (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {resume?.totalExperience} years of experience
                </div>
              ) : null}

              {resume?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {resume?.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
