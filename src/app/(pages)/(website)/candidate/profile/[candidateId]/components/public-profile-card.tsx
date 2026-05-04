import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  CandidateOnboardingAssessmentStatusEnum,
  CandidateStatusEnum,
  ICandidateProfile,
  IResume,
} from '@/lib/shared';
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  Globe,
  CheckCircle,
  Award,
} from 'lucide-react';
import { enumToReadableText } from '@/lib/utils';
import { maskPersonalData } from '@/lib/utils/data-masking';

interface PublicProfileCardProps {
  profile: ICandidateProfile;
  resume?: IResume;
}

export const PublicProfileCard = ({
  profile,
  resume,
}: PublicProfileCardProps) => {
  const maskedName = maskPersonalData.name(profile.name);
  const maskedEmail = maskPersonalData.email(profile.email);
  const maskedLocation = resume?.location
    ? maskPersonalData.location(resume.location)
    : '';

  return (
    <div className="bg-card border-border/60 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Header with completion status */}
      <div className="relative px-4 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
            {profile.completionPercentage}%
          </div>
        </div>

        {/* Profile photo and basic info */}
        <div className="text-center">
          <div className="relative mb-4 inline-block sm:mb-6">
            <div className="border-primary/20 h-24 w-24 overflow-hidden rounded-full border-2 shadow-md sm:h-32 sm:w-32">
              {profile.image ? (
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={profile.image}
                    alt={maskedName}
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary h-full w-full text-lg font-semibold sm:text-2xl">
                    {maskedName
                      ?.split(' ')
                      .filter(Boolean)
                      .map((n) => n[0]?.toUpperCase())
                      .join('') || ''}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-primary/10 text-primary h-full w-full text-2xl font-semibold sm:text-4xl">
                    {maskedName
                      ?.split(' ')
                      .filter(Boolean)
                      .map((n) => n[0]?.toUpperCase())
                      .join('') || ''}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
              {maskedName}
            </h3>
            {profile.jobTitle && (
              <p className="text-primary text-sm font-medium sm:text-base">
                {profile.jobTitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="px-4 pb-4 sm:px-8 sm:pb-6">
        <div className="grid gap-3 sm:gap-4">
          {resume?.totalExperience && resume.totalExperience > 0 && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10">
                <Briefcase className="text-primary h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div>
                <div className="text-foreground text-xs font-medium sm:text-sm">
                  {resume.totalExperience} years
                </div>
                <div className="text-muted-foreground text-xs">Experience</div>
              </div>
            </div>
          )}

          {maskedLocation && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-secondary/10 flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10">
                <MapPin className="text-secondary-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div>
                <div className="text-foreground text-xs font-medium sm:text-sm">
                  {maskedLocation}
                </div>
                <div className="text-muted-foreground text-xs">Location</div>
              </div>
            </div>
          )}

          {resume?.currentCompany && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-accent/10 flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10">
                <Building2 className="text-accent-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div>
                <div className="text-foreground text-xs font-medium sm:text-sm">
                  {resume.currentCompany}
                </div>
                <div className="text-muted-foreground text-xs">Company</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact section */}
      <div className="px-4 pb-4 sm:px-8 sm:pb-6">
        <div className="border-border/50 space-y-2 border-t py-3 sm:space-y-3 sm:py-4">
          <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate">{maskedEmail}</span>
          </div>
          {profile.createdAt && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>
                Member since {new Date(profile.createdAt).getFullYear()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status badges */}
      <div className="px-4 pb-6 sm:px-8 sm:pb-8">
        <div className="space-y-2 sm:space-y-3">
          <Badge className="bg-primary text-primary-foreground w-full justify-center border-0 py-2 text-xs sm:py-2.5 sm:text-sm">
            <CheckCircle className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="truncate">
              {profile.candidateStatus === CandidateStatusEnum.NEW &&
              profile.onboardingAssessmentStatus ===
                CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED
                ? 'Verified Professional'
                : 'Profile Status'}
            </span>
          </Badge>

          {profile.jobSearchStatus && (
            <Badge
              variant="outline"
              className="w-full justify-center border-emerald-200 bg-emerald-50 py-2 text-xs text-emerald-700 hover:bg-emerald-100 sm:py-2.5 sm:text-sm dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
            >
              <Award className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="truncate">
                {enumToReadableText(profile.jobSearchStatus)}
              </span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
