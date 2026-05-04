'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { ITourDefinitionExtended } from '@/lib/shared/models/api/support/tour.definition.management.api';
import { tourDefinitionManagementService } from '@/lib/services/services';
import { UserTypeEnum, UserRoleEnum } from '@/lib/shared';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

// Form validation schema
const tourDefinitionFormSchema = z.object({
  tourKey: z.string().min(1, 'Tour key is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  userType: z.nativeEnum(UserTypeEnum),
  userRole: z.nativeEnum(UserRoleEnum).optional(),
  isActive: z.boolean(),
  priority: z.number().int().min(0),
  version: z.string().min(1, 'Version is required'),
  pagePattern: z.string().optional(),
  targetPages: z.string().optional(), // JSON string
  tourGroup: z.string().optional(),
  autoStart: z.boolean(),
  restartOnPageChange: z.boolean(),
  // Complex fields as JSON strings for easier editing
  triggerConditions: z.string().min(1, 'Trigger conditions are required'),
  tourSteps: z.string().min(1, 'Tour steps are required'),
  tourSettings: z.string().min(1, 'Tour settings are required'),
});

type TourDefinitionFormValues = z.infer<typeof tourDefinitionFormSchema>;

interface TourDefinitionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour?: ITourDefinitionExtended | null;
  onSuccess?: () => void;
}

export function TourDefinitionFormDialog({
  open,
  onOpenChange,
  tour,
  onSuccess,
}: TourDefinitionFormDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!tour;

  const form = useForm<TourDefinitionFormValues>({
    resolver: zodResolver(tourDefinitionFormSchema),
    defaultValues: {
      tourKey: '',
      name: '',
      description: '',
      userType: UserTypeEnum.CANDIDATE,
      userRole: undefined,
      isActive: true,
      priority: 0,
      version: '1.0.0',
      pagePattern: '',
      targetPages: '',
      tourGroup: '',
      autoStart: false,
      restartOnPageChange: false,
      triggerConditions: JSON.stringify(
        {
          triggerType: 'ON_FIRST_VISIT',
          conditions: {},
          excludeConditions: {},
        },
        null,
        2
      ),
      tourSteps: JSON.stringify([], null, 2),
      tourSettings: JSON.stringify(
        {
          allowSkip: true,
          allowPause: true,
          autoAdvance: false,
          showProgress: true,
          showNavigation: true,
          theme: 'light',
          restartable: true,
          maxDismissals: 3,
          hideOnCompletion: true,
          allowUserWork: true,
        },
        null,
        2
      ),
    },
  });

  // Load tour data when editing
  useEffect(() => {
    if (open && tour) {
      form.reset({
        tourKey: tour.tourKey,
        name: tour.name,
        description: tour.description || '',
        userType: tour.userType,
        userRole: tour.userRole || undefined,
        isActive: tour.isActive,
        priority: tour.priority,
        version: tour.version,
        pagePattern: tour.pagePattern || '',
        targetPages: tour.targetPages
          ? JSON.stringify(tour.targetPages, null, 2)
          : '',
        tourGroup: tour.tourGroup || '',
        autoStart: tour.autoStart || false,
        restartOnPageChange: tour.restartOnPageChange || false,
        triggerConditions: JSON.stringify(tour.triggerConditions, null, 2),
        tourSteps: JSON.stringify(tour.tourSteps, null, 2),
        tourSettings: JSON.stringify(tour.tourSettings, null, 2),
      });
    } else if (open && !tour) {
      form.reset();
    }
  }, [open, tour, form]);

  const onSubmit = async (values: TourDefinitionFormValues) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Parse JSON strings
      let triggerConditions;
      let tourSteps;
      let tourSettings;
      let targetPages;

      try {
        triggerConditions = JSON.parse(values.triggerConditions);
      } catch (_e) {
        toast.error('Invalid JSON in trigger conditions');
        setIsSubmitting(false);
        return;
      }

      try {
        tourSteps = JSON.parse(values.tourSteps);
      } catch (_e) {
        toast.error('Invalid JSON in tour steps');
        setIsSubmitting(false);
        return;
      }

      try {
        tourSettings = JSON.parse(values.tourSettings);
      } catch (_e) {
        toast.error('Invalid JSON in tour settings');
        setIsSubmitting(false);
        return;
      }

      if (values.targetPages) {
        try {
          targetPages = JSON.parse(values.targetPages);
        } catch (_e) {
          toast.error('Invalid JSON in target pages');
          setIsSubmitting(false);
          return;
        }
      }

      const tourData: Omit<
        ITourDefinitionExtended,
        'id' | 'createdAt' | 'updatedAt'
      > = {
        tourKey: values.tourKey,
        name: values.name,
        description: values.description || undefined,
        userType: values.userType,
        userRole: values.userRole || undefined,
        isActive: values.isActive,
        priority: values.priority,
        version: values.version,
        pagePattern: values.pagePattern || undefined,
        targetPages: targetPages || undefined,
        tourGroup: values.tourGroup || undefined,
        autoStart: values.autoStart,
        restartOnPageChange: values.restartOnPageChange,
        triggerConditions,
        tourSteps,
        tourSettings,
      };

      if (isEditMode && tour) {
        await tourDefinitionManagementService.updateTourDefinition(
          tour.id,
          tourData
        );
        toast.success('Tour definition updated successfully');
      } else {
        await tourDefinitionManagementService.createTourDefinition(tourData);
        toast.success('Tour definition created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['tour-definitions'] });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      logger.error('Error saving tour definition:', error);
      toast.error(error?.message || 'Failed to save tour definition');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Tour Definition' : 'Create Tour Definition'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the tour definition details'
              : 'Create a new tour definition to guide users through the platform'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <ScrollArea className="flex-1 pr-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="targeting">Targeting</TabsTrigger>
                  <TabsTrigger value="steps">Tour Steps</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tourKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tour Key *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="candidate_onboarding_resume"
                              disabled={isEditMode}
                            />
                          </FormControl>
                          <FormDescription>
                            Unique identifier (cannot be changed after creation)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Resume Upload Guide"
                            />
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
                            {...field}
                            placeholder="Guide for uploading and reviewing your resume"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(UserTypeEnum).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
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
                      name="userRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Role</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(
                                value === 'NONE' ? undefined : value
                              )
                            }
                            value={field.value || 'NONE'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Any role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NONE">Any role</SelectItem>
                              {Object.values(UserRoleEnum).map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
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
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Higher number = higher priority
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1.0.0" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tourGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tour Group</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="candidate_onboarding"
                            />
                          </FormControl>
                          <FormDescription>
                            Group tours together for skip/dismiss behavior
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Enable this tour definition
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoStart"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Auto Start</FormLabel>
                            <FormDescription>
                              Start tour automatically
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="restartOnPageChange"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Restart on Page Change</FormLabel>
                            <FormDescription>
                              Restart when page changes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Targeting Tab */}
                <TabsContent value="targeting" className="mt-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="pagePattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Pattern</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="/app/candidate/onboard/resume"
                          />
                        </FormControl>
                        <FormDescription>
                          URL pattern where this tour should be shown
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetPages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Pages (JSON Array)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder='["/app/candidate/onboard/resume"]'
                            rows={4}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          Array of specific pages where tour applies (JSON
                          format)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="triggerConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trigger Conditions (JSON) *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder='{"triggerType": "ON_FIRST_VISIT", "conditions": {}, "excludeConditions": {}}'
                            rows={12}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          Conditions to show the tour (JSON format)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Tour Steps Tab */}
                <TabsContent value="steps" className="mt-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="tourSteps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tour Steps (JSON Array) *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder='[{"id": "step-1", "title": "Step Title", "content": "Step content", ...}]'
                            rows={20}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          Array of tour step definitions (JSON format). Each
                          step should have: id, title, content, stepType, and
                          optional targetSelector, placement, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="tourSettings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tour Settings (JSON) *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder='{"allowSkip": true, "allowPause": true, ...}'
                            rows={20}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          Tour settings configuration (JSON format). Include:
                          allowSkip, allowPause, autoAdvance, showProgress,
                          showNavigation, theme, restartable, maxDismissals,
                          hideOnCompletion, allowUserWork
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? 'Update' : 'Create'} Tour Definition
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
