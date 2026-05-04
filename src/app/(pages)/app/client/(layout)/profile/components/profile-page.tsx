'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import { clientProfileService } from '@/lib/services/services';
import {
  IClientProfile,
  IClientProfileBasicUpdate,
  logger,
} from '@/lib/shared';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useCreateNotification,
  createNotificationHelpers,
} from '@/lib/services/notification.service';

// Import new modular components
import { ProfileHeader } from './profile-header';
import { ProfileCard } from './profile-card';
import { CompanySummary } from './company-summary';
import { CompanyDetails } from './company-details';
import { LoadingOverlay } from './loading-overlay';
import { CompanyBasicInfoEdit } from './company-basic-info-edit';

const ClientProfilePage = () => {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, _setIsLoading] = useState(false);
  const [loadingMessage, _setLoadingMessage] = useState('');

  const createNotification = useCreateNotification();
  const notificationHelpers = createNotificationHelpers(createNotification);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [phoneValidationError, setPhoneValidationError] = useState<
    string | null
  >(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    industry: '',
    companyType: '',
    size: '',
    stage: '',
    foundedYear: 0,
    website: '',
    contactEmail: '',
    contactPhone: '',
    contactName: '',
  });

  const { data: profile, isLoading: isProfileLoading } =
    useQuery<IClientProfile>({
      queryKey: ['clientProfile'],
      queryFn: () => clientProfileService.getProfile(),
    });

  const updateProfileMutation = useMutation({
    mutationFn: (data: IClientProfileBasicUpdate) =>
      clientProfileService.updateBasicProfile(data as any),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      toast.success('Company profile updated successfully');
      setShowEditModal(false);

      // Send notification for profile update
      if (user?.id) {
        await notificationHelpers.profileUpdate(user.id, 'client', {
          action: 'Company profile updated',
          section: 'Basic Information',
        });
      }
    },
    onError: async (error: Error) => {
      toast.error('Failed to update company profile');
      logger.error(error, 'Failed to update company profile');

      // Send error notification
      if (user?.id) {
        await createNotification({
          userId: user.id,
          userType: 'client',
          title: 'Profile Update Failed',
          message:
            'There was an error updating your company profile. Please try again.',
          type: 'error',
          priority: 'medium',
        });
      }
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (editFormData.website && !editFormData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (
      editFormData.contactEmail &&
      !editFormData.contactEmail.match(/^\S+@\S+\.\S+$/)
    ) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof editFormData, value: any) => {
    setEditFormData({ ...editFormData, [field]: value });
    if (touched[field]) {
      validateForm();
    }
  };

  const handleBlur = (field: keyof typeof editFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched((prev) => ({
      ...prev,
      ...Object.keys(editFormData).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      ),
    }));

    if (!validateForm()) {
      setFormErrors((prev) => ({
        ...prev,
        form: 'Please fix the errors in the form before submitting',
      }));
      return;
    }

    try {
      // Prepare the profile update data
      const profileUpdate: IClientProfileBasicUpdate = {
        name: editFormData.name,
        description: editFormData.description,
        industry: editFormData.industry as any,
        companyType: editFormData.companyType as any,
        size: editFormData.size as any,
        stage: editFormData.stage as any,
        foundedYear: editFormData.foundedYear,
        website: editFormData.website,
        contactEmail: editFormData.contactEmail,
        contactPhone: editFormData.contactPhone,
        contactName: editFormData.contactName,
        benefits: [], // Keep existing benefits for now
      };

      await updateProfileMutation.mutateAsync(profileUpdate);
    } catch (error) {
      logger.error(error, 'Failed to update company profile');
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      name: profile?.basic?.name || '',
      description: profile?.basic?.description || '',
      industry: profile?.basic?.industry || '',
      companyType: profile?.basic?.companyType || '',
      size: profile?.basic?.size || '',
      stage: profile?.basic?.stage || '',
      foundedYear: profile?.basic?.foundedYear || 0,
      website: profile?.basic?.website || '',
      contactEmail: profile?.basic?.contactEmail || '',
      contactPhone: profile?.basic?.contactPhone || '',
      contactName: profile?.basic?.contactName || '',
    });
    setShowEditModal(true);
  };

  const handleFormSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
    await queryClient.refetchQueries({ queryKey: ['clientProfile'] });
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">Loading company profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">No profile data available</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-6 px-4 pt-2 pb-10">
        {/* Header */}
        <ProfileHeader />

        {/* Profile info and Company summary */}
        <div className="flex h-full w-full flex-col gap-4 md:min-h-[1px] md:flex-row md:items-stretch">
          {/* Profile info */}
          <div className="flex w-full basis-1/4 md:flex-col">
            <ProfileCard profile={profile} />
          </div>
          {/* Company Summary */}
          <div className="w-full md:flex-1">
            <CompanySummary profile={profile} onEditClick={handleEditClick} />
          </div>
        </div>

        {/* Company Details */}
        <CompanyDetails
          clientProfile={profile}
          onFormSuccess={handleFormSuccess}
        />
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} loadingMessage={loadingMessage} />

      {/* Edit Dialog */}
      <CompanyBasicInfoEdit
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        formErrors={formErrors}
        touched={touched}
        editFormData={editFormData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        handleEditSubmit={handleEditSubmit}
        updateProfileMutation={updateProfileMutation}
        phoneValidationError={phoneValidationError}
        setPhoneValidationError={setPhoneValidationError}
      />
    </>
  );
};

export default ClientProfilePage;
