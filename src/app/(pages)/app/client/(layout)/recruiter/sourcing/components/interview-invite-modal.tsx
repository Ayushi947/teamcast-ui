'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import {
  CalendarIcon,
  Clock,
  MapPin,
  Video,
  Users,
  Send,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewInviteModalProps {
  candidate: {
    id: string;
    name: string;
    email: string;
    currentTitle: string;
    company: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSend: (inviteData: {
    candidateId: string;
    interviewType: string;
    date: Date;
    time: string;
    duration: number;
    location?: string;
    meetingLink?: string;
    interviewers: string[];
    message: string;
    instructions?: string;
  }) => void;
}

const interviewTypes = [
  {
    value: 'phone_screening',
    label: 'Phone Screening',
    icon: Phone,
    duration: 30,
  },
  {
    value: 'video_interview',
    label: 'Video Interview',
    icon: Video,
    duration: 60,
  },
  {
    value: 'technical_interview',
    label: 'Technical Interview',
    icon: Users,
    duration: 90,
  },
  {
    value: 'onsite_interview',
    label: 'On-site Interview',
    icon: MapPin,
    duration: 120,
  },
  {
    value: 'panel_interview',
    label: 'Panel Interview',
    icon: Users,
    duration: 60,
  },
];

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
];

const mockInterviewers = [
  { id: '1', name: 'John Smith', role: 'Senior Engineer' },
  { id: '2', name: 'Sarah Wilson', role: 'Engineering Manager' },
  { id: '3', name: 'Mike Johnson', role: 'Tech Lead' },
  { id: '4', name: 'Lisa Chen', role: 'HR Manager' },
];

export function InterviewInviteModal({
  candidate,
  isOpen,
  onClose,
  onSend,
}: InterviewInviteModalProps) {
  const [interviewType, setInterviewType] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>(
    []
  );
  const [message, setMessage] = useState('');
  const [instructions, setInstructions] = useState('');

  const selectedTypeInfo = interviewTypes.find(
    (type) => type.value === interviewType
  );

  const handleInterviewTypeChange = (value: string) => {
    setInterviewType(value);
    const typeInfo = interviewTypes.find((type) => type.value === value);
    if (typeInfo) {
      setDuration(typeInfo.duration);

      // Set default message based on interview type
      const defaultMessage = `Hi ${candidate.name},

Thank you for your interest in our position. We would like to invite you for a ${typeInfo.label.toLowerCase()} as the next step in our hiring process.

Looking forward to speaking with you!

Best regards,
The Hiring Team`;

      setMessage(defaultMessage);
    }
  };

  const handleInterviewerToggle = (interviewerId: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(interviewerId)
        ? prev.filter((id) => id !== interviewerId)
        : [...prev, interviewerId]
    );
  };

  const handleSend = () => {
    if (!selectedDate || !selectedTime || !interviewType) {
      return;
    }

    onSend({
      candidateId: candidate.id,
      interviewType,
      date: selectedDate,
      time: selectedTime,
      duration,
      location: interviewType === 'onsite_interview' ? location : undefined,
      meetingLink: ['video_interview', 'technical_interview'].includes(
        interviewType
      )
        ? meetingLink
        : undefined,
      interviewers: selectedInterviewers,
      message,
      instructions,
    });
  };

  const isFormValid =
    selectedDate && selectedTime && interviewType && message.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">Send Interview Invite</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[calc(90vh-8rem)] grid-cols-1 gap-6 overflow-y-auto pr-2 lg:grid-cols-3">
          {/* Left Column - Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Candidate Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Candidate Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{candidate.name}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {candidate.currentTitle}
                  </p>
                  <p className="text-sm text-gray-500">{candidate.company}</p>
                  <div className="flex items-center gap-1 text-sm text-[#6e55cf]">
                    <Mail className="h-4 w-4" />
                    {candidate.email}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interview Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Interview Type</Label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {interviewTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.value}
                      className={cn(
                        'cursor-pointer border-2 transition-all',
                        interviewType === type.value
                          ? 'border-[#6e55cf] bg-[#6e55cf]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                      onClick={() => handleInterviewTypeChange(type.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              'h-5 w-5',
                              interviewType === type.value
                                ? 'text-[#6e55cf]'
                                : 'text-gray-500'
                            )}
                          />
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-gray-500">
                              {type.duration} minutes
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, 'PPP')
                        : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        date < new Date() || date < addDays(new Date(), -1)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Duration (minutes)
              </Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={15}
                max={240}
                step={15}
              />
            </div>

            {/* Location/Meeting Link */}
            {interviewType === 'onsite_interview' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter meeting location"
                />
              </div>
            )}

            {['video_interview', 'technical_interview'].includes(
              interviewType
            ) && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Meeting Link</Label>
                <Input
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}

            {/* Interviewers */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Interviewers</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {mockInterviewers.map((interviewer) => (
                  <Card
                    key={interviewer.id}
                    className={cn(
                      'cursor-pointer border-2 transition-all',
                      selectedInterviewers.includes(interviewer.id)
                        ? 'border-[#6e55cf] bg-[#6e55cf]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => handleInterviewerToggle(interviewer.id)}
                  >
                    <CardContent className="p-3">
                      <p className="font-medium">{interviewer.name}</p>
                      <p className="text-sm text-gray-500">
                        {interviewer.role}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Enter your message to the candidate..."
              />
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Additional Instructions (Optional)
              </Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                placeholder="Any additional instructions for the candidate (what to bring, preparation notes, etc.)"
              />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Interview Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTypeInfo && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Type
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                      <selectedTypeInfo.icon className="h-4 w-4 text-[#6e55cf]" />
                      <span className="font-medium">
                        {selectedTypeInfo.label}
                      </span>
                    </div>
                  </div>
                )}

                {selectedDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Date & Time
                    </Label>
                    <p className="mt-1 font-medium">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      {selectedTime && ` at ${selectedTime}`}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Duration
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{duration} minutes</span>
                  </div>
                </div>

                {selectedInterviewers.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Interviewers
                    </Label>
                    <div className="mt-1 space-y-1">
                      {selectedInterviewers.map((id) => {
                        const interviewer = mockInterviewers.find(
                          (i) => i.id === id
                        );
                        return interviewer ? (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="block w-fit"
                          >
                            {interviewer.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {(location || meetingLink) && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      {location ? 'Location' : 'Meeting Link'}
                    </Label>
                    <p className="mt-1 text-sm font-medium break-all">
                      {location || meetingLink}
                    </p>
                  </div>
                )}

                <div className="space-y-2 border-t pt-4">
                  <Button
                    onClick={handleSend}
                    disabled={!isFormValid}
                    className="w-full bg-[#6e55cf] hover:bg-[#5d47b8]"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Interview Invite
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
