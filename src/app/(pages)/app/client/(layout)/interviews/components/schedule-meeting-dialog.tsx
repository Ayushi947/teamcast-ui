'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import { clientPanelInterviewService } from '@/lib/services/services';
import { MicrosoftTeamsIcon } from '@/components/icons';
import { useApp } from '@/lib/context/app-context';

interface ScheduleMeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
  onSuccess?: () => void;
}

export function ScheduleMeetingDialog({
  isOpen,
  onClose,
  interviewId,
  onSuccess,
}: ScheduleMeetingDialogProps) {
  const [activeTab, setActiveTab] = useState<'teams' | 'external'>('teams');

  // Teams meeting form state
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const { user } = useApp();
  // External meeting form state
  const [manualMeetingLink, setManualMeetingLink] = useState('');
  const [manualEventId, setManualEventId] = useState('');

  const { mutate: scheduleMeeting, isPending } = useMutation({
    mutationFn: () => {
      if (activeTab === 'teams') {
        return clientPanelInterviewService.generateAndSendTeamsMeetingLink(
          interviewId,
          {
            organizerEmail,
            organizerName,
            useTeams: true,
          }
        );
      } else {
        return clientPanelInterviewService.generateAndSendTeamsMeetingLink(
          interviewId,
          {
            organizerEmail: user?.email || '',
            organizerName: user?.name || '',
            useTeams: false,
            manualMeetingLink,
            manualEventId,
          }
        );
      }
    },
    onSuccess: () => {
      toast.success('Meeting scheduled successfully');
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to schedule meeting. Please try again.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form based on active tab
    if (activeTab === 'teams') {
      if (!organizerEmail || !organizerName) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else {
      if (!manualMeetingLink) {
        toast.error('Meeting link is required for external meetings');
        return;
      }
    }

    scheduleMeeting();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Schedule Interview Meeting
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs
            defaultValue="teams"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'teams' | 'external')
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <MicrosoftTeamsIcon className="h-4 w-4 text-purple-700" />
                <span>Microsoft Teams</span>
              </TabsTrigger>
              <TabsTrigger value="external" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>External Meeting</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizerEmail">Organizer Email *</Label>
                <Input
                  id="organizerEmail"
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizerName">Organizer Name *</Label>
                <Input
                  id="organizerName"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="rounded-md bg-purple-50 p-3 text-sm text-purple-800">
                <p>
                  Microsoft Teams will be used to create and send a meeting
                  invitation to all participants.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="external" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manualMeetingLink">Meeting Link *</Label>
                <Input
                  id="manualMeetingLink"
                  value={manualMeetingLink}
                  onChange={(e) => setManualMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/1234567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manualEventId">Event ID *</Label>
                <Input
                  id="manualEventId"
                  value={manualEventId}
                  onChange={(e) => setManualEventId(e.target.value)}
                  placeholder="zoom_meeting_123"
                  required
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
