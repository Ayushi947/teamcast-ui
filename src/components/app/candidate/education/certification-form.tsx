'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  IResumeCertification,
  IResumeCertificationCreate,
  CertificationLevelEnum,
} from '@/lib/shared';
import { useEffect } from 'react';
import {
  Award,
  Calendar as CalendarIcon,
  FileText,
  Link,
  CalendarDays,
} from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
import { DatePickerCalendar } from '@/components/ui/date-picker-calendar';
import { cn } from '@/lib/utils';
import React from 'react';

const certificationLevels = [
  CertificationLevelEnum.BASIC,
  CertificationLevelEnum.INTERMEDIATE,
  CertificationLevelEnum.ADVANCED,
  CertificationLevelEnum.EXPERT,
] as const;

const noConsecutiveSpecialChars = (val?: string) =>
  !val || !/[^a-zA-Z0-9\s]{3,}/.test(val);

const noMoreThan5ConsecutiveNumbers = (val?: string) =>
  !val || !/\d{6,}/.test(val);

export const formSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name cannot exceed 100 characters')
      .regex(
        /^(?!.*[^A-Za-z\s]{3,})(?!.*\d).*$/,
        'Name contains invalid characters'
      )
      .refine(
        noConsecutiveSpecialChars,
        'Name should not contain consecutive special characters'
      )
      .refine(
        (val) => !/\d{3,}/.test(val),
        'Name should not contain more than 2 consecutive numbers'
      ),

    issuer: z
      .string()
      .min(1, 'Issuer is required')
      .max(100, 'Issuer cannot exceed 100 characters')
      .regex(
        /^(?!.*[^A-Za-z\s]{3,})(?!.*\d).*$/,
        'Issuer contains invalid characters'
      )
      .refine(
        noConsecutiveSpecialChars,
        'Issuer should not contain consecutive special characters'
      )
      .refine(
        (val) => !/\d{3,}/.test(val),
        'Issuer should not contain more than 2 consecutive numbers'
      ),

    issueDate: z.date().optional(),
    expiryDate: z.date().optional(),

    credentialId: z.string().optional(), // <-- refinements removed

    credentialUrl: z.string().url('Must be a valid URL').optional(),

    level: z.enum(certificationLevels).optional(),

    category: z
      .string()
      .regex(
        /^[A-Za-z\s\-,]*$/,
        'Tags should only contain letters, spaces, hyphens, or commas'
      )
      .optional()
      .or(z.literal('')),

    description: z
      .string()
      .optional()
      .refine(
        noConsecutiveSpecialChars,
        'Description should not contain consecutive special characters'
      )
      .refine(
        noMoreThan5ConsecutiveNumbers,
        'Description should not contain more than 5 consecutive numbers'
      ),
  })
  .refine(
    (data) => {
      if (!data.issueDate || !data.expiryDate) return true;
      return data.expiryDate >= data.issueDate;
    },
    {
      message: 'Expiry date must not be before issue date',
      path: ['expiryDate'],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface CertificationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: IResumeCertificationCreate) => void;
  certification?: IResumeCertification;
}

export function CertificationForm({
  open,
  onOpenChange,
  onSubmit,
  certification,
}: CertificationFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      issuer: '',
      issueDate: undefined,
      expiryDate: undefined,
      credentialId: '',
      credentialUrl: '',
      level: undefined,
      category: '',
      description: '',
    },
  });

  const issueDateWatch = form.watch('issueDate');
  const expiryDateWatch = form.watch('expiryDate');

  useEffect(() => {
    if (certification) {
      form.reset({
        name: certification.name,
        issuer: certification.issuer,
        issueDate: certification.issueDate
          ? new Date(certification.issueDate)
          : undefined,
        expiryDate: certification.expiryDate
          ? new Date(certification.expiryDate)
          : undefined,
        credentialId: certification.credentialId,
        credentialUrl: certification.credentialUrl,
        level: certification.level,
        category: certification.category,
        description: certification.description,
      });
    } else {
      form.reset({
        name: '',
        issuer: '',
        issueDate: undefined,
        expiryDate: undefined,
        credentialId: '',
        credentialUrl: '',
        level: undefined,
        category: '',
        description: '',
      });
    }
  }, [certification, form]);

  const handleSubmit = (data: FormValues) => {
    const certificationData: IResumeCertificationCreate = {
      name: data.name,
      issuer: data.issuer,
      issueDate: data.issueDate || new Date(),
      expiryDate: data.expiryDate,
      credentialId: data.credentialId,
      credentialUrl: data.credentialUrl,
      level: data.level as CertificationLevelEnum,
      category: data.category,
      description: data.description,
    };
    onSubmit(certificationData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 sm:max-w-[900px]"
      >
        <div className="flex h-[80vh] flex-col">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <Award className="text-primary h-5 w-5" />
              {certification ? 'Edit Certification' : 'Add Certification'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-sm">
              {certification
                ? 'Update your certification details'
                : 'Add a new certification to your profile'}
            </DialogDescription>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
              >
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <Award className="text-primary h-4 w-4" />
                    Basic Information
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certification Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter certification name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="issuer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuing Organization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter issuing organization"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Duration Section */}
                <div className="space-y-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="text-primary h-4 w-4" />
                    Duration
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground flex items-center gap-2 text-sm font-medium">
                            <CalendarDays className="text-muted-foreground h-4 w-4" />
                            Issue Date (Optional)
                          </FormLabel>
                          <FormControl>
                            <DatePickerCalendar
                              value={issueDateWatch}
                              onChange={(date) => {
                                field.onChange(date);
                              }}
                              placeholder="Select issue date"
                              minDate={new Date(1900, 0, 1)}
                              maxDate={new Date()}
                              className={cn(
                                form.formState.errors.issueDate
                                  ? 'border-destructive'
                                  : ''
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground flex items-center gap-2 text-sm font-medium">
                            <CalendarDays className="text-muted-foreground h-4 w-4" />
                            Expiry Date (Optional)
                          </FormLabel>
                          <FormControl>
                            <DatePickerCalendar
                              value={expiryDateWatch}
                              onChange={(date) => {
                                field.onChange(date);
                              }}
                              placeholder="Select expiry date"
                              minDate={
                                issueDateWatch
                                  ? issueDateWatch
                                  : new Date(1900, 0, 1)
                              }
                              maxDate={
                                new Date(new Date().getFullYear() + 10, 11, 31)
                              }
                              className={cn(
                                form.formState.errors.expiryDate
                                  ? 'border-destructive'
                                  : ''
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Credential Details Section */}
                <div className="space-y-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <Link className="text-primary h-4 w-4" />
                    Credential Details
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="credentialId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credential ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter credential ID"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="credentialUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credential URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="Enter credential URL"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Details Section */}
                <div className="space-y-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <FileText className="text-primary h-4 w-4" />
                    Additional Details
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {certificationLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level.charAt(0) +
                                    level.slice(1).toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter category" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter certification description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>

          {/* Footer */}
          <div className="bg-muted/50 border-t px-6 py-4">
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
                {certification ? 'Update' : 'Add'} Certification
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
