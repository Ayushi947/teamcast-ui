'use client';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ICandidatePanelAssessmentInvitationResponse,
  ICandidatePanelAssessmentSlot,
  JobPanelAssessmentInvitationStatusEnum,
  JobPanelAssessmentSlotStatusEnum,
  logger,
} from '@/lib/shared';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Timer,
  Globe,
  Check,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { candidatePanelInterviewService } from '@/lib/services/services';

function PanelAssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('invitationId');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: panelAssessmentInvitation, isLoading: isInvitationLoading } =
    useQuery({
      queryKey: ['panel-assessment', id],
      enabled: !!id,
      queryFn: () =>
        candidatePanelInterviewService.getPanelAssessmentInvitation(
          id as string
        ),
    });

  const panelAssessmentId = panelAssessmentInvitation?.data?.panelAssessmentId;

  const { data: slotsData, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['panel-assessment-slots', panelAssessmentId],
    enabled: !!panelAssessmentId,
    queryFn: () =>
      candidatePanelInterviewService.getPanelAssessmentSlots(
        panelAssessmentId as string
      ),
  });

  const slots = slotsData?.data || [];

  const { mutateAsync: respondToInvitation } = useMutation({
    mutationFn: (data: ICandidatePanelAssessmentInvitationResponse) =>
      candidatePanelInterviewService.respondToPanelAssessmentInvitation(
        id as string,
        data
      ),
    onSuccess: () => {
      toast.success('Your response has been submitted successfully.', {
        description: 'You will receive a confirmation email shortly.',
      });
      router.push('/app/candidate/interviews/');
    },
    onError: () => {
      toast.error('Failed to submit your response. Please try again.', {
        description: 'If the problem persists, please contact support.',
      });
      setIsLoading(false);
    },
  });

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
  };

  const handleAccept = async () => {
    if (!selectedSlotId) {
      toast.error('Please select a time slot first.');
      return;
    }

    setIsLoading(true);
    try {
      await respondToInvitation({
        action: JobPanelAssessmentInvitationStatusEnum.ACCEPTED,
        selectedSlotId,
      });
    } catch (error) {
      toast.error('Failed to accept the invitation. Please try again.');
      logger.error('Error accepting invitation:', error);
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await respondToInvitation({
        action: JobPanelAssessmentInvitationStatusEnum.DECLINED,
      });
    } catch (error) {
      toast.error('Failed to decline the invitation. Please try again.');
      logger.error('Error declining invitation:', error);
      setIsLoading(false);
    }
  };

  const formatDate = (dateTime: Date) => {
    return format(new Date(dateTime), 'EEEE, MMM dd, yyyy');
  };

  const formatTime = (dateTime: Date) => {
    return format(new Date(dateTime), 'hh:mm a');
  };

  const isSlotAvailable = (slot: ICandidatePanelAssessmentSlot) => {
    return slot.status === JobPanelAssessmentSlotStatusEnum.AVAILABLE;
  };

  const getDuration = (slot: ICandidatePanelAssessmentSlot) => {
    return Math.round(
      (new Date(slot.endDateTime).getTime() -
        new Date(slot.startDateTime).getTime()) /
        (1000 * 60)
    );
  };

  return (
    <Dialog
      open={true}
      onOpenChange={() => router.push('/app/candidate/interviews/')}
    >
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[600px]">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Users className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-left text-2xl font-bold">
                Panel Assessment Invitation
              </DialogTitle>
              <DialogDescription className="mt-1 text-left text-base">
                Select your preferred time slot for the assessment
              </DialogDescription>
            </div>
          </div>

          {panelAssessmentInvitation?.data && (
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Assessment Details</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Choose a time slot that works best for your schedule. All times
                are shown in your local timezone.
              </p>
            </div>
          )}
        </DialogHeader>

        {isInvitationLoading || isSlotsLoading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="space-y-4 text-center">
              <div className="relative">
                <div className="border-primary/20 border-t-primary mx-auto h-12 w-12 animate-spin rounded-full border-4"></div>
              </div>
              <p className="text-muted-foreground">
                Loading available slots...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {slots.length > 0 ? (
                slots.map((slot: ICandidatePanelAssessmentSlot) => (
                  <Card
                    key={slot.id}
                    className={cn(
                      'cursor-pointer border-2 transition-all duration-200 hover:shadow-md',
                      selectedSlotId === slot.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50',
                      !isSlotAvailable(slot) && 'cursor-not-allowed opacity-50'
                    )}
                    onClick={() =>
                      isSlotAvailable(slot) && handleSlotSelect(slot.id)
                    }
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Header with status */}
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">
                            {formatDate(slot.startDateTime)}
                          </div>
                          <div className="flex items-center gap-2">
                            {isSlotAvailable(slot) ? (
                              <Badge variant="secondary">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="success">
                                <Check className="mr-1 h-3 w-3" />
                                Selected
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Time and duration info */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Time</p>
                              <p className="text-muted-foreground text-sm">
                                {formatTime(slot.startDateTime)} -{' '}
                                {formatTime(slot.endDateTime)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 p-2">
                              <Timer className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Duration</p>
                              <p className="text-muted-foreground text-sm">
                                {getDuration(slot)} minutes
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-100 p-2">
                              <Globe className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Timezone</p>
                              <p className="text-muted-foreground text-sm">
                                {slot.timeZone}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {selectedSlotId === slot.id && (
                          <div className="bg-primary/10 text-primary flex items-center justify-center gap-2 rounded-md py-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                  <div className="bg-muted rounded-full p-4">
                    <Calendar className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="mb-2 font-semibold">No Available Slots</h3>
                    <p className="text-muted-foreground text-sm">
                      Unfortunately, there are no available time slots at the
                      moment.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <DialogFooter className="gap-3 sm:gap-2">
              <Button
                variant="outline"
                onClick={handleDecline}
                disabled={!selectedSlotId || isLoading}
                className="flex-1 sm:flex-none"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!selectedSlotId || isLoading}
                className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept & Confirm
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function PanelAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="relative">
              <div className="border-primary/20 border-t-primary mx-auto h-12 w-12 animate-spin rounded-full border-4"></div>
            </div>
            <p className="text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      }
    >
      <PanelAssessmentContent />
    </Suspense>
  );
}
