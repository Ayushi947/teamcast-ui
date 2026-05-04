'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  IPartnerCandidate,
  IPartnerCandidateUpdate,
  CandidateStatusEnum,
  CandidateAssessmentStageEnum,
  CandidateJobSearchStatusEnum,
  SexEnum,
  MaritalStatusEnum,
  logger,
} from '@/lib/shared';
import { partnerCandidateService } from '@/lib/services/services';

interface EditCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: IPartnerCandidate;
  onSave: () => void;
}

const formSchema = z.object({
  status: z.nativeEnum(CandidateStatusEnum),
  assessmentStage: z.nativeEnum(CandidateAssessmentStageEnum),
  jobSearchStatus: z.nativeEnum(CandidateJobSearchStatusEnum),
  sex: z.nativeEnum(SexEnum).optional().nullable(),
  birthDate: z.date().optional().nullable(),
  maritalStatus: z.nativeEnum(MaritalStatusEnum).optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

export function EditCandidateDialog({
  open,
  onOpenChange,
  candidate,
  onSave,
}: EditCandidateDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: candidate.status,
      assessmentStage: candidate.assessmentStage,
      jobSearchStatus: candidate.jobSearchStatus,
      sex: candidate.sex || null,
      birthDate: candidate.birthDate ? new Date(candidate.birthDate) : null,
      maritalStatus: candidate.maritalStatus || null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        status: candidate.status,
        assessmentStage: candidate.assessmentStage,
        jobSearchStatus: candidate.jobSearchStatus,
        sex: candidate.sex || null,
        birthDate: candidate.birthDate ? new Date(candidate.birthDate) : null,
        maritalStatus: candidate.maritalStatus || null,
      });
    }
  }, [open, candidate, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const updateData: IPartnerCandidateUpdate = {
        status: data.status,
        assessmentStage: data.assessmentStage,
        jobSearchStatus: data.jobSearchStatus,
        sex: data.sex || undefined,
        birthDate: data.birthDate || undefined,
        maritalStatus: data.maritalStatus || undefined,
      };

      await partnerCandidateService.updateCandidate(candidate.id, updateData);
      toast.success('Candidate updated successfully');
      onSave();
    } catch (error) {
      toast.error('Failed to update candidate');
      logger.error('Error updating candidate:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
          <DialogDescription>
            Update information for {candidate.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CandidateStatusEnum).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, ' ')}
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
              name="assessmentStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Stage</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessment stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CandidateAssessmentStageEnum).map(
                        (stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage.replace(/_/g, ' ')}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobSearchStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Search Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job search status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CandidateJobSearchStatusEnum).map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? null : value)
                    }
                    defaultValue={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {Object.values(SexEnum).map((sex) => (
                        <SelectItem key={sex} value={sex}>
                          {sex}
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
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birth Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? null : value)
                    }
                    defaultValue={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {Object.values(MaritalStatusEnum).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
