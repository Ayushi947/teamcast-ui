'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CheckCircle,
  Loader2,
  Plus,
  X,
  Search,
  AlertTriangle,
  Shield,
  Edit3,
  Calendar,
  User,
  FileText,
  Target,
} from 'lucide-react';
import {
  ISupportTicketRcaRequest,
  ISupportTicketRcaResponse,
  logger,
} from '@/lib/shared';
import { supportTicketService } from '@/lib/services/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RcaSectionProps {
  ticketId: string;
  rcaData?: ISupportTicketRcaResponse | null;
  isEditable: boolean;
}

export const RcaSection: React.FC<RcaSectionProps> = ({
  ticketId,
  rcaData,
  isEditable,
}) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ISupportTicketRcaRequest>({
    rootCauseAnalysis: rcaData?.rootCauseAnalysis || '',
    rcaCategory: rcaData?.rcaCategory || '',
    rcaContributingFactors: rcaData?.rcaContributingFactors || [],
    rcaPreventiveMeasures: rcaData?.rcaPreventiveMeasures || [],
  });

  const [newContributingFactor, setNewContributingFactor] = useState('');
  const [newPreventiveMeasure, setNewPreventiveMeasure] = useState('');

  // Predefined categories for better UX
  const rcaCategories = [
    'Technical Issue',
    'Process Gap',
    'Human Error',
    'System Failure',
    'Configuration Error',
    'Third-party Service',
    'Infrastructure',
    'Security',
    'Data Quality',
    'Performance',
  ];

  const addRcaMutation = useMutation({
    mutationFn: async (data: ISupportTicketRcaRequest) => {
      return await supportTicketService.addRootCauseAnalysis(ticketId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['ticket-rca', ticketId] });
      toast.success('Root Cause Analysis added successfully', {
        description: 'Root cause analysis has been documented.',
      });
      setIsEditing(false);
    },
    onError: (error) => {
      logger.error('Failed to add Root Cause Analysis', error);
      toast.error('Failed to add Root Cause Analysis', {
        description: 'Please try again or contact support.',
      });
    },
  });

  const validateForm = () => {
    if (!formData.rootCauseAnalysis.trim()) {
      toast.error('Missing required fields', {
        description: 'Please fill in the root cause analysis.',
      });
      return false;
    }

    if (!formData.rcaCategory.trim()) {
      toast.error('Missing required fields', {
        description: 'Please fill in the category.',
      });
      return false;
    }
    if (!formData.rcaPreventiveMeasures?.length) {
      toast.error('Missing required fields', {
        description: 'Please fill in the impacting factors.',
      });
      return false;
    }

    return true;
  };

  const updateRcaMutation = useMutation({
    mutationFn: async (data: ISupportTicketRcaRequest) => {
      return await supportTicketService.updateRootCauseAnalysis(ticketId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['ticket-rca', ticketId] });
      toast.success('Root Cause Analysis updated successfully', {
        description: 'Changes have been saved.',
      });
      setIsEditing(false);
    },
    onError: (error) => {
      logger.error('Failed to update Root Cause Analysis', error);
      toast.error('Failed to update Root Cause Analysis', {
        description: 'Please try again or contact support.',
      });
    },
  });

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!formData.rootCauseAnalysis.trim() || !formData.rcaCategory.trim()) {
      toast.error('Missing required fields', {
        description: 'Please fill in both root cause analysis and category.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (rcaData) {
        await updateRcaMutation.mutateAsync(formData);
      } else {
        await addRcaMutation.mutateAsync(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSaveDisabled =
    isSubmitting ||
    !formData.rootCauseAnalysis.trim() ||
    !formData.rcaCategory.trim();

  const handleCancel = () => {
    setFormData({
      rootCauseAnalysis: rcaData?.rootCauseAnalysis || '',
      rcaCategory: rcaData?.rcaCategory || '',
      rcaContributingFactors: rcaData?.rcaContributingFactors || [],
      rcaPreventiveMeasures: rcaData?.rcaPreventiveMeasures || [],
    });
    setIsEditing(false);
  };

  const addContributingFactor = () => {
    if (newContributingFactor.trim()) {
      setFormData((prev) => ({
        ...prev,
        rcaContributingFactors: [
          ...(prev.rcaContributingFactors || []),
          newContributingFactor.trim(),
        ],
      }));
      setNewContributingFactor('');
    }
  };

  const removeContributingFactor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rcaContributingFactors:
        prev.rcaContributingFactors?.filter((_, i) => i !== index) || [],
    }));
  };

  const addPreventiveMeasure = () => {
    if (newPreventiveMeasure.trim()) {
      setFormData((prev) => ({
        ...prev,
        rcaPreventiveMeasures: [
          ...(prev.rcaPreventiveMeasures || []),
          newPreventiveMeasure.trim(),
        ],
      }));
      setNewPreventiveMeasure('');
    }
  };

  const removePreventiveMeasure = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rcaPreventiveMeasures:
        prev.rcaPreventiveMeasures?.filter((_, i) => i !== index) || [],
    }));
  };

  if (!isEditable && !rcaData) {
    return null;
  }

  return (
    <TooltipProvider>
      <Card className="border bg-white shadow-none transition-colors hover:shadow-none dark:bg-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800/80">
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Root Cause Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {rcaData ? 'Analysis completed' : 'Document the root cause'}
                </p>
              </div>
            </div>
            {rcaData && (
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Complete
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              {rcaData ? (
                <div className="space-y-4">
                  {/* Category Section */}
                  <div className="flex items-center gap-3">
                    <span className="text-md text-muted-foreground font-semibold">
                      Category :
                    </span>
                    <span className="text-muted-foreground text-md font-semibold underline">
                      {rcaData.rcaCategory || 'Uncategorized'}
                    </span>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  {/* Root Cause Analysis */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        Root Cause Analysis
                      </Label>
                    </div>
                    <div className="bg-background/60 rounded-lg dark:bg-gray-800">
                      <div className="flex items-stretch gap-3">
                        <div className="bg-primary/70 dark:bg-primary/60 w-1 self-stretch rounded-full" />
                        <p className="p-2 text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                          {rcaData.rootCauseAnalysis}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contributing Factors and Preventive Measures */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {rcaData.rcaContributingFactors &&
                      rcaData.rcaContributingFactors.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-gray-500" />
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Impacting Factors
                            </Label>
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs"
                            >
                              {rcaData.rcaContributingFactors.length}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {rcaData.rcaContributingFactors.map(
                              (factor, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 rounded-md bg-gray-50 p-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                >
                                  <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                                  <span className="leading-relaxed">
                                    {factor}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {rcaData.rcaPreventiveMeasures &&
                      rcaData.rcaPreventiveMeasures.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-500" />
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Preventive Measures
                            </Label>
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs"
                            >
                              {rcaData.rcaPreventiveMeasures.length}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {rcaData.rcaPreventiveMeasures.map(
                              (measure, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 rounded-md bg-gray-50 p-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                >
                                  <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-500" />
                                  <span className="leading-relaxed">
                                    {measure}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  {/* Completion Info */}
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>
                        Completed by{' '}
                        <strong>{rcaData.rcaCompletedBy.name}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(rcaData.rcaCompletedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {isEditable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="mt-4"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Root Cause Analysis
                    </Button>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    No Root Cause Analysis added yet
                  </h3>
                  <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-gray-600 dark:text-gray-400">
                    Capture the underlying cause of this issue to strengthen
                    long-term reliability and prevent similar incidents in the
                    future.
                  </p>
                  {isEditable && (
                    <Button onClick={() => setIsEditing(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Root Cause Analysis
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              {/* Root Cause Analysis */}
              <div className="space-y-2">
                <Label
                  htmlFor="rootCauseAnalysis"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Root Cause Analysis *
                </Label>
                <Textarea
                  id="rootCauseAnalysis"
                  value={formData.rootCauseAnalysis}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rootCauseAnalysis: e.target.value,
                    }))
                  }
                  placeholder="Describe the root cause of the issue in detail. Include what happened, why it happened, and the chain of events that led to the problem..."
                  className="min-h-[120px] resize-none"
                  rows={6}
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label
                  htmlFor="rcaCategory"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Target className="h-4 w-4" />
                  Category *
                </Label>
                <div className="space-y-4">
                  <Input
                    id="rcaCategory"
                    value={formData.rcaCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rcaCategory: e.target.value,
                      }))
                    }
                    placeholder="Enter category or select from suggestions below"
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {rcaCategories.map((category) => (
                      <Badge
                        key={category}
                        variant={
                          formData.rcaCategory === category
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer transition-all hover:scale-105"
                        role="button"
                        aria-pressed={formData.rcaCategory === category}
                        tabIndex={0}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            rcaCategory: category,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setFormData((prev) => ({
                              ...prev,
                              rcaCategory: category,
                            }));
                          }
                        }}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contributing Factors */}
              <div className="space-y-3">
                <Tooltip>
                  <TooltipTrigger>
                    <Label className="flex items-center gap-2 text-sm font-semibold">
                      Impacting Factors
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Additional factors that contributed to the issue</p>
                  </TooltipContent>
                </Tooltip>

                <div className="space-y-3">
                  {formData.rcaContributingFactors?.map((factor, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800"
                    >
                      <div className="max-w-none flex-1 justify-start px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300">
                        {factor}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContributingFactor(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label={`Remove contributing factor ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newContributingFactor}
                      onChange={(e) => setNewContributingFactor(e.target.value)}
                      placeholder="Add a contributing factor..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addContributingFactor();
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={addContributingFactor}
                      disabled={!newContributingFactor.trim()}
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preventive Measures */}
              <div className="space-y-3">
                <Tooltip>
                  <TooltipTrigger>
                    <Label className="flex items-center gap-2 text-sm font-semibold">
                      Preventive Measures *
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Actions to prevent similar issues in the future</p>
                  </TooltipContent>
                </Tooltip>

                <div className="space-y-3">
                  {formData.rcaPreventiveMeasures?.map((measure, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800"
                    >
                      <Badge
                        variant="outline"
                        className="max-w-none flex-1 justify-start py-2 text-left"
                      >
                        {measure}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePreventiveMeasure(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label={`Remove preventive measure ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newPreventiveMeasure}
                      onChange={(e) => setNewPreventiveMeasure(e.target.value)}
                      placeholder="Add a preventive measure..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addPreventiveMeasure();
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={addPreventiveMeasure}
                      disabled={!newPreventiveMeasure.trim()}
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSaveDisabled}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {rcaData
                    ? 'Update Root Cause Analysis'
                    : 'Save Root Cause Analysis'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
