import { FC, useState, useEffect } from 'react';
import { clientPanelInterviewService } from '@/lib/services/services';
import { IClientJobPanelAssessmentSlotCreate } from '@/lib/shared/models/domain/client/job.panel.assessment.domain';
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
import { Plus, Calendar1, Clock, Trash2, User, Mail, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/lib/context/app-context';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { Calendar } from '@/components/ui/calendar';

interface PanelAssessmentDialogProps {
  jobApplicationId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSendInvitation: () => void;
}

interface SlotData {
  startDateTime: Date;
  endDateTime: Date;
  timeZone: string;
  panelMemberEmails: string[];
  panelMemberNames: string[];
  hostEmail: string;
  hostName: string;
}

// Generate time slots dynamically (24-hour format with 30-minute intervals)
const generateTimeSlots = (durationMinutes: number) => {
  const slots = [];
  const totalMinutesInDay = 24 * 60;

  for (
    let minutes = 0;
    minutes < totalMinutesInDay;
    minutes += durationMinutes
  ) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    slots.push(
      `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    );
  }

  return slots;
};

const TIME_SLOTS = generateTimeSlots(30);

// Duration options in minutes
const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export const PanelAssessmentDialog: FC<PanelAssessmentDialogProps> = ({
  jobApplicationId,
  isOpen,
  onOpenChange,
  onSendInvitation,
}) => {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [panelMemberEmails, setPanelMemberEmails] = useState<string[]>([]);
  const [panelMemberNames, setPanelMemberNames] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hostEmail = user?.email;
  const hostName = user?.name;
  const [formTouched, setFormTouched] = useState(false);

  const createSlotsMutation = useMutation({
    mutationFn: async (data: IClientJobPanelAssessmentSlotCreate) => {
      return await clientPanelInterviewService.createPanelAssessmentSlots(data);
    },
    onSuccess: (data) => {
      toast.success(
        data.message || 'Panel assessment slots created successfully!'
      );
      queryClient.invalidateQueries({
        queryKey: ['panelAssessmentSlots', jobApplicationId],
      });
      onOpenChange(false);
      resetForm();
      onSendInvitation();
    },
    onError: (error) => {
      const formattedMessage = formatErrorMessage(error.message);
      toast.error(formattedMessage);
    },
  });

  const resetForm = () => {
    setSlots([]);
    setPanelMemberEmails([]);
    setPanelMemberNames([]);
    setNewMemberName('');
    setNewMemberEmail('');
    setErrors({});
    setFormTouched(false);
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addPanelMember = () => {
    const newErrors: Record<string, string> = {};

    if (!newMemberName.trim()) {
      newErrors.newMemberName = 'Name is required';
    }
    if (!newMemberEmail.trim()) {
      newErrors.newMemberEmail = 'Email is required';
    } else if (!validateEmail(newMemberEmail)) {
      newErrors.newMemberEmail = 'Invalid email format';
    } else if (panelMemberEmails.includes(newMemberEmail)) {
      newErrors.newMemberEmail = 'Email already added';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setPanelMemberNames((prev) => [...prev, newMemberName.trim()]);
    setPanelMemberEmails((prev) => [...prev, newMemberEmail.trim()]);
    setNewMemberName('');
    setNewMemberEmail('');
    setErrors((prev) => {
      const { newMemberName, newMemberEmail, ...rest } = prev;
      return rest;
    });
  };

  const removePanelMember = (index: number) => {
    setPanelMemberNames((prev) => prev.filter((_, i) => i !== index));
    setPanelMemberEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const addSlot = () => {
    if (slots.length < 3) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0); // Default to 10:00 AM

      const endTime = new Date(tomorrow.getTime() + 60 * 60 * 1000); // 1 hour duration

      const newSlot: SlotData = {
        startDateTime: tomorrow,
        endDateTime: endTime,
        timeZone: 'UTC',
        panelMemberEmails,
        panelMemberNames,
        hostEmail: hostEmail || '',
        hostName: hostName || '',
      };

      setSlots((prev) => [...prev, newSlot]);
    }
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlotDate = (index: number, date: Date | undefined) => {
    if (!date) return;

    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i === index) {
          const newStartTime = new Date(date);
          // Keep the same time but update the date
          const currentTime = slot.startDateTime;
          newStartTime.setHours(
            currentTime.getHours(),
            currentTime.getMinutes(),
            0,
            0
          );

          const duration =
            slot.endDateTime.getTime() - slot.startDateTime.getTime();
          const newEndTime = new Date(newStartTime.getTime() + duration);

          return {
            ...slot,
            startDateTime: newStartTime,
            endDateTime: newEndTime,
          };
        }
        return slot;
      })
    );
  };

  const updateSlotTime = (index: number, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);

    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i === index) {
          const newStartTime = new Date(slot.startDateTime);
          newStartTime.setHours(hours, minutes, 0, 0);

          const duration =
            slot.endDateTime.getTime() - slot.startDateTime.getTime();
          const newEndTime = new Date(newStartTime.getTime() + duration);

          return {
            ...slot,
            startDateTime: newStartTime,
            endDateTime: newEndTime,
          };
        }
        return slot;
      })
    );
  };

  const updateSlotDuration = (index: number, durationMinutes: number) => {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i === index) {
          const newEndTime = new Date(
            slot.startDateTime.getTime() + durationMinutes * 60 * 1000
          );
          return {
            ...slot,
            endDateTime: newEndTime,
          };
        }
        return slot;
      })
    );
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (panelMemberEmails.length === 0) {
      newErrors.panelMembers = 'At least one panel member is required';
    }

    if (slots.length === 0) {
      newErrors.slots = 'At least one time slot is required';
    }

    // Check for past dates and overlaps
    const now = new Date();
    slots.forEach((slot, index) => {
      if (slot.startDateTime < now) {
        newErrors[`slot${index}`] = 'Start time cannot be in the past';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setFormTouched(true);
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    const updatedSlots = slots.map((slot) => ({
      ...slot,
      timeZone: 'UTC',
      panelMemberEmails,
      panelMemberNames,
      hostEmail: hostEmail || '',
      hostName: hostName || '',
    }));

    const data: IClientJobPanelAssessmentSlotCreate = {
      jobApplicationId,
      slots: updatedSlots,
    };

    createSlotsMutation.mutate(data);
  };

  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [slots, panelMemberEmails, formTouched]);

  const ErrorText = ({ message }: { message: string }) => (
    <p className="mt-1 text-sm text-red-500">{message}</p>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="custom-scrollbar-thin max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Panel Assessment Slots</DialogTitle>
          <DialogDescription>
            Set up panel assessment slots for the job application (max 3 slots).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Host Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Host Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hostName">Host Name *</Label>
                <Input
                  id="hostName"
                  value={hostName}
                  disabled
                  placeholder="Enter host name"
                  className={errors.hostName ? 'border-red-500' : ''}
                />
                {errors.hostName && <ErrorText message={errors.hostName} />}
              </div>
              <div>
                <Label htmlFor="hostEmail">Host Email *</Label>
                <Input
                  id="hostEmail"
                  type="email"
                  value={hostEmail}
                  placeholder="Enter host email"
                  className={errors.hostEmail ? 'border-red-500' : ''}
                  disabled
                />
                {errors.hostEmail && <ErrorText message={errors.hostEmail} />}
              </div>
            </div>
          </div>

          {/* Panel Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Panel Members</h3>
            <div className="flex gap-2">
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Member name"
                className={errors.newMemberName ? 'border-red-500' : ''}
              />
              <Input
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Member email"
                type="email"
                className={errors.newMemberEmail ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                onClick={addPanelMember}
                disabled={!newMemberName || !newMemberEmail}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.newMemberName && (
              <ErrorText message={errors.newMemberName} />
            )}
            {errors.newMemberEmail && (
              <ErrorText message={errors.newMemberEmail} />
            )}

            {panelMemberNames.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {panelMemberNames.map((name, index) => (
                  <div
                    key={index}
                    className="bg-primary/10 text-primary border-primary/20 flex w-full items-start justify-between gap-2 rounded-lg border p-4 shadow-sm sm:w-[300px]"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <User className="text-primary h-4 w-4" />
                        <p className="text-sm font-medium">
                          <span className="text-muted-foreground font-semibold">
                            Name:
                          </span>{' '}
                          {name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="text-primary h-4 w-4" />
                        <p className="text-sm font-medium break-all">
                          <span className="text-muted-foreground font-semibold">
                            Email:
                          </span>{' '}
                          {panelMemberEmails[index]}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => removePanelMember(index)}
                        className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm text-red-500 transition hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.panelMembers && <ErrorText message={errors.panelMembers} />}
          </div>

          {/* Time Slots */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                Time Slots ({slots.length}/3)
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={addSlot}
                disabled={slots.length >= 3}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Slot
              </Button>
            </div>
            {errors.slots && <ErrorText message={errors.slots} />}

            <div className="space-y-4">
              {slots.map((slot, index) => {
                const currentDuration = Math.round(
                  (slot.endDateTime.getTime() - slot.startDateTime.getTime()) /
                    (1000 * 60)
                );
                const currentTime = `${slot.startDateTime.getHours().toString().padStart(2, '0')}:${slot.startDateTime.getMinutes().toString().padStart(2, '0')}`;

                return (
                  <div
                    key={index}
                    className="bg-card/60 rounded-lg border-2 border-gray-200 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-primary font-bold">
                        Slot {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlot(index)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* Date Picker */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left',
                                !slot.startDateTime && 'text-muted-foreground',
                                errors[`slot${index}`] && 'border-red-500'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <Calendar1 className="text-muted-foreground mr-2 h-4 w-4" />
                                {formatDate(slot.startDateTime)}
                              </div>
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={slot.startDateTime}
                              onSelect={(date) => {
                                if (date) {
                                  updateSlotDate(index, date);
                                }
                              }}
                              fromDate={new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Time Picker */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Time</Label>
                        <Select
                          value={currentTime}
                          onValueChange={(time) => updateSlotTime(index, time)}
                        >
                          <SelectTrigger
                            className={cn(
                              'w-full',
                              errors[`slot${index}`] && 'border-red-500'
                            )}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Duration Picker */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Duration</Label>
                        <Select
                          value={currentDuration.toString()}
                          onValueChange={(duration) =>
                            updateSlotDuration(index, parseInt(duration))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <Clock className="mr-2 h-4 w-4" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DURATION_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value.toString()}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* End Time Display */}
                    <div className="bg-primary/5 mt-3 rounded-md p-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-bold">End Time:</span>{' '}
                        {slot.endDateTime.toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {errors[`slot${index}`] && (
                      <ErrorText message={errors[`slot${index}`]} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createSlotsMutation.isPending}
          >
            {createSlotsMutation.isPending ? 'Creating...' : 'Create Slots'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// Utility function to format error messages for better user experience
const formatErrorMessage = (errorMessage: string): string => {
  // Handle overlapping time slots error
  if (errorMessage.includes('overlap')) {
    return 'The selected time slots overlap with each other. Please choose different times for each slot.';
  }

  // Handle time slot validation errors
  if (
    errorMessage.includes('Time slots') &&
    errorMessage.includes('2025-08-16')
  ) {
    return 'The selected time slots are not valid. Please check the dates and times you have selected.';
  }

  // Handle general validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('Validation')
  ) {
    return 'Please check your input and try again.';
  }

  // Handle network or server errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Handle authentication errors
  if (
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('Unauthorized')
  ) {
    return 'Your session has expired. Please log in again.';
  }

  // Handle permission errors
  if (
    errorMessage.includes('forbidden') ||
    errorMessage.includes('Forbidden')
  ) {
    return 'You do not have permission to perform this action.';
  }

  // Handle resource not found errors
  if (
    errorMessage.includes('not found') ||
    errorMessage.includes('Not Found')
  ) {
    return 'The requested resource could not be found.';
  }

  // Handle server errors
  if (
    errorMessage.includes('Internal Server Error') ||
    errorMessage.includes('500')
  ) {
    return 'A server error occurred. Please try again later.';
  }

  // If no specific pattern matches, return a user-friendly version of the original message
  return errorMessage.replace(/^[A-Z]/, (match) => match.toLowerCase());
};
