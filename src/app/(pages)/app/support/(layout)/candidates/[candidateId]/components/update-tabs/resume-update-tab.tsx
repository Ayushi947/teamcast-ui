'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from '@/components/ui/select';
import { EducationLevelEnum } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
interface ResumeUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

export function ResumeUpdateTab({ form, isSubmitting }: ResumeUpdateTabProps) {
  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: 'resume.experience',
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: 'resume.education',
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control: form.control,
    name: 'resume.certifications',
  });

  return (
    <div className="space-y-6">
      {/* Resume Summary */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Resume Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <FormField
            control={form.control}
            name="resume.summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Summary
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    disabled={isSubmitting}
                    className="resize-none"
                    placeholder="Professional summary..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="resume.totalExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Total Experience (years)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.5"
                      disabled={isSubmitting}
                      placeholder="0"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resume.highestEducationLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Highest Education Level
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Education Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(EducationLevelEnum).map((level) => (
                          <SelectItem key={level} value={level}>
                            {formatEnumValue(level)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Skills */}
          <FormField
            control={form.control}
            name="resume.skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Skills
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="Enter skills separated by commas"
                    value={
                      Array.isArray(field.value) ? field.value.join(', ') : ''
                    }
                    onChange={(e) => {
                      const skills = e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      field.onChange(skills);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Industries */}
          <FormField
            control={form.control}
            name="resume.industries"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Industries
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    disabled={isSubmitting}
                    placeholder="Enter industries separated by commas"
                    value={
                      Array.isArray(field.value) ? field.value.join(', ') : ''
                    }
                    onChange={(e) => {
                      const industries = e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      field.onChange(industries);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Work Experience
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendExperience({
                  title: '',
                  company: '',
                  startDate: new Date().toISOString(),
                  endDate: undefined,
                  description: '',
                  projects: [],
                })
              }
              disabled={isSubmitting}
              className="h-8 gap-1 bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {experienceFields.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No work experience added yet. Click Add Experience to get
                started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {experienceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-gray-100 p-6 dark:border-gray-700"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                      Experience #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeExperience(index)}
                      disabled={isSubmitting}
                      className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`resume.experience.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Job Title <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              placeholder="e.g., Software Engineer"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`resume.experience.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Company <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              placeholder="Company name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`resume.experience.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Start Date <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              disabled={isSubmitting}
                              value={
                                field.value
                                  ? new Date(field.value)
                                      .toISOString()
                                      .split('T')[0]
                                  : ''
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? new Date(e.target.value).toISOString()
                                    : ''
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`resume.experience.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            End Date (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              disabled={isSubmitting}
                              value={
                                field.value
                                  ? new Date(field.value)
                                      .toISOString()
                                      .split('T')[0]
                                  : ''
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? new Date(e.target.value).toISOString()
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name={`resume.experience.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Job Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              disabled={isSubmitting}
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Education
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendEducation({
                  institution: '',
                  degree: '',
                  field: '',
                  startDate: new Date().toISOString(),
                  endDate: undefined,
                })
              }
              disabled={isSubmitting}
              className="h-8 gap-1 bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {educationFields.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No education added yet. Click Add Education to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {educationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-gray-100 p-6 dark:border-gray-700"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                      Education #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEducation(index)}
                      disabled={isSubmitting}
                      className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`resume.education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Institution <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              placeholder="University/School name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`resume.education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Degree <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              placeholder="e.g., Bachelor of Science"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`resume.education.${index}.fieldOfStudy`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Field of Study
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              placeholder="e.g., Computer Science"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`resume.education.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Start
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                disabled={isSubmitting}
                                value={
                                  field.value
                                    ? new Date(field.value)
                                        .toISOString()
                                        .split('T')[0]
                                    : ''
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? new Date(e.target.value).toISOString()
                                      : ''
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`resume.education.${index}.endDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              End (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                disabled={isSubmitting}
                                value={
                                  field.value
                                    ? new Date(field.value)
                                        .toISOString()
                                        .split('T')[0]
                                    : ''
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? new Date(e.target.value).toISOString()
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Certifications
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendCertification({
                  name: '',
                  issuer: '',
                  date: new Date().toISOString(),
                })
              }
              disabled={isSubmitting}
              className="h-8 gap-1 bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Certification
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {certificationFields.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No certifications added yet. Click Add Certification to get
                started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {certificationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-gray-100 p-6 dark:border-gray-700"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                      Certification #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCertification(index)}
                      disabled={isSubmitting}
                      className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`resume.certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Certification Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              placeholder="e.g., AWS Solutions Architect"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`resume.certifications.${index}.issuer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Issuing Organization *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              placeholder="e.g., Amazon Web Services"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`resume.certifications.${index}.date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                            Issue Date *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              disabled={isSubmitting}
                              value={
                                field.value
                                  ? new Date(field.value)
                                      .toISOString()
                                      .split('T')[0]
                                  : ''
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? new Date(e.target.value).toISOString()
                                    : ''
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
