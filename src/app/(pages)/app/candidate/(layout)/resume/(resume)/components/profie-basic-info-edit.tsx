import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useQuery } from '@tanstack/react-query';
import { supportLookupService } from '@/lib/services/services';
import { useMemo, useState } from 'react';
import { CompanyIndustryEnum, ILookupCategoryMinimal } from '@/lib/shared';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Skill, SkillSelector } from '@/components/ui/skill-selector';

import React from 'react';

interface EditFormData {
  name: string;
  jobTitle: string;
  location: string;
  summary: string;
  totalExperience: string;
  industriesString: string;
  languagesString: string;
  resumeSkillsString: string;
}

interface ProfileBasicInfoEditProps {
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  formErrors: Record<string, string>;
  touched: Record<string, boolean>;
  editFormData: EditFormData;
  handleChange: (field: keyof EditFormData, value: any) => void;
  handleBlur: (field: keyof EditFormData) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  updateProfileMutation: {
    isPending: boolean;
  };
  setTouched: (
    updater: (prev: Record<string, boolean>) => Record<string, boolean>
  ) => void;
  setFormErrors: (
    updater: (prev: Record<string, string>) => Record<string, string>
  ) => void;
  validateField: (
    field: keyof EditFormData,
    value: any
  ) => { success: boolean; error?: string };
}

export function ProfileBasicInfoEdit({
  showEditModal,
  setShowEditModal,
  formErrors,
  touched,
  editFormData,
  handleChange,
  handleBlur,
  handleEditSubmit,
  updateProfileMutation,
  setTouched,
  setFormErrors,
  validateField,
}: ProfileBasicInfoEditProps) {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    editFormData.industriesString
      ? editFormData.industriesString.split(',').map((s) => s.trim())
      : []
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    editFormData.languagesString
      ? editFormData.languagesString.split(',').map((s) => s.trim())
      : []
  );
  const [languagesSearch, setLanguagesSearch] = useState('');
  const categoryNames = ['skills', 'industry', 'languages'];
  const { data: lookupCategories } = useQuery({
    queryKey: ['lookup-categories', ...categoryNames],
    queryFn: async () => {
      const response =
        await supportLookupService.getLookupValuesByCategories(categoryNames);
      return response as { lookupValues?: { id: string; label: string }[] }[];
    },
  });

  const languagesCategory = useMemo(() => {
    return lookupCategories?.find(
      (category): category is ILookupCategoryMinimal =>
        typeof category === 'object' &&
        'name' in category &&
        'lookupValues' in category &&
        category.name === 'languages'
    );
  }, [lookupCategories]);

  const filteredLanguages =
    languagesCategory?.lookupValues?.filter((language: { label: string }) => {
      const isAlreadySelected = selectedLanguages.some(
        (selectedLang) =>
          selectedLang.toLowerCase() === language.label.toLowerCase()
      );
      const matchesSearch = language.label
        .toLowerCase()
        .includes(languagesSearch.toLowerCase());
      return !isAlreadySelected && matchesSearch;
    }) ?? [];

  // Sync selectedLanguages with editFormData.languagesString when it changes
  React.useEffect(() => {
    const languages = editFormData.languagesString
      ? editFormData.languagesString
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    setSelectedLanguages(languages);
  }, [editFormData.languagesString]);

  // Sync selectedIndustries with editFormData.industriesString when it changes
  React.useEffect(() => {
    const industries = editFormData.industriesString
      ? editFormData.industriesString
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    setSelectedIndustries(industries);
  }, [editFormData.industriesString]);

  const [skills, setSkills] = React.useState<Skill[]>([]);

  React.useEffect(() => {
    const names = (editFormData.resumeSkillsString || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const uniqueNames = Array.from(new Set(names));
    setSkills(
      uniqueNames.map((name) => ({
        name,
        level: 'Beginner',
        yearsOfExperience: '',
      }))
    );
  }, [editFormData.resumeSkillsString]);

  const handleSkillsChange = (next: Skill[]) => {
    const uniqueByName = Array.from(
      new Map(next.map((s) => [s.name.trim().toLowerCase(), s])).values()
    );
    setSkills(uniqueByName);
    const names = Array.from(
      new Set(uniqueByName.map((s) => s.name.trim()).filter(Boolean))
    ).join(', ');

    // Update the form data
    handleChange('resumeSkillsString', names);

    // Mark the field as touched and validate with the new value
    setTouched((prev) => ({ ...prev, resumeSkillsString: true }));

    // Validate the new value directly
    const validation = validateField('resumeSkillsString', names);
    if (!validation.success) {
      setFormErrors((prev) => ({
        ...prev,
        resumeSkillsString: validation.error || '',
      }));
    } else {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.resumeSkillsString;
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex max-h-[90vh] max-w-3xl flex-col dark:bg-gray-900"
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold sm:text-2xl dark:text-white">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-sm dark:text-gray-400">
            Update your professional information to help recruiters find you.
            Make sure to keep your details accurate and up-to-date.
          </DialogDescription>
        </DialogHeader>
        <div className="custom-scrollbar-thin min-h-0 flex-1 overflow-y-auto">
          <form
            id="profile-form"
            onSubmit={handleEditSubmit}
            className="space-y-4 px-1 py-2 sm:space-y-6 sm:py-4"
          >
            {/* Basic Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-muted-foreground text-xs font-medium sm:text-sm dark:text-gray-400">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={editFormData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={`text-sm text-gray-900 placeholder-gray-400 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500 ${
                      touched.name && formErrors.name
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }`}
                    placeholder="Enter your name"
                    required
                  />
                  {touched.name && formErrors.name && (
                    <p className="text-destructive mt-1 text-xs">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="jobTitle"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Job Title <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    value={editFormData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    onBlur={() => handleBlur('jobTitle')}
                    className={`text-sm text-gray-900 placeholder-gray-400 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500 ${
                      touched.jobTitle && formErrors.jobTitle
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }`}
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                  {touched.jobTitle && formErrors.jobTitle && (
                    <p className="text-destructive mt-1 text-xs">
                      {formErrors.jobTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location and Experience */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-muted-foreground text-xs font-medium sm:text-sm dark:text-gray-400">
                Location and Experience
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <Label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Location <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={editFormData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    onBlur={() => handleBlur('location')}
                    className={`text-sm text-gray-900 placeholder-gray-400 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500 ${
                      touched.location && formErrors.location
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }`}
                    placeholder="e.g., San Francisco, CA"
                    required
                  />
                  {touched.location && formErrors.location && (
                    <p className="text-destructive mt-1 text-xs">
                      {formErrors.location}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="totalExperience"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Years of Experience <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="totalExperience"
                    type="number"
                    value={editFormData.totalExperience ?? ''}
                    onChange={(e) =>
                      handleChange('totalExperience', e.target.value)
                    }
                    onBlur={() => handleBlur('totalExperience')}
                    className={`text-sm text-gray-900 placeholder-gray-400 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500 ${
                      touched.totalExperience && formErrors.totalExperience
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }`}
                    placeholder="Enter years of experience"
                    required
                  />
                  {touched.totalExperience && formErrors.totalExperience && (
                    <p className="text-destructive mt-1 text-xs">
                      {formErrors.totalExperience}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-muted-foreground text-xs font-medium sm:text-sm dark:text-gray-400">
                Professional Summary
              </h3>
              <div>
                <Label
                  htmlFor="summary"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Summary <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="summary"
                  value={editFormData.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  onBlur={() => handleBlur('summary')}
                  className={`min-h-[100px] text-sm text-gray-900 placeholder-gray-400 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500 ${
                    touched.summary && formErrors.summary
                      ? 'border-destructive focus-visible:ring-destructive'
                      : ''
                  }`}
                  placeholder="Write a brief summary about your professional experience and skills..."
                  required
                />
                {touched.summary && formErrors.summary && (
                  <p className="text-destructive mt-1 text-xs">
                    {formErrors.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Skills and Industries */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-muted-foreground text-xs font-medium sm:text-sm dark:text-gray-400">
                Skills and Industries
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <Label
                    htmlFor="resumeSkillsString"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Skills <span className="text-red-600">*</span>
                  </Label>
                  {/* Remove textarea and replace with multi-select dropdown */}
                  <div className="space-y-2">
                    <SkillSelector
                      value={skills}
                      onChange={handleSkillsChange}
                      error={
                        touched.resumeSkillsString
                          ? formErrors.resumeSkillsString
                          : undefined
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="industriesString"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Industries
                  </Label>

                  <div className="space-y-2">
                    <Select
                      value=""
                      onValueChange={(val) => {
                        if (!selectedIndustries.includes(val)) {
                          const newIndustries = [...selectedIndustries, val];
                          setSelectedIndustries(newIndustries);
                          handleChange(
                            'industriesString',
                            newIndustries.join(', ')
                          );
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`text-sm ${
                          touched.industriesString &&
                          formErrors.industriesString
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                        }`}
                      >
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CompanyIndustryEnum).map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind
                              .replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedIndustries.map((industry, idx) => (
                        <Badge
                          key={`${industry}-${idx}`}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {industry
                            .replace(/_/g, ' ')
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          <button
                            type="button"
                            onClick={() => {
                              const newIndustries = selectedIndustries.filter(
                                (i) => i !== industry
                              );
                              setSelectedIndustries(newIndustries);
                              handleChange(
                                'industriesString',
                                newIndustries.join(', ')
                              );
                            }}
                            className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                            aria-label="Remove industry"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {touched.industriesString &&
                      formErrors.industriesString && (
                        <p className="text-destructive mt-1 text-xs">
                          {formErrors.industriesString}
                        </p>
                      )}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="languagesString"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Languages
                  </Label>
                  {/* use multi-select dropdown for languages instead of textarea */}
                  <div className="space-y-2">
                    <Select
                      value=""
                      onValueChange={(val) => {
                        if (!selectedLanguages.includes(val)) {
                          const newLanguages = [...selectedLanguages, val];
                          setSelectedLanguages(newLanguages);
                          handleChange(
                            'languagesString',
                            newLanguages.join(', ')
                          );
                        }
                        setLanguagesSearch('');
                      }}
                    >
                      <SelectTrigger
                        className={
                          touched.languagesString && formErrors.languagesString
                            ? 'border-destructive'
                            : ''
                        }
                      >
                        <SelectValue placeholder="Select or search languages" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search languages..."
                            value={languagesSearch}
                            onChange={(e) => setLanguagesSearch(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                        {filteredLanguages.length > 0 ? (
                          filteredLanguages.map(
                            (language: { id: string; label: string }) => (
                              <SelectItem
                                key={language.id}
                                value={language.label}
                              >
                                {language.label}
                              </SelectItem>
                            )
                          )
                        ) : (
                          <div className="text-muted-foreground px-2 py-1 text-sm">
                            No languages found.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedLanguages.map((language, idx) => (
                        <Badge
                          key={`${language}-${idx}`}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => {
                              const newLanguages = selectedLanguages.filter(
                                (l) => l !== language
                              );
                              setSelectedLanguages(newLanguages);
                              handleChange(
                                'languagesString',
                                newLanguages.join(', ')
                              );
                            }}
                            className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {touched.languagesString && formErrors.languagesString && (
                      <p className="text-destructive mt-1 text-xs">
                        {formErrors.languagesString}
                      </p>
                    )}
                    {/* <p className="text-muted-foreground mt-1 text-xs dark:text-gray-400">
                      Enter languages separated by commas (e.g., English,
                      Spanish, French)
                    </p> */}
                  </div>
                </div>
              </div>
            </div>
          </form>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="profile-form"
              disabled={
                updateProfileMutation.isPending ||
                Object.keys(formErrors).length > 0
              }
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
