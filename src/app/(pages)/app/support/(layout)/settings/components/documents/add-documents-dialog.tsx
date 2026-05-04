'use client';

import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Settings,
  X,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Country } from 'country-state-city';
import { documentConfigService } from '@/lib/services/services';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CreateDocumentConfigRequest, logger } from '@/lib/shared';
import { useQuery } from '@tanstack/react-query';

const DocumentType = {
  Passport: 'passport',
  Aadhar: 'aadhar',
  NationalId: 'national_id',
  DriversLicense: 'drivers_license',
  BirthCertificate: 'birth_certificate',
  SocialSecurityCard: 'social_security_card',
  Visa: 'visa',
  WorkPermit: 'work_permit',
  UtilityBill: 'utility_bill',
  BankStatement: 'bank_statement',
  TaxDocument: 'tax_document',
  InsuranceDocument: 'insurance_document',
  PropertyDocument: 'property_document',
  LegalCompliance: 'legal_compliance',
} as const;

export type DocumentConfigType = {
  name: string;
  type: string;
  required: boolean;
};

type DocumentVerificationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countryConfig?: CreateDocumentConfigRequest;
  onCancel?: () => void;
  onSaved?: (config: CreateDocumentConfigRequest) => void;
};

const countries = Country.getAllCountries();

export default function DocumentVerificationDialog({
  open,
  onOpenChange,
  countryConfig: initialConfig,
  onCancel,
  onSaved,
}: DocumentVerificationDialogProps) {
  const isEditing = !!initialConfig;
  const [config, setConfig] = useState<CreateDocumentConfigRequest>({
    countryName: '',
    documentConfig: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    } else {
      setConfig({
        countryName: '',
        documentConfig: [],
      });
    }
    setErrors({});
  }, [initialConfig, open]);

  // We don't need to load existing document config anymore as we're adding one document at a time

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.countryName) {
      newErrors.countryName = 'Please select a country';
    }

    if (config.documentConfig.length === 0) {
      newErrors.documents = 'At least one document type must be selected';
    }

    // Validate document names
    config.documentConfig.forEach((doc, index) => {
      if (!doc.name || doc.name.trim() === '') {
        newErrors[`document_${index}_name`] = 'Document name is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(config);
      onSaved?.(config);
      onOpenChange(false);
    } catch (error) {
      logger.error('Error saving document config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const onSave = async (config: CreateDocumentConfigRequest) => {
    try {
      return documentConfigService.createDocumentConfig(
        config.countryName,
        config.documentConfig
      );
    } catch (error) {
      logger.error('Error in onSave:', error);
      throw error;
    }
  };

  const addDocumentType = () => {
    // Only add one document at a time, clear any existing ones
    const availableTypes = Object.values(DocumentType);

    if (availableTypes.length === 0) return;

    const newDoc: DocumentConfigType = {
      name: formatDocumentName(availableTypes[0]),
      type: availableTypes[0],
      required: true,
    };

    setConfig({
      ...config,
      documentConfig: [newDoc], // Only keep one document at a time
    });

    // Clear errors if documents are now added
    if (errors.documents) {
      setErrors((prev) => ({ ...prev, documents: '' }));
    }
  };

  const removeDocumentType = (index: number) => {
    setConfig({
      ...config,
      documentConfig: config.documentConfig.filter((_, i) => i !== index),
    });

    // Clear any errors for this document
    const newErrors = { ...errors };
    delete newErrors[`document_${index}_name`];
    setErrors(newErrors);
  };

  const updateDocumentType = (index: number, type: string) => {
    const updatedDocs = config.documentConfig.map((doc, i) =>
      i === index ? { ...doc, type, name: formatDocumentName(type) } : doc
    );
    setConfig({ ...config, documentConfig: updatedDocs });

    // Clear name error for this document as we're updating it
    const newErrors = { ...errors };
    delete newErrors[`document_${index}_name`];
    setErrors(newErrors);
  };

  const updateDocumentName = (index: number, name: string) => {
    const updatedDocs = config.documentConfig.map((doc, i) =>
      i === index ? { ...doc, name } : doc
    );
    setConfig({ ...config, documentConfig: updatedDocs });

    // Clear name error for this document
    if (name.trim() !== '') {
      const newErrors = { ...errors };
      delete newErrors[`document_${index}_name`];
      setErrors(newErrors);
    }
  };

  const toggleRequired = (index: number) => {
    const updatedDocs = config.documentConfig.map((doc, i) =>
      i === index ? { ...doc, required: !doc.required } : doc
    );
    setConfig({ ...config, documentConfig: updatedDocs });
  };

  const formatDocumentName = (type: string): string => {
    return (
      type &&
      type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  };

  const { data: addedDocumentTypes } = useQuery({
    queryKey: ['addedDocumentTypes'],
    queryFn: () => {
      return documentConfigService.getDocumentsByCountry(config.countryName);
    },
    enabled: !!config.countryName,
  });

  const getAvailableDocumentTypes = (currentIndex?: number) => {
    return Object.values(DocumentType).filter(
      (type) =>
        !addedDocumentTypes?.some(
          (doc, index) => index !== currentIndex && doc.type === type
        )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-blue-600" />
            {isEditing
              ? 'Edit Document Verification Requirement'
              : 'Add Document Verification Requirement'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6 p-2">
            {/* Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select
                value={config.countryName}
                onValueChange={(value) => {
                  setConfig({ ...config, countryName: value });
                  if (errors.countryName) {
                    setErrors((prev) => ({ ...prev, countryName: '' }));
                  }
                }}
                disabled={isSaving || isEditing}
              >
                <SelectTrigger
                  className={cn(
                    'w-full border transition-colors focus:ring-2 focus:ring-blue-200',
                    errors.name ? 'border-red-500 focus:ring-red-200' : ''
                  )}
                >
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countries.map((country) => (
                    <SelectItem key={country.isoCode} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.name && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Document Requirements Configuration */}

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Document Type <span className="text-red-500">*</span>
                  </Label>
                  <p className="mt-1 text-sm text-gray-600">
                    Configure the document type user must provide for
                    verification
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addDocumentType}
                        disabled={
                          getAvailableDocumentTypes().length === 0 || isSaving
                        }
                        className="flex items-center gap-2 transition-all hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
                        Select Document Type
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {getAvailableDocumentTypes().length === 0
                        ? 'All document types have been added'
                        : 'Select a document type'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-4">
                {config.documentConfig.map((doc, index) => (
                  <div
                    key={`doc-${index}`}
                    className="rounded-lg border bg-gray-50 p-4 transition-all hover:shadow-sm"
                  >
                    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                      {/* Document Type Selection */}
                      <div className="space-y-1 md:col-span-4">
                        <Label className="text-sm font-medium text-gray-700">
                          Document Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={doc.type}
                          onValueChange={(value) =>
                            updateDocumentType(index, value)
                          }
                          disabled={isSaving}
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableDocumentTypes(index).map((type) => (
                              <SelectItem key={type} value={type}>
                                {formatDocumentName(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Custom Name */}
                      <div className="space-y-1 md:col-span-4">
                        <Label className="text-sm font-medium text-gray-700">
                          Display Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={doc.name}
                          onChange={(e) =>
                            updateDocumentName(index, e.target.value)
                          }
                          placeholder="Custom display name"
                          className={cn(
                            'w-full bg-white',
                            errors[`document_${index}_name`]
                              ? 'border-red-500 focus:ring-red-200'
                              : ''
                          )}
                          disabled={isSaving}
                        />
                        {errors[`document_${index}_name`] && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            {errors[`document_${index}_name`]}
                          </p>
                        )}
                      </div>

                      {/* Required Toggle */}
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Status
                        </Label>
                        <div className="mt-2 flex items-center space-x-2">
                          <Checkbox
                            id={`required-${index}`}
                            checked={doc.required}
                            onCheckedChange={() => toggleRequired(index)}
                            disabled={isSaving}
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <Label
                            htmlFor={`required-${index}`}
                            className="cursor-pointer text-sm"
                          >
                            Required
                          </Label>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex justify-end md:col-span-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocumentType(index)}
                                className="text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                disabled={isSaving}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove document</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        className={cn(
                          'px-2.5 py-0.5 text-xs font-medium',
                          doc.required
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        )}
                      >
                        {doc.required ? 'Required' : 'Optional'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Type: {doc.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {config.documentConfig.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                  <Settings className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">
                    No document types configured yet
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Click Select Document Type to get started
                  </p>
                </div>
              )}

              {errors.documents && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.documents}
                </p>
              )}
            </div>

            {/* Summary */}
            {config.documentConfig.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 transition-all">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900">
                  <CheckCircle2 className="h-4 w-4" />
                  Document Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>
                    <span className="text-blue-600">Country:</span>{' '}
                    <span className="font-medium">
                      {config.countryName || 'Not selected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Document Type:</span>{' '}
                    <span className="font-medium">
                      {config.documentConfig[0]?.type
                        ? formatDocumentName(config.documentConfig[0].type)
                        : 'Not selected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Display Name:</span>{' '}
                    <span className="font-medium">
                      {config.documentConfig[0]?.name || 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Required:</span>{' '}
                    <span className="font-medium">
                      {config.documentConfig[0]?.required ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="-mx-4 flex items-center justify-end gap-3 rounded-b-lg border-t px-4 pt-4 pb-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="border-gray-300 transition-colors hover:bg-gray-100"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !config.countryName ||
              config.documentConfig.length === 0 ||
              isSaving
            }
            className="flex items-center gap-2 bg-blue-600 transition-colors hover:bg-blue-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isSaving
              ? 'Saving...'
              : isEditing
                ? 'Update Document'
                : 'Add Document'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
