import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ICandidateProfile, IResume } from '@/lib/shared';
import {
  Building2,
  MapPin,
  Briefcase,
  X,
  Upload,
  Pencil,
  CheckCircle,
  AlertCircle,
  Share2,
  Copy,
  ExternalLink,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { logger } from '@/lib/shared';
import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import {
  generatePublicProfileUrl,
  isProfilePubliclyAccessible,
} from '@/lib/utils/data-masking';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface ProfileCardProps {
  profile: ICandidateProfile;
  resume?: IResume;
}

export const ProfileCard = ({ profile, resume }: ProfileCardProps) => {
  const queryClient = useQueryClient();
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [_profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
    undefined
  );

  const publicProfileUrl = generatePublicProfileUrl(profile.candidateId);
  const canSharePublicly = isProfilePubliclyAccessible(profile);

  const hasProfilePhoto = Boolean(
    profile.image &&
      typeof profile.image === 'string' &&
      profile.image.trim().length > 0
  );

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setShowPhotoOptions(false);

      // Create FormData and append file
      const formData = new FormData();
      formData.append('file', file);

      // Upload file using apiClient
      const response = await apiClient.patch(
        '/candidate/profile/photo',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update the profile data with the presigned URL
      if (response.data.data?.presignedUrl) {
        const newUrl = response.data.data.presignedUrl;
        // Store the URL in localStorage
        localStorage.setItem('profileImageUrl', newUrl);
        setProfileImageUrl(newUrl);

        // Update the profile data in the React Query cache
        await queryClient.setQueryData(
          ['candidate-profile'],
          (oldData: any) => ({
            ...oldData,
            image: newUrl,
          })
        );
      }

      // Invalidate and immediately refetch to update UI
      await queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      await queryClient.refetchQueries({ queryKey: ['candidate-profile'] });

      toast.success('Profile photo updated successfully');
    } catch (error) {
      logger.error('Error uploading profile photo:', error);
      toast.error('Failed to upload profile photo');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setShowPhotoOptions(false);

      // Store the old image value for potential rollback
      const _oldImage = profile.image;

      // Optimistically update the cache FIRST to show placeholder immediately
      // Use empty string instead of null/undefined to ensure hasProfilePhoto works correctly
      queryClient.setQueryData(['candidate-profile'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          image: '', // Use empty string for explicit removal
        };
      });

      // Clear the profile image URL from state and localStorage
      setProfileImageUrl(undefined);
      localStorage.removeItem('profileImageUrl');

      // Call the API to remove the profile photo
      await apiClient.delete('/candidate/profile/photo');

      // Invalidate queries but don't immediately refetch - let optimistic update show
      // Refetch in background after a short delay to sync with backend
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });

      // Refetch after a small delay to ensure UI has updated with optimistic change
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['candidate-profile'] });
      }, 100);

      toast.success('Profile photo removed successfully');
    } catch (error) {
      logger.error('Error removing profile photo:', error);
      toast.error('Failed to remove profile photo');

      // Revert optimistic update on error by restoring old image
      queryClient.setQueryData(['candidate-profile'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          image: profile.image, // Restore from props (which still has old value)
        };
      });

      // Refetch to get correct state from backend
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      await queryClient.refetchQueries({ queryKey: ['candidate-profile'] });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      toast.success('Profile link copied!', {
        description: 'Share this link to showcase your professional profile.',
      });
    } catch (err) {
      logger.error('Error copying link:', err);
      toast.error('Failed to copy link', {
        description: 'Please try again or copy the URL manually.',
      });
    }
  };

  const calculateTotalExperience = (experience: any[]) => {
    if (!experience || experience.length === 0) return 0;

    let totalMonths = 0;

    experience.forEach((exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date(); // If endDate is null, use current date

      // Calculate months between dates
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
      totalMonths += months + (endDate.getMonth() - startDate.getMonth());
    });

    // Convert months to years (with 1 decimal place)
    const totalYears = Math.round((totalMonths / 12) * 10) / 10;

    return totalYears;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Professional Profile`,
          text: `Check out ${profile.name}'s professional profile on Teamcast`,
          url: publicProfileUrl,
        });
      } catch (err) {
        logger.error('Error sharing link:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className="relative flex h-full flex-1 flex-col items-center justify-center bg-white p-4 dark:bg-gray-800">
      <div className="flex flex-col items-center gap-4">
        {/* Profile photo with circular progress bar */}
        <div className="relative h-36 w-36" data-tour="profile-photo-section">
          <div className="absolute inset-0">
            <CircularProgressbar
              value={profile.completionPercentage}
              text=""
              strokeWidth={5}
              styles={{
                root: { width: '100%', height: '100%' },
                trail: { stroke: 'var(--trail-color, #D7D0F4)' },
                path: {
                  stroke: 'var(--path-color, #6E55CF)',
                  transform: 'rotate(180deg) ',
                  transformOrigin: 'center',
                },
              }}
              className="[--trail-color:theme(colors.primary.100/30)] [--path-color:theme(colors.primary.DEFAULT)] dark:[--path-color:theme(colors.primary.400)] dark:[--trail-color:theme(colors.gray.700)]"
            />
          </div>
          <Popover open={showPhotoOptions} onOpenChange={setShowPhotoOptions}>
            <PopoverTrigger asChild>
              <div className="absolute inset-0 flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-32 w-32 cursor-pointer overflow-hidden rounded-full border-4 border-white p-0.5 dark:border-gray-700">
                        <Avatar
                          className="h-full w-full"
                          key={
                            hasProfilePhoto
                              ? `avatar-${profile.image}`
                              : 'avatar-no-image'
                          }
                        >
                          {hasProfilePhoto && profile.image ? (
                            <AvatarImage
                              src={profile.image}
                              alt={profile.name || 'Profile'}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-2xl">
                            {profile.name
                              ?.split(' ')
                              .filter(Boolean)
                              .map((n) => n[0]?.toUpperCase())
                              .join('') || <Camera className="h-8 w-8" />}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TooltipTrigger>
                    {!hasProfilePhoto && (
                      <TooltipContent
                        side="bottom"
                        className="border-0 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                      >
                        <div className="text-center">
                          <p className="font-semibold">
                            Profile Image Required!
                          </p>
                          <p className="text-xs opacity-90">
                            Upload a professional photo to complete your profile
                          </p>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <div className="bg-primary dark:bg-primary-600 absolute -bottom-1 z-20 rounded-full px-4 py-1 text-xs font-semibold text-white shadow">
                  {profile.completionPercentage}%
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-2">
                {profile?.image ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleRemovePhoto}
                      className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                      <span>Remove Photo</span>
                    </button>
                    <label className="text-muted-foreground hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm dark:text-gray-300 dark:hover:bg-gray-700">
                      <Pencil className="h-4 w-4" />
                      <span>Change Photo</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="text-muted-foreground hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm dark:text-gray-300 dark:hover:bg-gray-700">
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Mandatory photo notice for partner resources - shown in tooltip instead */}

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
                  {resume?.experience?.length
                    ? `${calculateTotalExperience(resume.experience)} Years`
                    : 'Zero'}{' '}
                  years of experience
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

        {/* Share Profile Button */}
        <div className="w-full">
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <TooltipProvider>
              {!canSharePublicly ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex w-full items-center gap-2"
                          disabled
                        >
                          <Share2 className="h-4 w-4" />
                          Share Profile
                        </Button>
                      </DialogTrigger>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Profile is not published. Complete and publish your profile
                    to enable sharing.
                  </TooltipContent>
                </Tooltip>
              ) : (
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex w-full items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Profile
                  </Button>
                </DialogTrigger>
              )}
            </TooltipProvider>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Your Public Profile</DialogTitle>
                <DialogDescription>
                  {canSharePublicly
                    ? 'Share your professional profile with employers, colleagues, or on social media.'
                    : 'Complete your profile and publish it to enable sharing.'}
                </DialogDescription>
              </DialogHeader>

              {canSharePublicly ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">
                        Profile Link
                      </Label>
                      <Input
                        id="link"
                        value={publicProfileUrl}
                        readOnly
                        className="h-9"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="px-3"
                      onClick={handleCopyLink}
                    >
                      <span className="sr-only">Copy</span>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleShare}
                      className="flex flex-1 items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="flex items-center gap-2"
                    >
                      <a
                        href={publicProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Preview
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {profile.completionPercentage < 70
                        ? `Complete your profile (${profile.completionPercentage}% done) and publish it to enable sharing.`
                        : 'Publish your profile to enable public sharing.'}
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter className="sm:justify-start">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowShareDialog(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="absolute top-3 right-3">
        <div
          className={cn(
            'w-auto rounded-full border px-2 py-0.5 text-center text-xs',
            profile.isPublished
              ? 'border-primary text-primary dark:border-primary-400 dark:text-primary-400'
              : 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400'
          )}
        >
          <p className="flex items-center justify-center gap-1">
            {profile.isPublished ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span className="hidden xl:block">Published</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <span className="hidden xl:block">Not Published</span>
              </>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
};
