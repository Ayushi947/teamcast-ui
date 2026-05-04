import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { IClientProfile } from '@/lib/shared';
import {
  MapPin,
  Globe,
  Clock,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Pencil,
  Upload,
  X,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { logger } from '@/lib/shared';
import { clientProfileService } from '@/lib/services/services';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { formatEnumValue } from '@/lib/utils';

interface ProfileCardProps {
  profile: IClientProfile;
}

const getStatusUI = (status?: string) => {
  switch (status) {
    case 'VERIFIED':
      return {
        label: 'Verified',
        color:
          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        icon: <CheckCircle className="h-4 w-4" />,
      };
    case 'PENDING':
      return {
        label: 'Pending',
        color:
          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        icon: <Clock className="h-4 w-4" />,
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        icon: <XCircle className="h-4 w-4" />,
      };
    default:
      return {
        label: 'Unverified',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        icon: <AlertTriangle className="h-4 w-4" />,
      };
  }
};

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  const queryClient = useQueryClient();
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Calculate completion percentage based on profile data
  const calculateCompletionPercentage = () => {
    let completed = 0;
    const total = 8;

    if (profile.basic?.name) completed++;
    if (profile.basic?.description) completed++;
    if (profile.basic?.industry) completed++;
    if (profile.basic?.website) completed++;
    if (profile.address?.city && profile.address?.country) completed++;
    if (profile.basic?.contactEmail) completed++;
    if (profile.basic?.contactPhone) completed++;
    if (profile.social?.linkedin || profile.social?.twitter) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

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

      // Upload file using clientProfileService
      const response = await clientProfileService.uploadProfilePhoto(file);

      // Update the profile data with the logoUrl
      if (response.logoUrl) {
        const newUrl = response.logoUrl;

        // Update the profile data in the React Query cache
        await queryClient.setQueryData(['clientProfile'], (oldData: any) => ({
          ...oldData,
          basic: {
            ...oldData?.basic,
            logoUrl: newUrl,
          },
        }));
      }

      toast.success('Company logo updated successfully');
    } catch (error) {
      logger.error('Error uploading company logo:', error);
      toast.error('Failed to upload company logo');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setShowPhotoOptions(false);

      // Call the API to remove the profile logo
      await clientProfileService.deleteProfileLogo();

      // Optimistically update the cache to remove logoUrl
      queryClient.setQueryData(['clientProfile'], (oldData: any) => ({
        ...oldData,
        basic: {
          ...oldData?.basic,
          logoUrl: null,
        },
      }));

      // Invalidate and refetch the profile data to ensure UI updates
      await queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      await queryClient.refetchQueries({ queryKey: ['clientProfile'] });

      toast.success('Company logo removed successfully');
    } catch (error) {
      logger.error('Error removing company logo:', error);
      toast.error('Failed to remove company logo');
    }
  };
  const statusUI = getStatusUI(profile.verificationStatus);

  return (
    <Card className="relative flex h-full flex-1 flex-col items-center justify-center gap-2 bg-white p-4 dark:bg-gray-800">
      {/* Status Badge in top-right */}
      <div className="flex w-full justify-end">
        <Badge
          variant="secondary"
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium ${statusUI.color}`}
        >
          {statusUI.icon}
          {statusUI.label}
        </Badge>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Company logo with circular progress bar */}
        <div className="relative h-36 w-36">
          <div className="absolute inset-0">
            <CircularProgressbar
              value={completionPercentage}
              text=""
              strokeWidth={5}
              styles={{
                root: { width: '100%', height: '100%' },
                trail: { stroke: 'var(--trail-color, #D7D0F4)' },
                path: {
                  stroke: 'var(--path-color, #6E55CF)',
                  transform: 'rotate(180deg)',
                  transformOrigin: 'center',
                },
              }}
              className="[--trail-color:theme(colors.primary.100/30)] [--path-color:theme(colors.primary.DEFAULT)] dark:[--path-color:theme(colors.primary.400)] dark:[--trail-color:theme(colors.gray.700)]"
            />
          </div>
          <Popover open={showPhotoOptions} onOpenChange={setShowPhotoOptions}>
            <PopoverTrigger asChild>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white p-0.5 dark:border-gray-700">
                  {profile.basic?.logoUrl ? (
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={profile.basic.logoUrl}
                        alt={profile.basic?.name || 'Company'}
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-2xl">
                        {profile.basic?.name
                          ?.split(' ')
                          .filter(Boolean)
                          .map((n) => n[0]?.toUpperCase())
                          .join('') || 'C'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-full w-full">
                      <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-2xl">
                        {profile.basic?.name
                          ?.split(' ')
                          .filter(Boolean)
                          .map((n) => n[0]?.toUpperCase())
                          .join('') || 'C'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="bg-primary dark:bg-primary-600 absolute -bottom-1 z-20 rounded-full px-4 py-1 text-xs font-semibold text-white shadow">
                  {completionPercentage}%
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-2">
                {profile.basic?.logoUrl ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleRemovePhoto}
                      className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                      <span>Remove Logo</span>
                    </button>
                    <label className="text-muted-foreground hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm dark:text-gray-300 dark:hover:bg-gray-700">
                      <Pencil className="h-4 w-4" />
                      <span>Change Logo</span>
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
                    <span>Upload Logo</span>
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

        {/* Company info */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {profile.basic?.name || 'Company Name'}
          </h2>
          {profile.basic?.industry && (
            <div className="text-muted-foreground text-sm">
              <Badge variant="outline">
                {formatEnumValue(profile.basic.industry)}
              </Badge>
            </div>
          )}
        </div>

        {/* Company details */}
        <div className="flex w-full flex-col items-center gap-1 text-sm">
          {profile.address?.city && profile.address?.country && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>
                {profile.address.city}, {profile.address.country}
              </span>
            </div>
          )}

          {profile.basic?.website && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Globe className="h-4 w-4" />
              <a
                href={profile.basic.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary text-blue-600 hover:underline"
              >
                {profile.basic.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
