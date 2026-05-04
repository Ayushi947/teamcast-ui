'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bookmark, Share2, X } from 'lucide-react';
import { useState } from 'react';
import {
  CardClockIcon,
  CardLocationIcon,
  CompanyCardIcon,
} from '@/components/icons';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  matchScore: number;
  matchDetails: {
    skills: number;
    experience: number;
    education: number;
  };
  score: number;
  employeeCount?: string;
  postedTime?: string;
  experienceLevel?: string;
}

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onSelect: (jobId: string, e: React.MouseEvent<HTMLElement>) => void;
  onToggleDetails: (jobId: string, e: React.MouseEvent<HTMLElement>) => void;
  showDetails: boolean;
}

export const JobCard = ({
  job,
  isSelected,
  onSelect,
  onToggleDetails,
  showDetails,
}: JobCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 80) return 'from-blue-500 to-blue-600';
    if (score >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const handleApply = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onSelect(job.id, e);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle share functionality
  };

  // Handle selection for the selection checkbox

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group border-border bg-card relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-primary ring-2' : ''
      } cursor-pointer`}
    >
      {/* Card Content */}
      <div className="p-5">
        {/* Header with company icon and basic info */}
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-muted flex h-13 w-13 items-center justify-center rounded-xl">
            <CompanyCardIcon />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground text-xl font-semibold">
              {job.title}
            </h3>
            <p className="text-muted-foreground text-sm">{job.company}</p>
            <p className="text-muted-foreground text-xs">
              {job.employeeCount || '200 - 500 employees'}
            </p>
          </div>
        </div>

        {/* Location and time */}
        <div className="text-muted-foreground mb-5 flex items-center gap-5 text-sm">
          <div className="flex items-center gap-1">
            <CardLocationIcon />
            <span className="text-base">{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <CardClockIcon />
            <span className="text-base">{job.postedTime || '2 hours ago'}</span>
          </div>
        </div>

        {/* Employment type badges */}
        <div className="mb-5 flex gap-2">
          <div className="bg-primary/30 rounded-md px-2 py-1 text-sm font-normal">
            {job.type.charAt(0).toUpperCase() + job.type.slice(1).toLowerCase()}
          </div>
        </div>

        {/* Experience level */}
        <div className="mb-5">
          <p className="text-foreground text-base font-normal">
            Experience Level:{' '}
            <span className="text-foreground text-base font-medium">
              {job.experienceLevel || '5+ Yrs'}
            </span>
          </p>
        </div>

        {/* Job description */}
        <p className="text-muted-foreground line-clamp-3 h-16 text-base">
          {job.description ||
            'We are looking for a passionate Senior Frontend Developer to join our growing team. You will be responsible for building user-facing features using modern...'}
        </p>

        {/* Key Skills */}
        <div className="mb-4">
          <p className="text-foreground mb-2 text-base font-medium">
            Key Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {job.requirements.slice(0, 3).map((skill, index) => (
              <div
                key={index}
                className="dark:border-primary/10 dark:bg-primary/10 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
              >
                {skill}
              </div>
            ))}
            {job.requirements.length > 3 && (
              <div className="dark:border-primary/10 dark:bg-primary/10 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm">
                +{job.requirements.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Salary */}
        <div className="mb-5">
          <p className="text-primary text-2xl font-semibold">{job.salary}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleApply}
            className="bg-primary flex-1 text-white"
          >
            Apply Now
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleBookmark}
            className={`${
              isBookmarked
                ? 'dark:bg-primary/10 border-blue-200 bg-blue-50 dark:border-blue-200'
                : ''
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
            />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Match Details Popup */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="border-border bg-card absolute top-0 left-0 z-20 w-64 rounded-lg border p-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-foreground text-sm font-medium">
              Match Breakdown
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDetails(job.id, e);
              }}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-muted-foreground">Skills</span>
                <span className="text-foreground font-medium">
                  {job.matchDetails.skills}%
                </span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${job.matchDetails.skills}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${getMatchScoreColor(
                    job.matchDetails.skills
                  )}`}
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-muted-foreground">Experience</span>
                <span className="text-foreground font-medium">
                  {job.matchDetails.experience}%
                </span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${job.matchDetails.experience}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${getMatchScoreColor(
                    job.matchDetails.experience
                  )}`}
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-muted-foreground">Education</span>
                <span className="text-foreground font-medium">
                  {job.matchDetails.education}%
                </span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${job.matchDetails.education}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${getMatchScoreColor(
                    job.matchDetails.education
                  )}`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
