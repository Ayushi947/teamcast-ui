'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Paperclip,
  AlertCircle,
  FileText,
  Trash2,
  Upload,
  Loader2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/lib/context/app-context';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ClientTicketCategory,
  CandidateTicketCategory,
  getCategoryLabel,
  getCategoryDescription,
  getCandidateCategoryLabel,
  getCandidateCategoryDescription,
  // getCategoryIcon,
  getSubcategoryLabel,
  getCandidateSubcategoryLabel,
  getSubcategoriesForCategory,
  getCandidateSubcategoriesForCategory,
  getCategoryForSubcategory,
  getCandidateCategoryForSubcategory,
  getAllClientSubcategories,
  getAllCandidateSubcategories,
  getAllClientCategories,
  getAllCandidateCategories,
  getTicketType,
  getCandidateTicketType,
  SupportTicketType,
  generateDescriptiveTicketSubject,
  generateDescriptiveCandidateTicketSubject,
} from '@/lib/shared/utils/support-ticket.utils';
import { logger } from '@/lib/logger';
import {
  clientSupportTicketService,
  clientJobPostingService,
  clientDocumentService,
  clientUserManagementService,
  candidateApplicationService,
  candidateSupportTicketService,
} from '@/lib/services/services';
import {
  ClientTicketSubcategory,
  CandidateTicketSubcategory,
  IClientSupportTicketCreate,
  SupportClientTicketSubcategoryEnum,
  SupportCandidateTicketSubcategoryEnum,
  SupportTicketCategoryEnum,
  SupportTicketEntityTypeEnum,
  UserTypeEnum,
  ICandidateSupportTicketCreate,
  // IClientJobPosting,
  // IDocument,
} from '@/lib/shared';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQueryClient } from '@tanstack/react-query';
import { formatEnumValue } from '@/lib/utils';

// Target entity types for support tickets
export enum TargetEntityType {
  JOB_POSTING = 'JOB_POSTING',
  CANDIDATE_ONBOARDING = 'CANDIDATE_ONBOARDING',
  DOCUMENT = 'DOCUMENT',
  CANDIDATE = 'CANDIDATE',
  USER = 'USER',
  INTEGRATION = 'INTEGRATION',
  // Candidate-specific entities
  ASSESSMENT = 'ASSESSMENT',
  JOB_APPLICATION = 'JOB_APPLICATION',
}

// Helper function to get target entity type for a client subcategory
const getTargetEntityTypeForClientSubcategory = (
  subcategory: keyof typeof ClientTicketSubcategory
): TargetEntityType | null => {
  // Job Posting related
  if (
    subcategory.includes('JOB_POSTING_') &&
    subcategory !== 'JOB_POSTING_CREATE'
  ) {
    return TargetEntityType.JOB_POSTING;
  }

  // Job Application related
  if (subcategory.includes('JOB_APPLICATION_')) {
    return TargetEntityType.JOB_POSTING;
  }

  // Interview related
  if (subcategory.includes('JOB_INTERVIEW_')) {
    return TargetEntityType.JOB_POSTING;
  }

  // Onboarding related
  if (subcategory.includes('JOB_ONBOARDING_')) {
    return TargetEntityType.CANDIDATE_ONBOARDING;
  }

  // User Management related
  if (
    subcategory.includes('USER_') &&
    !subcategory.includes('USER_INVITATION_SEND')
  ) {
    return TargetEntityType.USER;
  }

  // AI Assessment related
  if (
    subcategory.includes('AI_ASSESSMENT_') &&
    subcategory !== 'AI_ASSESSMENT_CREATE'
  ) {
    return TargetEntityType.JOB_POSTING;
  }

  // Company Profile related
  if (subcategory.includes('COMPANY_PROFILE_')) {
    return TargetEntityType.DOCUMENT;
  }

  // Integration related
  if (
    subcategory.includes('INTEGRATION_') &&
    subcategory !== 'INTEGRATION_SETUP'
  ) {
    return TargetEntityType.INTEGRATION;
  }

  // Data Operations related
  if (subcategory.includes('DATA_EXPORT_IMPORT_')) {
    return TargetEntityType.DOCUMENT;
  }

  // API Access related
  if (
    subcategory.includes('API_ACCESS_') &&
    subcategory !== 'API_ACCESS_KEY_GENERATION'
  ) {
    return TargetEntityType.INTEGRATION;
  }

  // Reporting related
  if (subcategory.includes('REPORTING_ANALYTICS_')) {
    return TargetEntityType.DOCUMENT;
  }

  // New entity creation (no target needed)
  const newEntitySubcategories = [
    'JOB_POSTING_CREATE',
    'USER_INVITATION_SEND',
    'AI_ASSESSMENT_CREATE',
    'INTEGRATION_SETUP',
    'API_ACCESS_KEY_GENERATION',
    'FEATURE_REQUEST_NEW_FEATURE',
    'FEATURE_REQUEST_ENHANCEMENT',
  ];

  if (newEntitySubcategories.includes(subcategory)) {
    return null;
  }

  // All other categories have no specific target
  return null;
};

// Helper function to get target entity type for a candidate subcategory
const getTargetEntityTypeForCandidateSubcategory = (
  subcategory: keyof typeof CandidateTicketSubcategory
): TargetEntityType | null => {
  // Job Application related
  if (
    subcategory.includes('JOB_APPLICATION_') &&
    subcategory !== 'JOB_APPLICATION_SUBMIT'
  ) {
    return TargetEntityType.JOB_APPLICATION;
  }

  // Onboarding related
  if (
    subcategory.includes('ONBOARDING_') &&
    subcategory !== 'ONBOARDING_SETUP'
  ) {
    return TargetEntityType.CANDIDATE_ONBOARDING;
  }

  // New entity creation (no target needed)
  const newEntitySubcategories = [
    'PROFILE_CREATE',
    'JOB_APPLICATION_SUBMIT',
    'ONBOARDING_SETUP',
  ];

  if (newEntitySubcategories.includes(subcategory)) {
    return null;
  }

  // All other categories have no specific target
  return null;
};

export function SupportTicketForm({ onClose = () => {} }) {
  const { user } = useApp();
  const isCandidate = user?.type === UserTypeEnum.CANDIDATE;
  const isClient = user?.type === UserTypeEnum.CLIENT;
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    targetId: '',
    targetType: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [isSubjectManuallyEdited, setIsSubjectManuallyEdited] = useState(false);

  // Target entity state
  const [targetEntities, setTargetEntities] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);

  // Search state
  const [issueSearchValue, setIssueSearchValue] = useState('');
  const [targetSearchValue, setTargetSearchValue] = useState('');

  // Get all subcategories grouped by category for the searchable dropdown
  const getAllSubcategoriesGrouped = () => {
    if (isCandidate) {
      const categories = getAllCandidateCategories();
      return categories.map((category) => ({
        category,
        categoryLabel: getCandidateCategoryLabel(category),
        categoryDescription: getCandidateCategoryDescription(category),
        subcategories: getCandidateSubcategoriesForCategory(category).map(
          (subcategory) => ({
            value: subcategory,
            label: getCandidateSubcategoryLabel(subcategory),
            category: category,
          })
        ),
      }));
    } else {
      const categories = getAllClientCategories();
      return categories.map((category) => ({
        category,
        categoryLabel: getCategoryLabel(category),
        categoryDescription: getCategoryDescription(category),
        subcategories: getSubcategoriesForCategory(category).map(
          (subcategory) => ({
            value: subcategory,
            label: getSubcategoryLabel(subcategory),
            category: category,
          })
        ),
      }));
    }
  };

  // Get all subcategories for the searchable dropdown (flat list for backward compatibility)
  const getAllSubcategories = () => {
    if (isCandidate) {
      return getAllCandidateSubcategories().map((subcategory) => ({
        value: subcategory,
        label: getCandidateSubcategoryLabel(subcategory),
        category: getCandidateCategoryForSubcategory(subcategory),
      }));
    } else {
      return getAllClientSubcategories().map((subcategory) => ({
        value: subcategory,
        label: getSubcategoryLabel(subcategory),
        category: getCategoryForSubcategory(subcategory),
      }));
    }
  };

  // Filter groups based on search
  const filteredIssueGroups = getAllSubcategoriesGrouped()
    .map((categoryGroup) => ({
      ...categoryGroup,
      subcategories: categoryGroup.subcategories.filter((issue) =>
        issue.label.toLowerCase().includes(issueSearchValue.toLowerCase())
      ),
    }))
    .filter((categoryGroup) => categoryGroup.subcategories.length > 0);

  const ticketType = isCandidate
    ? getCandidateTicketType(
        formData.subcategory as keyof typeof CandidateTicketSubcategory
      )
    : getTicketType(
        formData.subcategory as keyof typeof ClientTicketSubcategory
      );

  // Filter target entities based on search
  const filteredTargetEntities = targetEntities.filter((entity) =>
    entity.name.toLowerCase().includes(targetSearchValue.toLowerCase())
  );

  // Get target entity type for current subcategory
  const targetEntityType = formData.subcategory
    ? isCandidate
      ? getTargetEntityTypeForCandidateSubcategory(
          formData.subcategory as keyof typeof CandidateTicketSubcategory
        )
      : getTargetEntityTypeForClientSubcategory(
          formData.subcategory as keyof typeof ClientTicketSubcategory
        )
    : null;

  // Fetch target entities based on type
  const fetchTargetEntities = useCallback(
    async (entityType: TargetEntityType) => {
      if (!user?.clientId && !user?.candidateId) return;

      setIsLoadingTargets(true);
      try {
        let entities: Array<{ id: string; name: string; type: string }> = [];

        switch (entityType) {
          case TargetEntityType.JOB_POSTING: {
            if (isClient) {
              const jobPostings =
                await clientJobPostingService.getJobPostings();
              entities =
                jobPostings.items?.map((job) => ({
                  id: job.id,
                  name: job.title,
                  type: 'Job Posting',
                })) || [];
            }
            break;
          }

          case TargetEntityType.DOCUMENT: {
            if (isClient) {
              const documents = await clientDocumentService.listClientDocuments(
                user.clientId!
              );
              entities =
                documents.data?.documents?.map((doc: any) => ({
                  id: doc.id,
                  name: doc.name || doc.originalFileName || 'Unnamed Document',
                  type: 'Document',
                })) || [];
            }
            break;
          }

          case TargetEntityType.USER: {
            if (isClient) {
              const users = await clientUserManagementService.getUsers({
                page: 1,
                limit: 10,
              });

              entities =
                users.items?.map((user) => ({
                  id: user.id,
                  name: user.name,
                  type: 'User',
                })) || [];
            }
            break;
          }

          case TargetEntityType.JOB_APPLICATION: {
            if (isCandidate) {
              const jobApplications =
                await candidateApplicationService.getApplications({
                  page: 1,
                  limit: 10,
                  search: targetSearchValue,
                });
              entities =
                jobApplications.items?.map((application) => ({
                  id: application.id,
                  name: application.jobPosting?.title,
                  type: 'Job Application',
                })) || [];
            }
            break;
          }

          default:
            entities = [];
        }

        setTargetEntities(entities);
      } catch (error) {
        logger.error('Failed to fetch target entities:', error);
        toast.error('Failed to fetch available items');
      } finally {
        setIsLoadingTargets(false);
      }
    },
    [
      user?.clientId,
      user?.candidateId,
      isClient,
      isCandidate,
      targetSearchValue,
    ]
  );

  // Fetch target entities when subcategory changes
  useEffect(() => {
    if (targetEntityType && ticketType !== SupportTicketType.NEW_ENTITY) {
      fetchTargetEntities(targetEntityType);
    } else {
      setTargetEntities([]);
      setFormData((prev) => ({ ...prev, targetId: '', targetType: '' }));
    }
  }, [targetEntityType, ticketType, user?.clientId, fetchTargetEntities]);

  // Auto-generate subject when subcategory or target changes
  // Skip auto-generation for OTHER category
  useEffect(() => {
    if (
      formData.category &&
      formData.subcategory &&
      !isSubjectManuallyEdited &&
      (isClient
        ? formData.category !== ClientTicketCategory.OTHER
        : formData.category !== CandidateTicketCategory.OTHER)
    ) {
      const targetName = formData.targetId
        ? targetEntities.find((t) => t.id === formData.targetId)?.name
        : undefined;

      const generatedSubject = isCandidate
        ? generateDescriptiveCandidateTicketSubject(
            formData.category as keyof typeof CandidateTicketCategory,
            formData.subcategory as keyof typeof CandidateTicketSubcategory,
            formData.targetType,
            targetName
          )
        : generateDescriptiveTicketSubject(
            formData.category as keyof typeof ClientTicketCategory,
            formData.subcategory as keyof typeof ClientTicketSubcategory,
            formData.targetType,
            targetName
          );

      setFormData((prev) => ({
        ...prev,
        title: generatedSubject,
      }));
    }
  }, [
    formData.category,
    formData.subcategory,
    formData.targetId,
    formData.targetType,
    targetEntities,
    isSubjectManuallyEdited,
    isCandidate,
    isClient,
  ]);

  // Handle target selection
  const handleTargetSelect = (target: {
    id: string;
    name: string;
    type: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      targetId: target.id,
      targetType: target.type,
    }));
    setTargetSearchValue('');
  };

  // Handle issue selection
  const handleIssueSelect = (issueValue: string) => {
    const issue = getAllSubcategories().find((sub) => sub.value === issueValue);
    if (issue) {
      setFormData((prev) => ({
        ...prev,
        subcategory: issue.value,
        category: issue.category || '',
        targetId: '',
        targetType: '',
      }));
      setIssueSearchValue('');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset target when subcategory changes (handled in handleIssueSelect)
      ...(field === 'subcategory' && { targetId: '', targetType: '' }),
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Track if user manually edits the subject
    if (field === 'title') {
      setIsSubjectManuallyEdited(true);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (files.length + attachments.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    // Validate file sizes (10MB each)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error(
        `Files exceeding 10MB limit: ${oversizedFiles.map((f) => f.name).join(', ')}`
      );
      return;
    }

    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Subject is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!formData.subcategory) newErrors.subcategory = 'Issue is required';
    // Category is auto-detected, so we don't validate it separately

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    logger.info('handleSubmit', { formData, attachments: attachments.length });
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create the proper ticket data object
      const baseTicketData = {
        title: formData.title,
        description: formData.description,
        category: formData.category as SupportTicketCategoryEnum,
        entityType: isCandidate
          ? SupportTicketEntityTypeEnum.CANDIDATE
          : SupportTicketEntityTypeEnum.CLIENT,
        attachments: attachments,
        targetId: formData.targetId || undefined,
        targetType: formData.targetType || undefined,
      };

      const ticketData = isCandidate
        ? {
            ...baseTicketData,
            subcategory:
              formData.subcategory as SupportCandidateTicketSubcategoryEnum,
          }
        : {
            ...baseTicketData,
            subcategory:
              formData.subcategory as SupportClientTicketSubcategoryEnum,
          };

      logger.info('Sending ticket data:', {
        title: ticketData.title,
        category: ticketData.category,
        attachmentCount: attachments.length,
        targetId: formData.targetId,
        targetType: formData.targetType,
      });

      // Log attachment details
      attachments.forEach((file, index) => {
        logger.info(`Attachment ${index}:`, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      });

      if (isCandidate) {
        // TODO: Replace with candidate support ticket service when available
        // await candidateSupportTicketService.createTicket(ticketData);
        // For now, convert to client ticket format
        const candidateTicketData: ICandidateSupportTicketCreate = {
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          subcategory:
            ticketData.subcategory as SupportClientTicketSubcategoryEnum,
          entityType: ticketData.entityType,
          targetId: ticketData.targetId || '',
          targetType: ticketData.targetType,
          attachments: ticketData.attachments,
        };
        await candidateSupportTicketService.createTicket(
          user.candidateId!,
          candidateTicketData
        );
      } else {
        const clientTicketData: IClientSupportTicketCreate = {
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          subcategory:
            ticketData.subcategory as SupportClientTicketSubcategoryEnum,
          entityType: ticketData.entityType,
          attachments: ticketData.attachments,
          targetId: ticketData.targetId,
          targetType: ticketData.targetType,
        };
        await clientSupportTicketService.createTicket(clientTicketData);
      }

      queryClient.invalidateQueries({
        queryKey: ['support-tickets'],
      });
      toast.success('Support ticket created successfully!');

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        targetId: '',
        targetType: '',
      });
      setAttachments([]);
      setErrors({});
      setIsSubjectManuallyEdited(false);
      onClose();
    } catch (error) {
      logger.error('Failed to create support ticket:', error);
      toast.error('Failed to create support ticket', {
        description:
          error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card flex h-full flex-col">
      {/* Compact Header */}
      <div className="bg-card flex items-center justify-between border-b border-gray-200 p-4">
        {/* Left side: Close + Title */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-foreground text-lg font-semibold">
              Create Support Ticket
            </h1>
            <p className="text-muted-foreground text-xs">
              {user?.name || 'User'} • {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>

        {/* Right side: Reset button */}
        <Button
          variant="outline"
          className="text-muted-foreground text-sm font-bold"
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              category: '',
              subcategory: '',
              targetId: '',
              targetType: '',
            });
            setIsSubjectManuallyEdited(false);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1 overflow-y-auto p-4">
        <form
          id="support-ticket-form"
          onSubmit={handleSubmit}
          className="flex h-full flex-col"
        >
          {/* Issue Selection - Now First Position */}
          <div className="flex-1 space-y-6 overflow-y-auto p-1">
            <div className="space-y-3">
              <Label className="text-foreground text-sm font-medium">
                Issue *
              </Label>
              <Select
                value={formData.subcategory}
                onValueChange={handleIssueSelect}
              >
                <SelectTrigger className="h-11 w-full border-gray-200 px-4 py-2 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50/50">
                  <SelectValue placeholder="Select an issue">
                    {formData.subcategory
                      ? isCandidate
                        ? getCandidateSubcategoryLabel(
                            formData.subcategory as keyof typeof CandidateTicketSubcategory
                          )
                        : getSubcategoryLabel(
                            formData.subcategory as keyof typeof ClientTicketSubcategory
                          )
                      : 'Select an issue'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {/* Search Input */}
                  <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                    <Search className="mr-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search issues..."
                      className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
                      value={issueSearchValue}
                      onChange={(e) => setIssueSearchValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Options List */}
                  <div className="max-h-[320px] overflow-y-auto">
                    {filteredIssueGroups.length === 0 ? (
                      <div className="py-8 text-center">
                        <div className="mb-1 text-sm text-gray-500">
                          No issue found
                        </div>
                        <div className="text-xs text-gray-400">
                          Try a different search term
                        </div>
                      </div>
                    ) : (
                      filteredIssueGroups.map((categoryGroup, index) => (
                        <SelectGroup key={categoryGroup.category}>
                          {index > 0 && (
                            <SelectSeparator className="mx-4 my-2" />
                          )}
                          <SelectLabel className="bg-gray-50/30 px-4 py-2 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                            {formatEnumValue(categoryGroup.categoryLabel)}
                          </SelectLabel>
                          {categoryGroup.subcategories.map((issue) => (
                            <SelectItem
                              key={issue.value}
                              value={issue.value}
                              className="px-4 py-2.5 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900"
                            >
                              {formatEnumValue(issue.label)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))
                    )}
                  </div>
                </SelectContent>
              </Select>
              {errors.subcategory && (
                <p className="flex items-center text-xs text-red-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.subcategory}
                </p>
              )}
            </div>

            {/* Category Display - Auto-detected and disabled */}
            {formData.category && (
              <div className="space-y-3">
                <Label className="text-foreground text-sm font-medium">
                  Category
                </Label>
                <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {isCandidate
                        ? getCandidateCategoryLabel(
                            formData.category as keyof typeof CandidateTicketCategory
                          )
                        : getCategoryLabel(
                            formData.category as keyof typeof ClientTicketCategory
                          )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Target Entity Selection - Only show for existing entity tickets */}
            {ticketType !== SupportTicketType.NEW_ENTITY &&
              targetEntityType &&
              targetEntities.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-foreground text-sm font-medium">
                    Select {formatEnumValue(targetEntityType)}
                  </Label>
                  <Select
                    value={formData.targetId}
                    onValueChange={(value) => {
                      const entity = targetEntities.find((t) => t.id === value);
                      if (entity) {
                        handleTargetSelect(entity);
                      }
                    }}
                    disabled={isLoadingTargets}
                  >
                    <SelectTrigger className="h-11 w-full border-gray-200 px-4 py-2 text-left transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50/50">
                      <SelectValue
                        placeholder={`Select ${formatEnumValue(targetEntityType)}`}
                      >
                        {formData.targetId
                          ? targetEntities.find(
                              (t) => t.id === formData.targetId
                            )?.name || 'Selected Item'
                          : `Select ${formatEnumValue(targetEntityType)}`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {/* Search Input */}
                      <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                        <Search className="mr-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={`Search ${formatEnumValue(targetEntityType)}...`}
                          className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
                          value={targetSearchValue}
                          onChange={(e) => setTargetSearchValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Options List */}
                      <div className="max-h-[240px] overflow-y-auto">
                        {isLoadingTargets ? (
                          <div className="py-8 text-center">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Loading...</span>
                            </div>
                          </div>
                        ) : filteredTargetEntities.length === 0 ? (
                          <div className="py-8 text-center">
                            <div className="mb-1 text-sm text-gray-500">
                              No {formatEnumValue(targetEntityType)} found
                            </div>
                            <div className="text-xs text-gray-400">
                              Try a different search term
                            </div>
                          </div>
                        ) : (
                          <div className="py-1">
                            {filteredTargetEntities.map((entity) => (
                              <SelectItem
                                key={entity.id}
                                value={entity.id}
                                className="px-4 py-2.5 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900"
                              >
                                {formatEnumValue(entity.name)} -
                                {formatEnumValue(entity.type)}
                              </SelectItem>
                            ))}
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                  {errors.targetId && (
                    <p className="flex items-center text-xs text-red-600">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.targetId}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Select the specific {formatEnumValue(targetEntityType)}
                    this issue relates to
                  </p>
                </div>
              )}

            {/* Subject */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-foreground text-sm font-medium"
              >
                Title *
              </Label>
              <div className="relative">
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of your issue"
                  className={`text-sm ${
                    errors.title
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                  }`}
                />
                {formData.category &&
                  formData.subcategory &&
                  (isClient
                    ? formData.category !== ClientTicketCategory.OTHER
                    : formData.category !== CandidateTicketCategory.OTHER) && (
                    <div className="absolute top-1/2 right-2 -translate-y-1/2">
                      <div className="flex items-center gap-1 rounded-full px-2 py-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-purple-600">
                          {isSubjectManuallyEdited
                            ? 'Edited'
                            : 'Auto-generated'}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
              {errors.title && (
                <p className="flex items-center text-xs text-red-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.title}
                </p>
              )}
              {formData.category && formData.subcategory && (
                <p className="text-xs text-gray-500">
                  {(
                    isClient
                      ? formData.category === ClientTicketCategory.OTHER
                      : formData.category === CandidateTicketCategory.OTHER
                  )
                    ? 'Please provide a descriptive title for your issue.'
                    : isSubjectManuallyEdited
                      ? 'Title has been manually edited. You can continue to modify it.'
                      : 'Title is automatically generated based on your selections. You can edit it if needed.'}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-foreground text-sm font-medium"
              >
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Describe your issue or request in detail..."
                className={`min-h-[120px] resize-none text-sm ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                }`}
              />
              {errors.description && (
                <p className="flex items-center text-xs text-red-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <Label className="text-foreground text-sm font-medium">
                Attachments
              </Label>
              <div
                className={`relative rounded-lg border-2 border-dashed p-4 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'hover:bg-purple-25 border-gray-300 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleFiles(Array.from(e.target.files || []))
                  }
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                />
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-foreground mb-1 text-sm font-medium">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-gray-500">Max 5 files, 10MB each</p>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-foreground flex items-center text-sm font-medium">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Files ({attachments.length}/5)
                  </h4>
                  {attachments.map((file: File, index: number) => (
                    <Card key={index} className="border-gray-200">
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex min-w-0 items-center space-x-2">
                            <FileText className="h-4 w-4 flex-shrink-0 text-gray-500" />
                            <div className="min-w-0">
                              <p className="text-foreground truncate text-xs font-medium">
                                {file.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </ScrollArea>

      {/* Footer */}
      <div className="bg-card border-t border-gray-200 p-4">
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            form="support-ticket-form"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </div>
    </div>
  );
}
