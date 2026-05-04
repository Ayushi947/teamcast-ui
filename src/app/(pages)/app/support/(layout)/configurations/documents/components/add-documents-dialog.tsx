'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { documentConfigService } from '@/lib/services/services';
import { Country } from 'country-state-city';
import {
  CreateDocumentConfigRequest,
  DocumentTypeEnum,
  ICountryWithDocuments,
  IDocumentConfig,
} from '@/lib/shared';
import {
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Eye,
  Type,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export type DocumentConfigType = {
  name: string;
  type: string;
  required: boolean;
  isCustom?: boolean; // Flag to indicate if this is a custom type
};

type AddDocumentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: ICountryWithDocuments;
  onSuccess?: () => void;
};

export function AddDocumentsDialog({
  open,
  onOpenChange,
  country,
  onSuccess,
}: AddDocumentsDialogProps) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<CreateDocumentConfigRequest>({
    countryName: '',
    documentConfig: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [availableDocTypes, setAvailableDocTypes] = useState<string[]>(
    Object.values(DocumentTypeEnum)
  );
  const [customDocumentTypes, setCustomDocumentTypes] = useState<
    Record<number, string>
  >({}); // Track custom types by document index
  const [isCustomType, setIsCustomType] = useState<Record<number, boolean>>({}); // Track if each document uses custom type

  // Memoized countries list
  const countries = useMemo(() => Country.getAllCountries(), []);

  // Get existing documents for the selected country (only if not provided via country prop)
  const { data: existingDocumentsResponse, isLoading: isLoadingDocuments } =
    useQuery<any, any, { data: IDocumentConfig[] }>({
      queryKey: ['documents', config.countryName],
      queryFn: () =>
        documentConfigService.getDocumentsByCountry(config.countryName),
      enabled: !!config.countryName && open && !country, // Only fetch if no country prop
    });

  // Get existing documents from either the country prop or API response
  const existingDocuments = useMemo(() => {
    if (country?.documentConfigs) return country.documentConfigs;
    if (existingDocumentsResponse?.data) return existingDocumentsResponse.data; // 👈 ensure this is the array
    return [];
  }, [country?.documentConfigs, existingDocumentsResponse]);

  // Check if we're dealing with a new country (no existing documents)
  const isNewCountry = useMemo(() => {
    return existingDocuments.length === 0;
  }, [existingDocuments.length]);

  // Reset form when dialog opens/closes or country changes
  useEffect(() => {
    if (open) {
      if (country) {
        // If country is provided from row click, set it and disable selection
        setConfig({
          countryName: country.countryName,
          documentConfig: [],
        });
      } else {
        // Otherwise reset to empty
        setConfig({
          countryName: '',
          documentConfig: [],
        });
      }
      setErrors({});
      setCustomDocumentTypes({});
      setIsCustomType({});
    }
  }, [open, country]);

  // State to track if API returned empty documents for the country
  const [isNoDocumentsFound, setIsNoDocumentsFound] = useState<boolean>(false);

  // Format document name function (needs to be defined before it's used)
  const formatDocumentName = useCallback((type: string | undefined): string => {
    if (!type) return '';
    // Check if it's a predefined enum value
    const isPredefined = Object.values(DocumentTypeEnum).includes(
      type as DocumentTypeEnum
    );
    if (isPredefined) {
      return type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    // For custom types, format them nicely
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  // Get available document types function (needs to be defined before it's used)
  const getAvailableDocumentTypes = useCallback(
    (currentIndex?: number) => {
      // Filter out document types that are already selected in other rows
      const selectedTypes = config.documentConfig
        .map((doc, i) => (i !== currentIndex ? doc.type : null))
        .filter(Boolean) as string[];

      return availableDocTypes.filter((type) => !selectedTypes.includes(type));
    },
    [config.documentConfig, availableDocTypes]
  );

  // Update available document types when existing documents change
  useEffect(() => {
    const allDocTypes = Object.values(DocumentTypeEnum);

    if (existingDocuments.length === 0) {
      // If no documents exist for this country, make all document types available
      setAvailableDocTypes(allDocTypes);
      setIsNoDocumentsFound(true);
    } else {
      // Filter out already configured document types
      const existingTypes = existingDocuments
        .map((doc: IDocumentConfig) => doc.type)
        .filter(Boolean);
      const available = allDocTypes.filter(
        (type) => !existingTypes.includes(type)
      );
      setAvailableDocTypes(available);
      setIsNoDocumentsFound(false);
    }
  }, [existingDocuments]);

  const handleSave = useCallback(async () => {
    // Validate all documents before saving
    const validationErrors: Record<string, string> = {};

    config.documentConfig.forEach((doc, index) => {
      if (!doc.type || doc.type.trim() === '') {
        validationErrors[`document_${index}_type`] =
          'Document type is required';
      }
      if (isCustomType[index] && (!doc.type || doc.type.trim() === '')) {
        validationErrors[`document_${index}_type`] =
          'Custom document type cannot be empty';
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...validationErrors }));
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare document configs, ensuring custom types are properly formatted
      const documentConfigsToSave = config.documentConfig
        .filter((doc) => doc.type && doc.type.trim() !== '') // Filter out invalid docs
        .map((doc) => ({
          name: doc.name || doc.type || '',
          type: doc.type || '',
          required: doc.required,
        }));

      await documentConfigService.createDocumentConfig(
        config.countryName,
        documentConfigsToSave
      );

      // Invalidate and refetch queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: ['support-country-data'],
        exact: false, // Invalidate all queries that start with this key
      });
      await queryClient.invalidateQueries({
        queryKey: ['documents', config.countryName],
      });

      // Actively refetch the main query to ensure data is updated
      await queryClient.refetchQueries({
        queryKey: ['support-country-data'],
        exact: false,
      });

      toast.success('Document configuration saved successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save document configuration', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    config.countryName,
    config.documentConfig,
    isCustomType,
    documentConfigService,
    queryClient,
    onSuccess,
    onOpenChange,
  ]);

  const addDocumentType = useCallback(() => {
    // Get available types considering current selections
    const availableTypes = getAvailableDocumentTypes();
    const newIndex = config.documentConfig.length;

    // If no predefined types available, start with custom type
    const useCustomType = availableTypes.length === 0;

    const newDoc: DocumentConfigType = {
      name: useCustomType ? '' : formatDocumentName(availableDocTypes[0]),
      type: useCustomType ? '' : availableDocTypes[0],
      required: true,
      isCustom: useCustomType,
    };

    setConfig({
      ...config,
      documentConfig: [...config.documentConfig, newDoc],
    });

    // Initialize custom type state
    if (useCustomType) {
      setIsCustomType((prev) => ({ ...prev, [newIndex]: true }));
      setCustomDocumentTypes((prev) => ({ ...prev, [newIndex]: '' }));
    } else {
      setIsCustomType((prev) => ({ ...prev, [newIndex]: false }));
    }

    // Clear errors if documents are now added
    if (errors.documents) {
      setErrors((prev) => ({ ...prev, documents: '' }));
    }
  }, [
    getAvailableDocumentTypes,
    availableDocTypes,
    formatDocumentName,
    config,
    setConfig,
    errors,
    setErrors,
  ]);

  const removeDocumentType = useCallback(
    (index: number) => {
      setConfig({
        ...config,
        documentConfig: config.documentConfig.filter((_, i) => i !== index),
      });

      // Clear custom type state
      const newCustomTypes = { ...customDocumentTypes };
      const newIsCustom = { ...isCustomType };
      delete newCustomTypes[index];
      delete newIsCustom[index];

      // Reindex remaining custom types
      const reindexedCustom: Record<number, string> = {};
      const reindexedIsCustom: Record<number, boolean> = {};
      Object.keys(newCustomTypes).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexedCustom[oldIndex - 1] = newCustomTypes[oldIndex];
          reindexedIsCustom[oldIndex - 1] = newIsCustom[oldIndex];
        } else if (oldIndex < index) {
          reindexedCustom[oldIndex] = newCustomTypes[oldIndex];
          reindexedIsCustom[oldIndex] = newIsCustom[oldIndex];
        }
      });
      setCustomDocumentTypes(reindexedCustom);
      setIsCustomType(reindexedIsCustom);

      // Clear any errors for this document
      const newErrors = { ...errors };
      delete newErrors[`document_${index}_name`];
      delete newErrors[`document_${index}_type`];
      setErrors(newErrors);
    },
    [config, setConfig, errors, setErrors, customDocumentTypes, isCustomType]
  );

  const updateDocumentType = useCallback(
    (index: number, type: string) => {
      const updatedDocs = config.documentConfig.map((doc, i) =>
        i === index
          ? {
              ...doc,
              type,
              name: formatDocumentName(type),
              isCustom: false,
            }
          : doc
      );
      setConfig({ ...config, documentConfig: updatedDocs });

      // Update custom type state
      setIsCustomType((prev) => ({ ...prev, [index]: false }));
      setCustomDocumentTypes((prev) => {
        const newCustom = { ...prev };
        delete newCustom[index];
        return newCustom;
      });

      // Clear name error for this document as we're updating it
      const newErrors = { ...errors };
      delete newErrors[`document_${index}_name`];
      delete newErrors[`document_${index}_type`];
      setErrors(newErrors);
    },
    [config, setConfig, formatDocumentName, errors, setErrors]
  );

  const toggleCustomType = useCallback(
    (index: number) => {
      const currentIsCustom = isCustomType[index] || false;
      const newIsCustom = !currentIsCustom;

      setIsCustomType((prev) => ({ ...prev, [index]: newIsCustom }));

      const updatedDocs = config.documentConfig.map((doc, i) => {
        if (i === index) {
          if (newIsCustom) {
            // Switching to custom type
            return {
              ...doc,
              type: customDocumentTypes[index] || '',
              name: customDocumentTypes[index] || '',
              isCustom: true,
            };
          } else {
            // Switching back to predefined type
            const availableTypes = getAvailableDocumentTypes(index);
            const defaultType = availableTypes[0] || DocumentTypeEnum.OTHER;
            return {
              ...doc,
              type: defaultType,
              name: formatDocumentName(defaultType),
              isCustom: false,
            };
          }
        }
        return doc;
      });

      setConfig({ ...config, documentConfig: updatedDocs });

      // Clear errors
      const newErrors = { ...errors };
      delete newErrors[`document_${index}_name`];
      delete newErrors[`document_${index}_type`];
      setErrors(newErrors);
    },
    [
      isCustomType,
      customDocumentTypes,
      config,
      setConfig,
      getAvailableDocumentTypes,
      formatDocumentName,
      errors,
      setErrors,
    ]
  );

  const updateCustomDocumentType = useCallback(
    (index: number, value: string) => {
      // Normalize the value (lowercase, replace spaces with underscores)
      const normalizedValue = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      setCustomDocumentTypes((prev) => ({ ...prev, [index]: normalizedValue }));

      // Format the name nicely for display
      const formattedName = normalizedValue
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const updatedDocs = config.documentConfig.map((doc, i) =>
        i === index
          ? {
              ...doc,
              type: normalizedValue,
              name: formattedName || normalizedValue,
              isCustom: true,
            }
          : doc
      );
      setConfig({ ...config, documentConfig: updatedDocs });

      // Clear errors
      const newErrors = { ...errors };
      delete newErrors[`document_${index}_type`];
      setErrors(newErrors);
    },
    [config, setConfig, errors, setErrors]
  );

  const toggleRequired = useCallback(
    (index: number) => {
      const updatedDocs = config.documentConfig.map((doc, i) =>
        i === index ? { ...doc, required: !doc.required } : doc
      );
      setConfig({ ...config, documentConfig: updatedDocs });
    },
    [config, setConfig]
  );

  // These functions are now defined earlier in the component

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="text-primary h-5 w-5" />
            Add Document Requirements{' '}
            {config.countryName ? `for ${config.countryName}` : ''}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Configure document verification requirements for this country
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 p-2">
            {/* Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select
                value={config.countryName}
                onValueChange={(value) => {
                  setConfig({
                    ...config,
                    countryName: value,
                    documentConfig: [],
                  });
                  if (errors.countryName) {
                    setErrors((prev) => ({ ...prev, countryName: '' }));
                  }
                }}
                disabled={isSaving || !!country} // Disable if country is provided from row click
              >
                <SelectTrigger
                  className={cn(
                    'w-full border transition-colors focus:ring-2 focus:ring-purple-200',
                    errors.countryName
                      ? 'border-red-500 focus:ring-red-200'
                      : ''
                  )}
                >
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countries.map((c) => (
                    <SelectItem key={c.isoCode} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.countryName && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.countryName}
                </p>
              )}
            </div>

            {/* Document Requirements Configuration */}
            {config.countryName && (
              <>
                {/* Existing Documents Section */}
                {existingDocuments.length > 0 && (
                  <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                        <Eye className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-purple-800">
                          Existing Documents
                        </Label>
                        <p className="text-xs text-purple-600">
                          {existingDocuments.length} document
                          {existingDocuments.length !== 1 ? 's' : ''} already
                          configured
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      {existingDocuments.map((doc, index) => (
                        <div
                          key={`existing-${index}`}
                          className="flex items-center justify-between rounded-md border border-purple-200 bg-white px-3 py-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-50">
                              <FileText className="h-3 w-3 text-purple-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {formatDocumentName(doc.type)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Document Type
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.required ? (
                              <Badge
                                variant="outline"
                                className="border-green-200 bg-green-50 text-xs font-medium text-green-700"
                              >
                                Required
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-gray-200 bg-gray-50 text-xs font-medium text-gray-600"
                              >
                                Optional
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Documents Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold text-gray-900">
                        {isNewCountry
                          ? 'Configure Document Requirements'
                          : 'Add New Document Requirements'}
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDocumentType}
                      disabled={isSaving}
                      className="flex items-center gap-2 border-purple-200 text-purple-700 transition-all hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add Document
                    </Button>
                  </div>

                  {isLoadingDocuments && !country ? (
                    <div className="bg-card flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-200">
                          Loading existing documents...
                        </p>
                      </div>
                    </div>
                  ) : availableDocTypes.length === 0 &&
                    !isNoDocumentsFound &&
                    !config.documentConfig.length ? (
                    <div className="bg-card rounded-lg border border-dashed border-gray-300 py-8 text-center">
                      <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
                      <p className="text-sm font-medium text-gray-700 dark:text-white">
                        All predefined document types are already configured for
                        this country
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        You can still add custom document types using the
                        &quot;Add Document&quot; button
                      </p>
                    </div>
                  ) : config.documentConfig.length === 0 ? (
                    <div className="bg-card rounded-lg border border-dashed border-gray-300 py-8 text-center">
                      <FileText className="text-primary mx-auto mb-3 h-10 w-10" />
                      <p className="text-sm font-medium text-gray-700 dark:text-white">
                        {isNewCountry
                          ? 'No document requirements configured yet'
                          : 'No new document requirements added yet'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Click &quot;Add Document&quot; to start configuring
                        requirements
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Document list */}
                      <div className="flex flex-col gap-4">
                        {config.documentConfig.map((doc, index) => (
                          <div
                            key={`doc-${index}`}
                            className="rounded-lg border border-purple-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                          >
                            <div className="flex flex-col gap-3">
                              {/* Header with document type and actions */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50">
                                    <FileText className="text-primary h-4 w-4" />
                                  </div>
                                  <h3 className="font-medium text-gray-800">
                                    {doc.name || formatDocumentName(doc.type)}
                                  </h3>
                                  {doc.required ? (
                                    <Badge
                                      variant="outline"
                                      className="border-purple-200 bg-purple-50 text-xs font-medium text-purple-700"
                                    >
                                      Required
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 dark:border-gray-700"
                                    >
                                      Optional
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeDocumentType(index)}
                                  className="h-8 w-8 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                  disabled={isSaving}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Document Type Selection */}
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                  <div className="mb-1 flex items-center justify-between">
                                    <Label className="block text-xs font-medium text-gray-600">
                                      Document Type
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleCustomType(index)}
                                      className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
                                      disabled={isSaving}
                                    >
                                      {isCustomType[index] ? (
                                        <>
                                          <Type className="mr-1 h-3 w-3" />
                                          Use Predefined
                                        </>
                                      ) : (
                                        <>
                                          <Type className="mr-1 h-3 w-3" />
                                          Use Custom
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  {isCustomType[index] ? (
                                    <div className="space-y-1">
                                      <Input
                                        type="text"
                                        value={customDocumentTypes[index] || ''}
                                        onChange={(e) =>
                                          updateCustomDocumentType(
                                            index,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter custom document type (e.g., business_license)"
                                        disabled={isSaving}
                                        className="w-full border-gray-200 bg-white"
                                      />
                                      <p className="text-xs text-gray-500">
                                        Use lowercase with underscores (e.g.,
                                        business_license)
                                      </p>
                                      {errors[`document_${index}_type`] && (
                                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                          <AlertCircle className="h-3 w-3" />
                                          {errors[`document_${index}_type`]}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <Select
                                      value={doc.type}
                                      onValueChange={(value) =>
                                        updateDocumentType(index, value)
                                      }
                                      disabled={isSaving}
                                    >
                                      <SelectTrigger className="w-full border-gray-200 bg-white">
                                        <SelectValue placeholder="Select document type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getAvailableDocumentTypes(index).map(
                                          (type) => (
                                            <SelectItem key={type} value={type}>
                                              {formatDocumentName(type)}
                                            </SelectItem>
                                          )
                                        )}
                                        {doc.type &&
                                          !getAvailableDocumentTypes(
                                            index
                                          ).includes(doc.type as any) && (
                                            <SelectItem value={doc.type}>
                                              {formatDocumentName(doc.type)}
                                            </SelectItem>
                                          )}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>

                                <div>
                                  <Label className="mb-1 block text-xs font-medium text-gray-600">
                                    Requirement
                                  </Label>
                                  <div className="mt-3 flex h-10 items-center rounded-md border border-gray-200 bg-white px-3">
                                    <div
                                      className="flex w-full cursor-pointer items-center gap-2"
                                      onClick={() => toggleRequired(index)}
                                    >
                                      <Checkbox
                                        id={`required-${index}`}
                                        checked={doc.required}
                                        onCheckedChange={() =>
                                          toggleRequired(index)
                                        }
                                        disabled={isSaving}
                                        className="border-gray-300 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                                      />
                                      <label
                                        htmlFor={`required-${index}`}
                                        className="cursor-pointer text-sm text-gray-700"
                                      >
                                        Mark as required document
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {errors.documents && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {errors.documents}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
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
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Documents'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
