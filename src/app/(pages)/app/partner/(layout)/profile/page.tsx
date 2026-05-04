'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactPhoneInput } from '@/components/ui/contact-phone-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Users,
  Calendar,
  Target,
  Gift,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Laptop,
  Coffee,
  Home,
  Building,
  User,
  Briefcase,
  Repeat,
  Zap,
  LayoutGrid,
  Youtube,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Github,
  Upload,
  FileText,
  DollarSign,
  PlusCircle,
  Download,
  Trash2,
  CreditCard,
  Eye,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CompanyTypeEnum,
  CompanyIndustryEnum,
  CompanySizeEnum,
  CompanyStageEnum,
  IPartnerProfileAddress,
  IPartnerProfileBasic,
  PartnerProfileApiService,
  IPartnerProfileShippingAddress,
  IPartnerProfileBillingAddress,
  IPartnerBankAccount,
  IPartnerBankAccountCreate,
  IPartnerProfile,
  IPartnerDocument,
  IPartnerFinancialDataUpdate,
} from '@/lib/shared';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';
import LogoIcon from '@/components/icons/LogoIcon';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationSelector } from '@/components/ui/location-selector';

import { partnerDocumentService } from '@/lib/services/services';
import { getUser } from '@/lib/utils/auth-utils';

// Create a new instance of the service
const partnerProfileService = new PartnerProfileApiService(apiClient);

// Update the utility functions to use predefined enums
const companyTypeOptions = [
  { label: 'Startup', value: CompanyTypeEnum.STARTUP },
  { label: 'Scale Up', value: CompanyTypeEnum.SCALE_UP },
  { label: 'Enterprise', value: CompanyTypeEnum.ENTERPRISE },
  { label: 'Agency', value: CompanyTypeEnum.AGENCY },
  { label: 'Consulting', value: CompanyTypeEnum.CONSULTING },
];

const industryOptions = [
  { label: 'Technology', value: CompanyIndustryEnum.TECHNOLOGY },
  { label: 'Healthcare', value: CompanyIndustryEnum.HEALTHCARE },
  { label: 'Finance', value: CompanyIndustryEnum.FINANCE },
  { label: 'Education', value: CompanyIndustryEnum.EDUCATION },
  { label: 'Retail', value: CompanyIndustryEnum.RETAIL },
  { label: 'Other', value: CompanyIndustryEnum.OTHER },
];

const sizeOptions = [
  { label: '1-10', value: CompanySizeEnum.ONE_TO_TEN },
  { label: '11-50', value: CompanySizeEnum.ELEVEN_TO_FIFTY },
  { label: '51-200', value: CompanySizeEnum.FIFTY_ONE_TO_TWO_HUNDRED },
  { label: '201-500', value: CompanySizeEnum.TWO_HUNDRED_ONE_TO_FIVE_HUNDRED },
  { label: '501-1000', value: CompanySizeEnum.FIVE_HUNDRED_ONE_TO_THOUSAND },
  { label: '1000+', value: CompanySizeEnum.OVER_THOUSAND },
];

const stageOptions = [
  { label: 'Seed', value: CompanyStageEnum.SEED },
  { label: 'Early Stage', value: CompanyStageEnum.EARLY_STAGE },
  { label: 'Growth', value: CompanyStageEnum.GROWTH },
  { label: 'Mature', value: CompanyStageEnum.MATURE },
  { label: 'Enterprise', value: CompanyStageEnum.ENTERPRISE },
];

// Add these constants at the top of the file after imports
const WORK_ENVIRONMENT_CATEGORIES = {
  workSetup: {
    title: 'Work Setup',
    icon: Building,
    options: ['REMOTE', 'HYBRID', 'ON_SITE', 'FLEXIBLE'],
  },
  officeCulture: {
    title: 'Office Culture',
    icon: Coffee,
    options: ['CASUAL', 'FORMAL', 'STARTUP', 'CORPORATE'],
  },
  teamStructure: {
    title: 'Team Structure',
    icon: Users,
    options: ['COLLABORATIVE', 'INDEPENDENT', 'CROSS_FUNCTIONAL', 'AGILE'],
  },
  workLifeBalance: {
    title: 'Work-Life Balance',
    icon: Clock,
    options: [
      'FLEXIBLE_HOURS',
      'WORK_LIFE_BALANCE',
      'FAST_PACED',
      'STRUCTURED',
    ],
  },
};

// Add formatEnumValue function back as it's still needed
const formatEnumValue = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const MediaPreview = ({
  previewDocumentUrl,
  isLoading,
  error,
}: {
  previewDocumentUrl: string;
  isLoading?: boolean;
  error?: string | null;
}) => {
  const isPdf = useMemo(() => {
    return previewDocumentUrl?.toLowerCase().includes('.pdf');
  }, [previewDocumentUrl]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-muted-foreground mt-4 text-sm">
            Loading document preview...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-50 dark:bg-gray-900">
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold">Error Loading Preview</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!previewDocumentUrl) return null;

  return (
    <div className="flex h-full w-full items-center justify-center rounded-md">
      {isPdf ? (
        <iframe
          src={previewDocumentUrl}
          title="PDF Preview"
          className="h-full w-full rounded-md border-0"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-4">
          <img
            src={previewDocumentUrl}
            alt="Document Preview"
            className="max-h-full max-w-full rounded-md object-contain shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default function ProfilePage() {
  const [isEditBasicOpen, setIsEditBasicOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isEditBillingAddressOpen, setIsEditBillingAddressOpen] =
    useState(false);
  const [isEditShippingAddressOpen, setIsEditShippingAddressOpen] =
    useState(false);
  const [isEditSocialOpen, setIsEditSocialOpen] = useState(false);
  const [isEditCultureOpen, setIsEditCultureOpen] = useState(false);
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
  const [isEditFinancialOpen, setIsEditFinancialOpen] = useState(false);
  const [isAddBankAccountOpen, setIsAddBankAccountOpen] = useState(false);
  const [isPreviewDocumentOpen, setIsPreviewDocumentOpen] = useState(false);
  const [isDeleteDocumentOpen, setIsDeleteDocumentOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string>('');
  const [isDeleteBankAccountOpen, setIsDeleteBankAccountOpen] = useState(false);
  const [bankAccountToDelete, setBankAccountToDelete] = useState<string>('');
  const [previewDocumentUrl, setPreviewDocumentUrl] = useState<string>('');
  const [bankAccountForm, setBankAccountForm] =
    useState<IPartnerBankAccountCreate>({
      accountName: '',
      accountNumber: '',
      bankName: '',
      swiftCode: '',
      isDefault: false,
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentForm, setDocumentForm] = useState<Partial<IPartnerDocument>>({
    name: '',
    type: '',
  });

  // Form states
  const [basicForm, setBasicForm] = useState<Partial<IPartnerProfileBasic>>({});
  const [phoneValidationError, setPhoneValidationError] = useState<
    string | null
  >(null);
  const [addressForm, setAddressForm] = useState<
    Partial<IPartnerProfileAddress>
  >({});
  const [billingAddressForm, setBillingAddressForm] = useState<
    Partial<IPartnerProfileBillingAddress>
  >({});
  const [shippingAddressForm, setShippingAddressForm] = useState<
    Partial<IPartnerProfileShippingAddress>
  >({});
  const [socialForm, setSocialForm] = useState<
    Partial<IPartnerProfile['social']>
  >({});
  const [cultureForm, setCultureForm] = useState<
    Partial<IPartnerProfile['culture']>
  >({});
  const [financialDataForm, setFinancialDataForm] = useState<
    Partial<IPartnerFinancialDataUpdate>
  >({});
  const user = getUser();

  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<IPartnerProfile>({
    queryKey: ['partner-profile'],
    queryFn: async () => {
      const response = await partnerProfileService.getProfile();
      return response as IPartnerProfile;
    },
    retry: 1,
  });

  useEffect(() => {
    if (!isPreviewDocumentOpen && previewDocumentUrl) {
      URL.revokeObjectURL(previewDocumentUrl);
      setPreviewDocumentUrl('');
    }
  }, [isPreviewDocumentOpen, previewDocumentUrl]);

  useEffect(() => {
    if (profile) {
      setBasicForm(profile.basic);
      setAddressForm(profile.address);
      setBillingAddressForm(
        (profile.billingAddress as IPartnerProfileBillingAddress) || {}
      );
      setShippingAddressForm(
        (profile.shippingAddress as IPartnerProfileShippingAddress) || {}
      );
      setSocialForm(profile.social);
      setCultureForm(profile.culture);
      setFinancialDataForm({
        annualRevenue: profile.financialData?.annualRevenue,
        taxId: profile.financialData?.taxId,
        vatNumber: profile.financialData?.vatNumber,
        gstNumber: profile.financialData?.gstNumber,
      });
    }
  }, [profile]);

  const updateBasicMutation = useMutation({
    mutationFn: async (data: Partial<IPartnerProfile['basic']>) => {
      const validatedData = Object.entries(data).reduce(
        (acc, [key, value]) => {
          // Include all values, including empty strings and null, but exclude undefined
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      return await partnerProfileService.updateBasicProfile(
        validatedData as IPartnerProfile['basic']
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsEditBasicOpen(false);
      setSelectedImage(null);
      setImagePreview(null);
      setBasicForm({});
      toast.success('Basic information updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update basic information');
      logger.error('Error updating basic information', error);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: (data: Partial<IPartnerProfileAddress>) =>
      partnerProfileService.updateAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsEditAddressOpen(false);
      setAddressForm({});
      toast.success('Address updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update address');
      logger.error('Error updating address', error);
    },
  });

  const updateBillingAddressMutation = useMutation({
    mutationFn: async (data: Partial<IPartnerProfileBillingAddress>) => {
      logger.debug('Billing address data', data);
      return await partnerProfileService.updateBillingAddress(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsEditBillingAddressOpen(false);
      setBillingAddressForm({});
      toast.success('Billing address updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update billing address');
      logger.error('Error updating billing address:', error);
    },
  });

  const updateShippingAddressMutation = useMutation({
    mutationFn: async (data: Partial<IPartnerProfileShippingAddress>) => {
      logger.debug('Shipping address data', data);
      return await partnerProfileService.updateShippingAddress(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsEditShippingAddressOpen(false);
      setShippingAddressForm({});
      toast.success('Shipping address updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update shipping address');
      logger.error('Error updating shipping address:', error);
    },
  });

  const updateSocialMutation = useMutation({
    mutationFn: async (data: Partial<IPartnerProfile['social']>) => {
      const validatedData = Object.entries(data).reduce(
        (acc, [key, value]) => {
          // Include all values, including empty strings, but exclude undefined
          if (value !== undefined) {
            // If value is not empty, add https if needed
            if (value && value.trim() !== '') {
              acc[key] = value.startsWith('https') ? value : `https://${value}`;
            } else {
              // Send empty string to clear the field
              acc[key] = '';
            }
          }
          return acc;
        },
        {} as Record<string, string>
      );

      return await partnerProfileService.updateSocialProfile(validatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsEditSocialOpen(false);
      setSocialForm({});
      toast.success('Social profiles updated successfully');
    },
    onError: (error) => {
      toast.error(
        'Failed to update social profiles. Please check the URLs are valid.'
      );
      logger.error('Error updating social profiles', error);
    },
  });

  const updateCultureMutation = useMutation({
    mutationFn: async (data: Partial<IPartnerProfile['culture']>) => {
      const validatedData = Object.entries(data).reduce(
        (acc, [key, value]) => {
          // Include all values, including empty strings and null, but exclude undefined
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      return await partnerProfileService.updateCulture(
        validatedData as IPartnerProfile['culture']
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsEditCultureOpen(false);
      setCultureForm({});
      toast.success('Culture information updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update culture information');
      logger.error('Error updating culture information', error);
    },
  });

  const updateFinancialDataMutation = useMutation({
    mutationFn: async (data: IPartnerFinancialDataUpdate) => {
      const response = await partnerProfileService.updateFinancialData(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsEditFinancialOpen(false);
      setFinancialDataForm({});
      toast.success('Financial information updated successfully');
    },
    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as any;
        logger.error('Server responded with:', err.response?.data);
      }
      toast.error('Failed to update financial information');
    },
  });

  const addBankAccountMutation = useMutation({
    mutationFn: async (data: IPartnerBankAccountCreate) => {
      return await partnerProfileService.addBankAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsAddBankAccountOpen(false);
      setBankAccountForm({
        accountName: '',
        accountNumber: '',
        bankName: '',
        swiftCode: '',
        isDefault: false,
      });
      toast.success('Bank account added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add bank account');
      logger.error('Error adding bank account:', error);
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: { file: File; name: string; type: string }) => {
      if (!user?.partnerId) {
        throw new Error('PartnerId not available');
      }

      try {
        const response = await partnerDocumentService.uploadPartnerDocument(
          user.partnerId,
          {
            file: data.file,
            name: data.name,
            documentType: data.type,
          }
        );

        return response;
      } catch (error) {
        logger.error('Upload error details:', error);

        // More detailed error handling
        if (error instanceof Error) {
          throw new Error(`Upload failed: ${error.message}`);
        }

        if (typeof error === 'object' && error !== null) {
          const errorObj = error as any;
          if (errorObj.response?.data?.message) {
            throw new Error(`Upload failed: ${errorObj.response.data.message}`);
          }
          if (errorObj.response?.status) {
            throw new Error(
              `Upload failed with status ${errorObj.response.status}`
            );
          }
        }

        throw new Error('Upload failed with unknown error');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsUploadDocumentOpen(false);
      setSelectedFile(null);
      setDocumentForm({ name: '', type: '' });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload document';
      toast.error(errorMessage);
      logger.error('Error uploading document:', error);
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      if (!user?.partnerId) {
        throw new Error('PartnerId not available');
      }
      const response = await partnerDocumentService.deletePartnerDocument(
        user.partnerId,
        documentId
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete document';
      toast.error(errorMessage);
      logger.error('Error deleting document:', error);
    },
  });

  const previewDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      if (!user?.partnerId) {
        throw new Error('PartnerId not available');
      }

      const response = await partnerDocumentService.getPartnerDocumentPreview(
        user.partnerId,
        documentId
      );

      return response;
    },

    onSuccess: (data) => {
      const downloadUrl = data.downloadUrl;
      if (!downloadUrl) {
        toast.error('Preview URL not found in response.');
        return;
      }

      setPreviewDocumentUrl(downloadUrl);
      setIsPreviewDocumentOpen(true);
    },

    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        (error instanceof Error ? error.message : 'Failed to preview document');
      toast.error(errorMessage);
      logger.error('Error previewing document:', error);
      setIsPreviewDocumentOpen(true);
    },
  });

  const downloadDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      if (!user?.partnerId) {
        throw new Error('PartnerId not available');
      }
      const response = await partnerDocumentService.getPartnerDocumentPreview(
        user.partnerId,
        documentId
      );
      return { ...response, documentId };
    },
    onSuccess: (data) => {
      const downloadUrl = data.downloadUrl;
      const documentId = data.documentId;
      const link = document.createElement('a');
      link.href = downloadUrl;

      const documentName =
        profile?.documents?.find((doc) => doc.id === documentId)?.name ||
        'document';
      link.download = documentName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to download document';
      toast.error(errorMessage);
      logger.error('Error downloading document:', error);
    },
  });

  const deleteBankAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      await partnerProfileService.deleteBankAccount(accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      toast.success('Bank account deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete bank account');
      logger.error('Error deleting bank account:', error);
    },
  });

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If there's a selected image, upload it first
    if (selectedImage) {
      try {
        const uploadResponse =
          await partnerProfileService.uploadProfilePhoto(selectedImage);
        // Update the basicForm with the new logo URL
        setBasicForm((prev) => ({
          ...prev,
          logoUrl: uploadResponse.logoUrl,
        }));

        // Submit the form with the updated logo URL
        updateBasicMutation.mutate({
          ...basicForm,
          logoUrl: uploadResponse.logoUrl,
        });
      } catch (error) {
        toast.error('Failed to upload profile photo');
        logger.error('Error uploading profile photo:', error);
        return;
      }
    } else {
      // No image selected, just submit the form as is
      updateBasicMutation.mutate(basicForm);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAddressMutation.mutate(addressForm);
  };

  const handleBillingAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBillingAddressMutation.mutateAsync(billingAddressForm);
  };

  const handleShippingAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShippingAddressMutation.mutateAsync(shippingAddressForm);
  };

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSocialMutation.mutate(socialForm);
  };

  const handleCultureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCultureMutation.mutate(cultureForm);
  };
  const handleFinancialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const financialDataPayload: IPartnerFinancialDataUpdate = {
      ...financialDataForm,
      bankAccounts: profile?.financialData?.bankAccounts || [],
    };
    updateFinancialDataMutation.mutate(financialDataPayload);
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (bankAccountForm) {
      addBankAccountMutation.mutate(bankAccountForm);
    }
  };
  const handleDocumentUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!user?.partnerId) {
      toast.error('Partner ID not found. Please log in again.');
      return;
    }
    if (!documentForm.name?.trim()) {
      toast.error('Please enter a document name');
      return;
    }
    if (!documentForm.type) {
      toast.error('Please select a document type');
      return;
    }

    uploadDocumentMutation.mutate({
      file: selectedFile,
      name: documentForm.name.trim(),
      type: documentForm.type,
    });
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocumentToDelete(documentId);
    setIsDeleteDocumentOpen(true);
  };

  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete);
      setIsDeleteDocumentOpen(false);
    }
  };

  const handlePreviewDocument = (documentId: string) => {
    previewDocumentMutation.mutate(documentId);
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate name field with filename (without extension)
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setDocumentForm((prev) => ({
        ...prev,
        name: nameWithoutExtension,
      }));
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteBankAccount = (accountId: string) => {
    setBankAccountToDelete(accountId);
    setIsDeleteBankAccountOpen(true);
  };

  const confirmDeleteBankAccount = () => {
    if (bankAccountToDelete) {
      deleteBankAccountMutation.mutate(bankAccountToDelete);
      setIsDeleteBankAccountOpen(false);
    }
  };

  const handleDownloadDocument = (documentId: string) => {
    downloadDocumentMutation.mutate(documentId);
  };
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Company Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your company information and settings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6">
        {/* Basic Information Card */}
        <Card className="col-span-2 overflow-hidden">
          <CardHeader className="bg-muted/50 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditBasicOpen(true)}
              >
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="dark:bg-accent bg-white p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="bg-muted flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl">
                    {profile?.basic?.logoUrl ? (
                      <img
                        src={profile.basic.logoUrl}
                        alt="Company logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <LogoIcon className="text-muted-foreground h-12 w-12" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">
                    {profile?.basic?.name}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {profile?.basic?.industry
                      ? formatEnumValue(profile?.basic?.industry)
                      : ''}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="text-muted-foreground h-4 w-4" />
                        <a
                          href={profile?.basic?.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {profile?.basic?.website}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">
                          {profile?.basic?.contactEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">
                          {profile?.basic?.contactPhone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Company Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">
                          {profile?.basic?.companyType
                            ? formatEnumValue(profile?.basic?.companyType)
                            : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">
                          {profile?.basic?.size
                            ? formatEnumValue(profile?.basic?.size)
                            : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">
                          Founded in {profile?.basic?.foundedYear}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">
                          {profile?.basic?.stage
                            ? formatEnumValue(profile?.basic?.stage)
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <p className="text-muted-foreground text-sm">
                    {profile?.basic?.description}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.basic?.benefits?.map((benefit) => (
                      <Badge key={benefit} variant="secondary">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Addresses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Primary Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Primary Address</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditAddressOpen(true)}
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">
                      {profile?.address?.address}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {profile?.address?.city}, {profile?.address?.state}{' '}
                      {profile?.address?.zipCode}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {profile?.address?.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Billing Address</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditBillingAddressOpen(true)}
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div>
                    {profile?.billingAddress ? (
                      <>
                        <p className="text-sm font-medium">
                          {profile?.billingAddress?.billingAddress}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {profile?.billingAddress?.billingCity},{' '}
                          {profile?.billingAddress?.billingState}{' '}
                          {profile?.billingAddress?.billingZipCode}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {profile?.billingAddress?.billingCountry}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No billing address set
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Shipping Address</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditShippingAddressOpen(true)}
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div>
                    {profile?.shippingAddress ? (
                      <>
                        <p className="text-sm font-medium">
                          {profile?.shippingAddress?.shippingAddress}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {profile?.shippingAddress?.shippingCity},{' '}
                          {profile?.shippingAddress?.shippingState}{' '}
                          {profile?.shippingAddress?.shippingZipCode}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {profile?.shippingAddress?.shippingCountry}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No shipping address set
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Profiles Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Social Presence</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditSocialOpen(true)}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {profile?.social?.linkedin && (
                <a
                  href={profile.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-3 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="text-sm">LinkedIn Profile</span>
                </a>
              )}
              {profile?.social?.twitter && (
                <a
                  href={profile.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-3 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="text-sm">Twitter Profile</span>
                </a>
              )}
              {profile?.social?.facebook && (
                <a
                  href={profile.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-3 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="text-sm">Facebook Profile</span>
                </a>
              )}
              {profile?.social?.instagram && (
                <a
                  href={profile.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-3 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="text-sm">Instagram Profile</span>
                </a>
              )}
              {profile?.social?.github && (
                <a
                  href={profile.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-3 transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="text-sm">GitHub Profile</span>
                </a>
              )}
              {profile?.social?.youtube && (
                <a
                  href={profile.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-3 transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                  <span className="text-sm">YouTube Channel</span>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Culture Card */}
        <Card className="col-span-2 overflow-hidden">
          <CardHeader className="bg-muted/50 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Company Culture</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  Share your company&apos;s mission, values, and work
                  environment
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditCultureOpen(true)}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-8">
              {/* Mission & Vision Section */}
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="text-muted-foreground h-5 w-5" />
                    <h4 className="font-medium">Mission Statement</h4>
                  </div>
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <p className="text-muted-foreground text-sm">
                      {profile?.culture?.mission ||
                        'No mission statement added yet'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="text-muted-foreground h-5 w-5" />
                    <h4 className="font-medium">Vision Statement</h4>
                  </div>
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <p className="text-muted-foreground text-sm">
                      {profile?.culture?.vision ||
                        'No vision statement added yet'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Values & Perks Section */}
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="text-muted-foreground h-5 w-5" />
                    <h4 className="font-medium">Core Values</h4>
                  </div>
                  <div className="rounded-lg border p-4">
                    {profile?.culture?.values &&
                    profile.culture.values.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.culture.values.map((value) => (
                          <Badge key={value} variant="secondary">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No core values added yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gift className="text-muted-foreground h-5 w-5" />
                    <h4 className="font-medium">Perks & Benefits</h4>
                  </div>
                  <div className="rounded-lg border p-4">
                    {profile?.culture?.perks &&
                    profile.culture.perks.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.culture.perks.map((perk) => (
                          <Badge key={perk} variant="secondary">
                            {perk}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No perks added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Environment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="text-muted-foreground h-5 w-5" />
                  <h4 className="font-medium">Work Environment</h4>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {Object.entries(WORK_ENVIRONMENT_CATEGORIES).map(
                    ([key, category]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {React.createElement(category.icon, {
                            className: 'h-4 w-4 text-muted-foreground',
                          })}
                          <h5 className="text-muted-foreground text-sm font-medium">
                            {category.title}
                          </h5>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="flex flex-wrap gap-2">
                            {profile?.culture?.workEnvironment
                              ?.filter((env) => category.options.includes(env))
                              .map((env) => (
                                <div
                                  key={env}
                                  className="bg-muted/50 flex items-center gap-2 rounded-lg border px-3 py-1.5"
                                >
                                  {env === 'REMOTE' && (
                                    <Home className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'HYBRID' && (
                                    <Laptop className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'ON_SITE' && (
                                    <Building className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'FLEXIBLE' && (
                                    <Clock className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'CASUAL' && (
                                    <Coffee className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'FORMAL' && (
                                    <Briefcase className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'STARTUP' && (
                                    <Laptop className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'CORPORATE' && (
                                    <Building className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'COLLABORATIVE' && (
                                    <Users className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'INDEPENDENT' && (
                                    <User className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'CROSS_FUNCTIONAL' && (
                                    <Users className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'AGILE' && (
                                    <Repeat className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'FLEXIBLE_HOURS' && (
                                    <Clock className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'WORK_LIFE_BALANCE' && (
                                    <Home className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'FAST_PACED' && (
                                    <Zap className="text-muted-foreground h-4 w-4" />
                                  )}
                                  {env === 'STRUCTURED' && (
                                    <LayoutGrid className="text-muted-foreground h-4 w-4" />
                                  )}
                                  <span className="text-sm">
                                    {formatEnumValue(env)}
                                  </span>
                                </div>
                              ))}
                          </div>
                          {(!profile?.culture?.workEnvironment ||
                            !profile.culture.workEnvironment.some((env) =>
                              category.options.includes(env)
                            )) && (
                            <p className="text-muted-foreground text-sm">
                              No {category.title.toLowerCase()} options selected
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Documents</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  Manage company documents and certificates
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUploadDocumentOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">Loading documents...</p>
                </div>
              ) : profile?.documents && profile.documents.length > 0 ? (
                profile.documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-muted-foreground h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">{document.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {document.type} •{' '}
                          {(document.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewDocument(document.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleDownloadDocument(document.id);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">
                    No documents found. Upload your first document.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Information Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Financial Information</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  Manage company financial details
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditFinancialOpen(true)}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Annual Revenue
                      </p>
                      <p className="text-sm font-medium">
                        {profile?.financialData?.annualRevenue ||
                          'No Annual Revenue'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Users className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="text-muted-foreground text-xs">
                        GST Number
                      </p>
                      <p className="text-sm font-medium">
                        {profile?.financialData?.gstNumber || 'No GST Number'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Tax ID</p>
                      <p className="text-sm font-medium">
                        {profile?.financialData?.taxId || 'No Tax ID'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Bank Accounts
                      </p>
                      <p className="text-sm font-medium">
                        {profile?.financialData?.bankAccounts?.length || 0}{' '}
                        accounts linked
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialogs */}
      <Dialog open={isEditBasicOpen} onOpenChange={setIsEditBasicOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Company Profile</DialogTitle>
            <DialogDescription>
              Update your company&apos;s profile information
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Company Details</TabsTrigger>
              <TabsTrigger value="description">
                Description & Benefits
              </TabsTrigger>
            </TabsList>
            <form onSubmit={handleBasicSubmit}>
              <div className="py-4">
                <TabsContent value="basic" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="bg-muted relative flex h-32 w-32 items-center justify-center rounded-lg border">
                          {imagePreview || profile?.basic?.logoUrl ? (
                            <img
                              src={imagePreview || profile?.basic?.logoUrl}
                              alt="Company logo"
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <LogoIcon className="text-muted-foreground h-16 w-16" />
                          )}
                        </div>
                        <label
                          htmlFor="logo-upload"
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform"
                        >
                          <div className="bg-background hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-sm">
                            <Upload className="h-4 w-4" />
                            <span>Upload</span>
                          </div>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label htmlFor="name">Company Name</Label>
                          <Input
                            id="name"
                            value={basicForm?.name || ''}
                            onChange={(e) =>
                              setBasicForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              value={basicForm?.contactEmail || ''}
                              onChange={(e) =>
                                setBasicForm((prev) => ({
                                  ...prev,
                                  contactEmail: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <ContactPhoneInput
                              value={basicForm?.contactPhone || ''}
                              onChange={(value) =>
                                setBasicForm((prev) => ({
                                  ...prev,
                                  contactPhone: value,
                                }))
                              }
                              onValidationError={setPhoneValidationError}
                              placeholder="Phone number"
                              label="Contact Phone"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={basicForm?.website || ''}
                        onChange={(e) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="companyType">Company Type</Label>
                      <Select
                        value={basicForm?.companyType}
                        onValueChange={(value) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            companyType: value as CompanyTypeEnum,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company type">
                            {basicForm?.companyType
                              ? formatEnumValue(basicForm?.companyType)
                              : 'Select company type'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {companyTypeOptions.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={basicForm?.industry}
                        onValueChange={(value) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            industry: value as CompanyIndustryEnum,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry">
                            {basicForm?.industry
                              ? formatEnumValue(basicForm?.industry)
                              : 'Select industry'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {industryOptions.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="size">Company Size</Label>
                      <Select
                        value={basicForm?.size}
                        onValueChange={(value) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            size: value as CompanySizeEnum,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size">
                            {basicForm?.size
                              ? formatEnumValue(basicForm?.size)
                              : 'Select company size'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="stage">Company Stage</Label>
                      <Select
                        value={basicForm?.stage}
                        onValueChange={(value) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            stage: value as CompanyStageEnum,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company stage">
                            {basicForm?.stage
                              ? formatEnumValue(basicForm?.stage)
                              : 'Select company stage'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {stageOptions.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="foundedYear">Founded Year</Label>
                      <Input
                        id="foundedYear"
                        type="number"
                        value={basicForm?.foundedYear || ''}
                        onChange={(e) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            foundedYear: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="description" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description">Company Description</Label>
                      <Textarea
                        id="description"
                        className="min-h-[100px]"
                        placeholder="Describe your company..."
                        value={basicForm?.description || ''}
                        onChange={(e) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="benefits">Benefits (one per line)</Label>
                      <Textarea
                        id="benefits"
                        className="min-h-[100px]"
                        placeholder="Enter benefits, one per line..."
                        value={basicForm?.benefits?.join('\n') || ''}
                        onChange={(e) =>
                          setBasicForm((prev) => ({
                            ...prev,
                            benefits: e.target.value
                              .split('\n')
                              .filter(Boolean),
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditBasicOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={phoneValidationError !== null}>
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAddressOpen} onOpenChange={setIsEditAddressOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update your company&apos;s address information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddressSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={addressForm?.address || ''}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>

              <LocationSelector
                country={addressForm?.country || ''}
                state={addressForm?.state || ''}
                city={addressForm?.city || ''}
                onLocationChange={(location) => {
                  setAddressForm((prev) => ({
                    ...prev,
                    country: location.country,
                    state: location.state,
                    city: location.city,
                  }));
                }}
                showLabels={true}
                required={false}
              />

              <div className="grid gap-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={addressForm?.zipCode || ''}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      zipCode: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditAddressOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditSocialOpen} onOpenChange={setIsEditSocialOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Social Profiles</DialogTitle>
            <DialogDescription>
              Update your company&apos;s social media profiles
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSocialSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={socialForm?.linkedin || ''}
                  onChange={(e) =>
                    setSocialForm((prev) => ({
                      ...prev,
                      linkedin: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={socialForm?.twitter || ''}
                  onChange={(e) =>
                    setSocialForm((prev) => ({
                      ...prev,
                      twitter: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={socialForm?.facebook || ''}
                  onChange={(e) =>
                    setSocialForm((prev) => ({
                      ...prev,
                      facebook: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={socialForm?.instagram || ''}
                  onChange={(e) =>
                    setSocialForm((prev) => ({
                      ...prev,
                      instagram: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={socialForm?.github || ''}
                  onChange={(e) =>
                    setSocialForm((prev) => ({
                      ...prev,
                      github: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={socialForm?.youtube || ''}
                  onChange={(e) =>
                    setSocialForm((prev) => ({
                      ...prev,
                      youtube: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditSocialOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCultureOpen} onOpenChange={setIsEditCultureOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Company Culture</DialogTitle>
            <DialogDescription>
              Update your company&apos;s culture information
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="mission" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mission">Mission & Vision</TabsTrigger>
              <TabsTrigger value="values">Values & Perks</TabsTrigger>
              <TabsTrigger value="environment">Work Environment</TabsTrigger>
            </TabsList>
            <form onSubmit={handleCultureSubmit}>
              <div className="py-4">
                <TabsContent value="mission" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mission">Mission Statement</Label>
                      <Textarea
                        id="mission"
                        className="mt-2"
                        placeholder="Enter your company's mission statement"
                        value={cultureForm?.mission || ''}
                        onChange={(e) =>
                          setCultureForm((prev) => ({
                            ...prev,
                            mission: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="vision">Vision Statement</Label>
                      <Textarea
                        id="vision"
                        className="mt-2"
                        placeholder="Enter your company's vision statement"
                        value={cultureForm?.vision || ''}
                        onChange={(e) =>
                          setCultureForm((prev) => ({
                            ...prev,
                            vision: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="values" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="values">Core Values</Label>
                      <Textarea
                        id="values"
                        className="mt-2"
                        placeholder="Enter core values (one per line)"
                        value={cultureForm?.values?.join('\n') || ''}
                        onChange={(e) =>
                          setCultureForm((prev) => ({
                            ...prev,
                            values: e.target.value.split('\n').filter(Boolean),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="perks">Perks & Benefits</Label>
                      <Textarea
                        id="perks"
                        className="mt-2"
                        placeholder="Enter perks and benefits (one per line)"
                        value={cultureForm?.perks?.join('\n') || ''}
                        onChange={(e) =>
                          setCultureForm((prev) => ({
                            ...prev,
                            perks: e.target.value.split('\n').filter(Boolean),
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="environment" className="mt-0">
                  <div className="space-y-4">
                    <Label>Work Environment</Label>
                    <div className="grid gap-6 md:grid-cols-2">
                      {Object.entries(WORK_ENVIRONMENT_CATEGORIES).map(
                        ([key, category]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex items-center gap-2">
                              {React.createElement(category.icon, {
                                className: 'h-4 w-4 text-muted-foreground',
                              })}
                              <h4 className="text-sm font-medium">
                                {category.title}
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {category.options.map((option) => (
                                <label
                                  key={option}
                                  className={cn(
                                    'flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm',
                                    cultureForm?.workEnvironment?.includes(
                                      option
                                    )
                                      ? 'border-primary bg-primary/5'
                                      : 'border-muted hover:bg-muted/50'
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={
                                      cultureForm?.workEnvironment?.includes(
                                        option
                                      ) || false
                                    }
                                    onChange={(e) => {
                                      const currentEnv =
                                        cultureForm?.workEnvironment || [];
                                      if (e.target.checked) {
                                        setCultureForm((prev) => ({
                                          ...prev,
                                          workEnvironment: [
                                            ...currentEnv,
                                            option,
                                          ],
                                        }));
                                      } else {
                                        setCultureForm((prev) => ({
                                          ...prev,
                                          workEnvironment: currentEnv.filter(
                                            (env) => env !== option
                                          ),
                                        }));
                                      }
                                    }}
                                  />
                                  <span>{formatEnumValue(option)}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditCultureOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Update Document Upload Dialog */}
      <Dialog
        open={isUploadDocumentOpen}
        onOpenChange={setIsUploadDocumentOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload company documents and certificates
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDocumentUpload}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select
                  value={documentForm.type}
                  onValueChange={(value) =>
                    setDocumentForm((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGISTRATION">
                      Company Registration
                    </SelectItem>
                    <SelectItem value="TAX_CERTIFICATE">
                      Tax Certificate
                    </SelectItem>
                    <SelectItem value="BUSINESS_LICENSE">
                      Business License
                    </SelectItem>
                    <SelectItem value="FINANCIAL_STATEMENT">
                      Financial Statement
                    </SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="document">Document</Label>
                <Input
                  id="document"
                  type="file"
                  onChange={handleDocumentFileChange}
                />
                {selectedFile && (
                  <p className="text-muted-foreground text-xs">
                    Selected file: {selectedFile?.name} (
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="documentName">Document Name *</Label>
                <Input
                  id="documentName"
                  type="text"
                  placeholder="Enter document name"
                  value={documentForm.name}
                  onChange={(e) =>
                    setDocumentForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadDocumentOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedFile ||
                  !documentForm.type ||
                  !documentForm.name?.trim()
                }
              >
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Financial Information Edit Dialog */}
      <Dialog open={isEditFinancialOpen} onOpenChange={setIsEditFinancialOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Financial Information</DialogTitle>
            <DialogDescription>
              Update your company&apos;s financial details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFinancialSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-1">
                <div className="grid gap-2">
                  <Label htmlFor="annualRevenue">Annual Revenue</Label>
                  <Select
                    value={financialDataForm?.annualRevenue?.toString() || ''}
                    onValueChange={(value) =>
                      setFinancialDataForm((prev) => ({
                        ...prev,
                        annualRevenue: parseFloat(value) || 0,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select revenue range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000000">$1M - $5M</SelectItem>
                      <SelectItem value="5000000">$5M - $10M</SelectItem>
                      <SelectItem value="10000000">$10M - $50M</SelectItem>
                      <SelectItem value="50000000">$50M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  type="text"
                  value={financialDataForm?.taxId || ''}
                  onChange={(e) =>
                    setFinancialDataForm((prev) => ({
                      ...prev,
                      taxId: e.target.value,
                    }))
                  }
                  placeholder="Enter tax ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
                <Input
                  id="vatNumber"
                  type="text"
                  value={financialDataForm?.vatNumber || ''}
                  onChange={(e) =>
                    setFinancialDataForm((prev) => ({
                      ...prev,
                      vatNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter VAT number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                <Input
                  id="gstNumber"
                  type="text"
                  value={financialDataForm?.gstNumber || ''}
                  onChange={(e) =>
                    setFinancialDataForm((prev) => ({
                      ...prev,
                      gstNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter GST number"
                />
              </div>
              {profile?.financialData && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Bank Accounts</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddBankAccountOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Account
                    </Button>
                  </div>
                  <div className="divide-y rounded-lg border">
                    {profile?.financialData?.bankAccounts &&
                    profile.financialData.bankAccounts.length > 0 ? (
                      profile.financialData.bankAccounts.map(
                        (account: IPartnerBankAccount) => (
                          <div key={account.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  {account.accountName}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {account.bankName} • ****{' '}
                                  {account.accountNumber.slice(-4)}
                                </p>
                                {account.isDefault && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Default Account
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteBankAccount(account.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-muted-foreground p-3 text-center text-sm">
                        No bank accounts added
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditFinancialOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog
        open={isAddBankAccountOpen}
        onOpenChange={setIsAddBankAccountOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a new bank account to your company profile
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBankAccount}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="accountName">Account Name*</Label>
                <Input
                  id="accountName"
                  value={bankAccountForm.accountName}
                  onChange={(e) =>
                    setBankAccountForm((prev) => ({
                      ...prev,
                      accountName: e.target.value,
                    }))
                  }
                  placeholder="Enter account name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bankName">Bank Name*</Label>
                <Input
                  id="bankName"
                  value={bankAccountForm.bankName}
                  onChange={(e) =>
                    setBankAccountForm((prev) => ({
                      ...prev,
                      bankName: e.target.value,
                    }))
                  }
                  placeholder="Enter bank name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accountNumber">Account Number*</Label>
                <Input
                  id="accountNumber"
                  value={bankAccountForm.accountNumber}
                  onChange={(e) =>
                    setBankAccountForm((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter account number"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="swiftCode">SWIFT/BIC Code*</Label>
                <Input
                  id="swiftCode"
                  value={bankAccountForm.swiftCode}
                  onChange={(e) =>
                    setBankAccountForm((prev) => ({
                      ...prev,
                      swiftCode: e.target.value,
                    }))
                  }
                  placeholder="Enter SWIFT/BIC code"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={bankAccountForm.isDefault || false}
                  onCheckedChange={(checked) =>
                    setBankAccountForm((prev) => ({
                      ...prev,
                      isDefault: checked === true,
                    }))
                  }
                />
                <Label htmlFor="isDefault">Set as default account</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddBankAccountOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add new dialogs for billing and shipping addresses */}
      <Dialog
        open={isEditBillingAddressOpen}
        onOpenChange={setIsEditBillingAddressOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Billing Address</DialogTitle>
            <DialogDescription>
              Update your company&apos;s billing address
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBillingAddressSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="billingAddress">Street Address</Label>
                <Input
                  id="billingAddress"
                  value={billingAddressForm.billingAddress || ''}
                  onChange={(e) =>
                    setBillingAddressForm((prev) => ({
                      ...prev,
                      billingAddress: e.target.value,
                    }))
                  }
                />
              </div>

              <LocationSelector
                country={billingAddressForm?.billingCountry || ''}
                state={billingAddressForm?.billingState || ''}
                city={billingAddressForm?.billingCity || ''}
                onLocationChange={(location) => {
                  setBillingAddressForm((prev) => ({
                    ...prev,
                    billingCountry: location.country,
                    billingState: location.state,
                    billingCity: location.city,
                  }));
                }}
                showLabels={true}
                required={false}
              />

              <div className="grid gap-2">
                <Label htmlFor="billingPostalCode">Postal Code</Label>
                <Input
                  id="billingPostalCode"
                  value={billingAddressForm.billingZipCode || ''}
                  onChange={(e) =>
                    setBillingAddressForm((prev) => ({
                      ...prev,
                      billingZipCode: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditBillingAddressOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditShippingAddressOpen}
        onOpenChange={setIsEditShippingAddressOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shipping Address</DialogTitle>
            <DialogDescription>
              Update your company&apos;s shipping address
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleShippingAddressSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="shippingAddress">Street Address</Label>
                <Input
                  id="shippingAddress"
                  value={shippingAddressForm.shippingAddress || ''}
                  onChange={(e) =>
                    setShippingAddressForm((prev) => ({
                      ...prev,
                      shippingAddress: e.target.value,
                    }))
                  }
                />
              </div>

              <LocationSelector
                country={shippingAddressForm?.shippingCountry || ''}
                state={shippingAddressForm?.shippingState || ''}
                city={shippingAddressForm?.shippingCity || ''}
                onLocationChange={(location) => {
                  setShippingAddressForm((prev) => ({
                    ...prev,
                    shippingCountry: location.country,
                    shippingState: location.state,
                    shippingCity: location.city,
                  }));
                }}
                showLabels={true}
                required={false}
              />

              <div className="grid gap-2">
                <Label htmlFor="shippingZipCode">Postal Code</Label>
                <Input
                  id="shippingZipCode"
                  value={shippingAddressForm.shippingZipCode || ''}
                  onChange={(e) =>
                    setShippingAddressForm((prev) => ({
                      ...prev,
                      shippingZipCode: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditShippingAddressOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog
        open={isPreviewDocumentOpen}
        onOpenChange={(open) => {
          setIsPreviewDocumentOpen(open);
          if (!open && previewDocumentUrl) {
            setPreviewDocumentUrl('');
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] w-full overflow-auto p-1">
            <MediaPreview previewDocumentUrl={previewDocumentUrl} />
          </div>
          <DialogFooter className="bg-muted/30 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewDocumentOpen(false)}
            >
              Close
            </Button>
            {previewDocumentUrl && (
              <Button
                type="button"
                variant="default"
                onClick={() => window.open(previewDocumentUrl, '_blank')}
              >
                <Eye className="mr-2 h-4 w-4" />
                Open in New Tab
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDocumentOpen}
        onOpenChange={setIsDeleteDocumentOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDocumentOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteDocument}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank Account Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteBankAccountOpen}
        onOpenChange={setIsDeleteBankAccountOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bank account? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteBankAccountOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteBankAccount}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
