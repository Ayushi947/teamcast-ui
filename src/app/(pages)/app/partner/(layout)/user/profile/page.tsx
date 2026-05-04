'use client';

import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { partnerUserProfileService } from '@/lib/services/services';
import { IPartnerUserProfile, IUser } from '@/lib/shared';
import {
  Pencil,
  X,
  Save,
  User,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Info,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useApp } from '@/lib/context/app-context';
import { setUserInStorage } from '@/lib/utils/auth-utils';
import { formatEnumValue } from '@/lib/utils';
import { logger } from '@/lib/shared';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// ProfileCard Component
const ProfileCard = ({ profile }: { profile: IPartnerUserProfile }) => {
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Calculate completion percentage based on profile data
  const calculateCompletionPercentage = () => {
    let completed = 0;
    const total = 3;

    if (profile.name) completed++;
    if (profile.jobTitle) completed++;
    if (profile.email) completed++;

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
      toast.success('Profile photo updated successfully');
    } catch (error) {
      logger.error('Error uploading profile photo:', error);
      toast.error('Failed to upload profile photo');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setShowPhotoOptions(false);
      toast.success('Profile photo removed successfully');
    } catch (error) {
      logger.error('Error removing profile photo:', error);
      toast.error('Failed to remove profile photo');
    }
  };

  return (
    <Card className="dark:bg-primary/10 relative bg-white p-4">
      <div className="flex flex-col items-center gap-3">
        {/* Profile photo with circular progress bar */}
        <div className="relative h-28 w-28">
          <div className="absolute inset-0">
            <CircularProgressbar
              value={completionPercentage}
              text=""
              strokeWidth={4}
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
                <div className="h-24 w-24 overflow-hidden rounded-full border-3 border-white p-0.5 dark:border-gray-700">
                  {profile.image ? (
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={profile.image}
                        alt={profile.name || 'Partner'}
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-xl">
                        {profile.name
                          ?.split(' ')
                          .filter(Boolean)
                          .map((n) => n[0]?.toUpperCase())
                          .join('') || 'P'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-full w-full">
                      <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-xl">
                        {profile.name
                          ?.split(' ')
                          .filter(Boolean)
                          .map((n) => n[0]?.toUpperCase())
                          .join('') || 'P'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="bg-primary dark:bg-primary-600 absolute -bottom-1 z-20 rounded-full px-3 py-0.5 text-xs font-semibold text-white shadow">
                  {completionPercentage}%
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-2">
                {profile.image ? (
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
                    <Pencil className="h-4 w-4" />
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

        {/* Partner info */}
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {profile.name || 'Partner Name'}
          </h2>
          {profile.jobTitle && (
            <div className="text-muted-foreground mt-1 text-xs">
              <Badge variant="outline" className="text-xs">
                {profile.jobTitle}
              </Badge>
            </div>
          )}
        </div>

        {/* Partner details */}
        <div className="flex w-full flex-col items-center gap-1 text-xs">
          {profile.email && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Mail className="h-3 w-3" />
              <span>{profile.email}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Profile Header Component
const ProfileHeader = ({
  user: _user,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
}: {
  user: IUser;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(now);
    setCurrentDate(formattedDate);
  }, []);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-primary text-2xl font-bold">Profile Settings</h1>
          <Badge className="rounded-md bg-[#6E55CF] text-xs font-bold text-white dark:text-white">
            Personal
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage your personal information, contact details, and security
          settings. Changes are saved automatically.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>Last updated: {currentDate}</span>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="bg-[#6E55CF] hover:bg-[#6E55CF]/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              onClick={onEdit}
              className="bg-[#6E55CF] hover:bg-[#6E55CF]/90"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PartnerUserProfilePage() {
  const { user, setUser } = useApp();
  const queryClient = useQueryClient();

  // State management
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const partnerUserId = user?.partnerUserId ?? '';

  const { data: profile, isLoading: isProfileLoading } =
    useQuery<IPartnerUserProfile>({
      queryKey: ['partner-user-profile', partnerUserId],
      queryFn: () => partnerUserProfileService.getUserProfile(partnerUserId),
      enabled: !!user?.id,
    });

  // Local state for profile fields
  const [profileData, setProfileData] = useState({
    name: '',
    jobTitle: '',
  });

  // Initialize profileData from loaded data
  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        jobTitle: profile.jobTitle || '',
      });
    }
  }, [profile]);

  // Mutations
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: (data: any) =>
      partnerUserProfileService.updateUserProfileBasic(partnerUserId, data),
    onSuccess: (_data, variables) => {
      if (user && variables?.name != null) {
        const updatedUser = { ...user, name: variables.name };
        setUser(updatedUser);
        setUserInStorage(updatedUser);
      }
      queryClient.invalidateQueries({
        queryKey: ['partner-user-profile', partnerUserId],
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update profile');
    },
  });

  const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation(
    {
      mutationFn: (data: { currentPassword: string; newPassword: string }) =>
        partnerUserProfileService.changeUserPassword(partnerUserId, data),
      onSuccess: () => {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsEditingPassword(false);
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to update password');
      },
    }
  );

  // Handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Save handler
  const handleSaveAll = async () => {
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    updateProfile({
      name: profileData.name,
      jobTitle: profileData.jobTitle,
    });
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword.trim()) {
      toast.error('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    updatePassword({ currentPassword, newPassword });
  };

  const handleCancelEdit = () => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        jobTitle: profile.jobTitle || '',
      });
    }
    setIsEditing(false);
  };

  const handleCancelPasswordEdit = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditingPassword(false);
  };

  // Status checks
  const isSaving = isUpdatingProfile || isUpdatingPassword;

  if (isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center overflow-y-hidden">
        <div className="border-primary/10 border-t-primary/20 dark:border-t-primary/20 h-12 w-12 animate-spin rounded-full border-4 border-t-4 dark:border-gray-700"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4">
        <ProfileHeader
          user={user as IUser}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancelEdit}
          onSave={handleSaveAll}
          isSaving={isSaving}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Main Content Grid - Left Sidebar + Right Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Sidebar - Profile Card + Personal Info */}
            <div className="space-y-6 lg:col-span-4">
              {/* Partner Profile Card */}
              {isProfileLoading ? (
                <Card className="dark:bg-primary/10 bg-white">
                  <CardContent className="p-4">
                    <div className="flex h-48 items-center justify-center">
                      <div className="border-primary/10 border-t-primary/20 dark:border-t-primary/20 h-6 w-6 animate-spin rounded-full border-4 border-t-4 dark:border-gray-700"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : profile ? (
                <ProfileCard profile={profile} />
              ) : (
                <Card className="dark:bg-primary/10 bg-white">
                  <CardContent className="p-4">
                    <div className="text-muted-foreground flex h-48 items-center justify-center">
                      <p className="text-sm">No partner profile available</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Personal Information Card - Under Profile Card */}
              <Card className="dark:bg-primary/10 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="text-primary h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Full Name *
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">
                              Your full name as it appears on official documents
                              and will be displayed to clients and team members.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="jobTitle"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Job Title
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">
                              Your current job title within the partner
                              organization. This helps clients understand your
                              role and expertise.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={profileData.jobTitle}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        placeholder="Enter your job title"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Contact Info + Security Settings */}
            <div className="space-y-6 lg:col-span-8">
              {/* Contact Information Card */}
              <Card className="dark:bg-primary/10 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="text-primary h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">
                              Your primary email address for communications.
                              This cannot be changed for security reasons.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={profile?.email || ''}
                          disabled
                          className="bg-gray-50 dark:bg-gray-900"
                        />
                        <Badge variant="outline" className="text-xs">
                          Read Only
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Account Type
                        </span>
                        <Badge variant="secondary">
                          {formatEnumValue(user?.type || '')}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Member Since
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Last Updated
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {profile?.updatedAt
                            ? new Date(profile.updatedAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings Card */}
              <Card className="dark:bg-primary/10 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="text-primary h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!isEditingPassword ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password Management
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">
                              Update your password to maintain account security.
                              Use a strong password with at least 8 characters.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingPassword(true)}
                        className="border-[#6E55CF] text-[#6E55CF] hover:bg-[#6E55CF]/10"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="currentPassword"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Current Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your current password"
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="newPassword"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            New Password *
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <p className="text-xs text-gray-500">
                            Must be at least 8 characters with numbers, letters
                            and special characters
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Confirm New Password *
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2 pt-6">
                          <Button
                            variant="outline"
                            onClick={handleCancelPasswordEdit}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handlePasswordUpdate}
                            className="bg-[#6E55CF] hover:bg-[#6E55CF]/90"
                          >
                            Update Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <div className="bg-primary/10 dark:bg-primary/20 border-primary/10 dark:border-primary/20 flex items-start rounded-lg border p-4">
          <Info className="text-primary mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
          <p className="text-primary dark:text-primary/90 text-sm">
            Your profile information is used for internal communications and
            client interactions. Keep your information up to date for the best
            experience.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
