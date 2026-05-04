'use client';

import { Calendar } from 'lucide-react';

interface Interview {
  id: number;
  candidate: string;
  position: string;
  company: string;
  date: string;
  time: string;
}

interface UpcomingInterviewsProps {
  interviews: Interview[];
}

export const UpcomingInterviews = ({ interviews }: UpcomingInterviewsProps) => {
  return (
    <div className="space-y-4">
      {interviews.map((interview) => (
        <div
          key={interview.id}
          className="flex items-center justify-between space-x-4 rounded-lg border p-4"
        >
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{interview.candidate}</p>
            <div className="flex items-center space-x-2">
              <p className="text-muted-foreground text-xs">
                {interview.position}
              </p>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground text-xs">
                {interview.company}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{interview.date}</p>
              <p className="text-muted-foreground text-xs">{interview.time}</p>
            </div>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </div>
        </div>
      ))}
      {interviews.length === 0 && (
        <div className="text-muted-foreground text-center text-sm">
          No upcoming interviews
        </div>
      )}
    </div>
  );
};
