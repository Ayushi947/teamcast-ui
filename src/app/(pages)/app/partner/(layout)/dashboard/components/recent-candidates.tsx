'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Candidate {
  id: number;
  name: string;
  position: string;
  status: string;
  company: string;
  date: string;
}

interface RecentCandidatesProps {
  candidates: Candidate[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'placed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'interview':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'screening':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export const RecentCandidates = ({ candidates }: RecentCandidatesProps) => {
  return (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          className="flex items-center justify-between space-x-4"
        >
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>
                {candidate.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{candidate.name}</p>
              <div className="flex items-center space-x-2">
                <p className="text-muted-foreground text-xs">
                  {candidate.position}
                </p>
                <span className="text-muted-foreground">•</span>
                <p className="text-muted-foreground text-xs">
                  {candidate.company}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className={getStatusColor(candidate.status)}
            >
              {candidate.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};
