import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pencil,
  UserCheck,
  Phone,
  MapPin,
  Globe,
  Languages,
  Linkedin,
  Github,
  Globe as GlobeIcon,
  HeartHandshake,
} from 'lucide-react';
import { ICandidateProfile, IResume, IResumeSocial } from '@/lib/shared';
import { format } from 'date-fns';
import { enumToReadableText, formatEnumValue } from '@/lib/utils';

export interface ProfileCardProps {
  profile: ICandidateProfile;
  resume: IResume;
  social: IResumeSocial;
  onEdit: () => void;
  isReadOnly?: boolean;
}

export function ProfileCard({
  profile,
  resume,
  social,
  onEdit,
  isReadOnly,
}: ProfileCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="grid grid-cols-2 gap-6 p-8">
        {/* Header with Edit Button */}
        <div className="col-span-2 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-foreground text-lg font-semibold">
              Basic Information
            </h3>
            <div className="text-muted-foreground flex flex-col gap-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-1.5">
                  <UserCheck className="text-muted-foreground h-3.5 w-3.5" />
                  {profile.sex
                    ? enumToReadableText(profile.sex)
                    : 'Not specified'}
                </p>
                <span className="text-muted-foreground">•</span>
                <p className="flex items-center gap-1.5">
                  <HeartHandshake className="text-muted-foreground h-3.5 w-3.5" />
                  {profile.maritalStatus
                    ? enumToReadableText(profile.maritalStatus)
                    : 'Not specified'}
                </p>
                {profile.birthDate && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="flex items-center gap-1.5">
                      <UserCheck className="text-muted-foreground h-3.5 w-3.5" />
                      Born {format(new Date(profile.birthDate), 'MMMM d, yyyy')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          {!isReadOnly && (
            <div data-tour="edit-profile-button">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Contact Information Section */}
        <div className="col-span-1 space-y-4">
          <div>
            <h4 className="text-foreground mb-2 flex items-center gap-2 text-base font-semibold">
              <Phone className="text-muted-foreground h-4 w-4" />
              Contact Information
            </h4>
            <p className="text-muted-foreground text-sm">
              How can recruiters reach you?
            </p>
          </div>
          <div className="grid gap-3">
            {resume.phone && (
              <div className="flex items-center gap-2">
                <Phone className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Phone:
                </span>
                <span className="text-muted-foreground text-sm">
                  {resume.phone}
                </span>
              </div>
            )}
            {resume.location && (
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Location:
                </span>
                <span className="text-muted-foreground text-sm">
                  {resume.location}
                </span>
              </div>
            )}
            {resume.languages && resume.languages.length > 0 && (
              <div className="flex items-center gap-2">
                <Languages className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Languages:
                </span>
                <span className="text-muted-foreground text-sm">
                  {resume.languages
                    .map((language) => formatEnumValue(language))
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Social Links Section */}
        <div className="col-span-1 space-y-4">
          <div>
            <h4 className="text-foreground mb-2 flex items-center gap-2 text-base font-semibold">
              <Globe className="text-muted-foreground h-4 w-4" />
              Social & Portfolio Links
            </h4>
            <p className="text-muted-foreground text-sm">
              Showcase your work and professional presence.
            </p>
          </div>
          <div className="grid gap-3">
            {social.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  LinkedIn:
                </span>
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  {social.linkedin}
                </a>
              </div>
            )}
            {social.github && (
              <div className="flex items-center gap-2">
                <Github className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  GitHub:
                </span>
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  {social.github}
                </a>
              </div>
            )}
            {social.portfolio && (
              <div className="flex items-center gap-2">
                <GlobeIcon className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Portfolio:
                </span>
                <a
                  href={social.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  {social.portfolio}
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
