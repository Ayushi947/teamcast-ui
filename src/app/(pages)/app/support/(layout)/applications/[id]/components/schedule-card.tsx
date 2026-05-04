'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { clientPanelInterviewService } from '@/lib/services/services';
import { Calendar, Clock, User, Video, Phone, MapPin } from 'lucide-react';
import { ISupportJobApplication } from '@/lib/shared';

interface ScheduleCardProps {
  applicationData: ISupportJobApplication;
  applicationId: string;
}

// Helper mappings for API schedule items
const getScheduleIcon = (type?: string) => {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'PANEL_ASSESSMENT':
    case 'VIDEO':
    case 'VIDEO_CALL':
      return Video;
    case 'PHONE':
    case 'PHONE_CALL':
      return Phone;
    case 'ONSITE':
    case 'IN_PERSON':
      return MapPin;
    default:
      return Calendar;
  }
};

const getScheduleColor = (type?: string) => {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'PANEL_ASSESSMENT':
    case 'VIDEO':
    case 'VIDEO_CALL':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    case 'PHONE':
    case 'PHONE_CALL':
      return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
    case 'ONSITE':
    case 'IN_PERSON':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getStatusBadge = (meetingStatus?: string, slotStatus?: string) => {
  if (meetingStatus === 'MEETING_SCHEDULED') {
    return (
      <Badge variant="default" className="text-xs">
        Scheduled
      </Badge>
    );
  }
  if (meetingStatus === 'COMPLETED') {
    return (
      <Badge variant="secondary" className="text-xs">
        Completed
      </Badge>
    );
  }
  if (meetingStatus === 'CANCELLED') {
    return (
      <Badge variant="destructive" className="text-xs">
        Cancelled
      </Badge>
    );
  }
  if (slotStatus === 'SELECTED') {
    return (
      <Badge variant="outline" className="text-xs">
        Pending
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs">
      {meetingStatus || slotStatus || 'Unknown'}
    </Badge>
  );
};

export function ScheduleCard({
  applicationData: _applicationData,
}: ScheduleCardProps) {
  // Fetch scheduled interviews from API
  const candidateEmail = _applicationData?.candidate?.user?.email;
  const jobTitle = _applicationData?.jobTitle;

  const { data: allSchedules = [] } = useQuery({
    queryKey: ['support', 'scheduled-interviews'],
    queryFn: () => clientPanelInterviewService.listScheduledInterviews(),
  });

  const schedules = (
    Array.isArray(allSchedules) ? [] : allSchedules?.items || []
  ).filter((item) => {
    const emailMatch = candidateEmail
      ? item.candidateEmail === candidateEmail
      : true;
    const titleMatch = jobTitle ? item.jobTitle === jobTitle : true;
    return emailMatch && titleMatch;
  });

  return (
    <div className="space-y-6">
      {/* Schedule Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Interview Schedule
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map((schedule) => {
                const ScheduleIcon = getScheduleIcon(schedule.type as any);
                const iconColor = getScheduleColor(schedule.type as any);

                return (
                  <div key={schedule.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${iconColor}`}
                        >
                          <ScheduleIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {schedule.jobTitle || 'Interview'}
                            </h4>
                            {getStatusBadge(
                              schedule.meetingStatus as any,
                              schedule.slotStatus as any
                            )}
                          </div>
                          {schedule.panelMemberNames?.length ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Panel: {schedule.panelMemberNames.join(', ')}
                            </p>
                          ) : null}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {schedule.selectedSlotDateTime
                                  ? new Date(
                                      schedule.selectedSlotDateTime
                                    ).toLocaleDateString()
                                  : '—'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {schedule.selectedSlotDateTime
                                  ? new Date(
                                      schedule.selectedSlotDateTime
                                    ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '—'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>30 min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>
                                {schedule.panelMemberNames?.length
                                  ? schedule.panelMemberNames[0]
                                  : schedule.companyName || '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No Interviews Scheduled
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No interviews have been scheduled for this application yet.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Interview Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No Interview Notes
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No interview notes have been added yet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
