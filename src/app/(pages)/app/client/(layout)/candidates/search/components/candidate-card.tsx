'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Award,
  Heart,
  MessageCircle,
  Eye,
  Globe,
  Building2,
} from 'lucide-react';
// We&apos;ll use a local interface for now
interface ICandidateProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  status?: string;
  skills?: string[];
  experience?: number;
  education?: string;
  avatar?: string;
  jobTitle?: string;
  createdAt?: string;
  completionPercentage?: number;
  resumeAssessmentStatus?: string;
  onboardingAssessmentStatus?: string;
  assessmentStage?: string;
  salary?: number;
  isRemote?: boolean;
  employmentType?: string;
  department?: string;
  company?: string;
  biography?: string;
  websites?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  isVerified?: boolean;
}
import { cn } from '@/lib/utils';
import { logger } from '@/lib/shared';

interface CandidateCardProps {
  candidate: ICandidateProfile;
  onViewProfile?: (candidate: ICandidateProfile) => void;
  onContact?: (candidate: ICandidateProfile) => void;
  onShortlist?: (candidate: ICandidateProfile) => void;
  isShortlisted?: boolean;
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  onSelect?: () => void;
}

export function CandidateCard({
  candidate,
  onViewProfile,
  onContact,
  onShortlist,
  isShortlisted = false,
  viewMode = 'grid',
  isSelected = false,
  onSelect,
}: CandidateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-muted text-muted-foreground';

    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'looking':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      case 'passive':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      case 'unavailable':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'UN';

    try {
      return (
        name
          .split(' ')
          .filter((n) => n)
          .map((n) => n[0] || '')
          .join('')
          .toUpperCase() || 'UN'
      );
    } catch (error) {
      logger.error('Error getting initials:', error);
      return 'UN';
    }
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return 'Negotiable';

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: salary >= 1000000 ? 'compact' : 'standard',
      }).format(salary);
    } catch (error) {
      logger.error('Error formatting salary:', error);
      return 'Negotiable';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          'group relative overflow-hidden transition-all duration-300 ease-out',
          'bg-card/60 border-l-4 backdrop-blur-sm',
          isHovered || candidate.status === 'active'
            ? 'border-l-primary shadow-primary/5 border-primary/20 shadow-lg'
            : 'border-l-muted-foreground/20 border-border/50',
          'hover:bg-card/80 hover:shadow-md'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle gradient overlay */}
        <div className="from-primary/[0.01] to-accent/[0.01] absolute inset-0 bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardContent className="relative p-6">
          <div className="flex items-center justify-between gap-6">
            {/* Selection Checkbox */}
            {onSelect && (
              <div className="flex items-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4"
                />
              </div>
            )}

            {/* Left: Avatar and Basic Info */}
            <div
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-4"
              onClick={() => onViewProfile?.(candidate)}
            >
              <div className="relative">
                <Avatar className="border-background ring-border/50 h-14 w-14 border-2 shadow-sm ring-1">
                  <AvatarImage src={candidate.avatar} alt={candidate.name} />
                  <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br font-semibold">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                {candidate.isVerified && (
                  <div className="absolute -right-1 -bottom-1 rounded-full bg-emerald-500 p-1">
                    <Award className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start gap-2">
                  <h3 className="text-foreground truncate text-lg font-semibold">
                    {candidate.name}
                  </h3>
                  {candidate.isRemote && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    >
                      <Globe className="mr-1 h-3 w-3" />
                      Remote
                    </Badge>
                  )}
                </div>
                <p className="text-primary mb-2 text-base font-medium">
                  {candidate.jobTitle}
                </p>
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    <span>{candidate.experience} years exp.</span>
                  </div>
                  {candidate.company && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      <span>{candidate.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Skills */}
            <div className="hidden max-w-xs flex-wrap gap-2 lg:flex">
              {(candidate.skills || []).slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 px-2.5 py-1 text-xs transition-colors"
                >
                  {skill}
                </Badge>
              ))}
              {(candidate.skills || []).length > 4 && (
                <Badge
                  variant="outline"
                  className="bg-muted/50 text-muted-foreground border-muted-foreground/20 px-2.5 py-1 text-xs"
                >
                  +{(candidate.skills || []).length - 4}
                </Badge>
              )}
            </div>

            {/* Right: Status, Salary and Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <Badge
                  className={cn(
                    'mb-2 rounded-full px-3 py-1 text-xs font-medium',
                    getStatusColor(candidate.status || 'Available')
                  )}
                >
                  {candidate.status || 'Available'}
                </Badge>
                <div>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatSalary(candidate.salary)}
                  </p>
                  <p className="text-muted-foreground text-xs">Expected</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShortlist?.(candidate);
                  }}
                  className={cn(
                    'h-9 w-9 rounded-lg p-0 transition-all duration-200',
                    isShortlisted
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50'
                      : 'text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400'
                  )}
                >
                  <Heart
                    className={cn('h-4 w-4', isShortlisted && 'fill-current')}
                  />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact?.(candidate);
                  }}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-9 w-9 rounded-lg p-0"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile?.(candidate);
                  }}
                  className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-9 rounded-lg px-4 transition-all duration-200"
                >
                  <Eye className="mr-1.5 h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 ease-out',
        'bg-card/60 h-full cursor-pointer backdrop-blur-sm',
        isHovered
          ? 'shadow-primary/10 border-primary/20 -translate-y-1 shadow-lg'
          : 'border-border/50 shadow-sm',
        'hover:bg-card/80'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewProfile?.(candidate)}
    >
      {/* Gradient overlay */}
      <div className="from-primary/[0.02] to-accent/[0.02] absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative pb-3">
        {/* Selection Checkbox */}
        {onSelect && (
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 bg-white/80 backdrop-blur-sm"
            />
          </div>
        )}

        <div className="mb-4 flex items-start justify-between">
          <div className="relative">
            <Avatar className="border-background ring-border/50 h-16 w-16 border-2 shadow-md ring-1">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br text-lg font-semibold">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            {candidate.isVerified && (
              <div className="absolute -right-1 -bottom-1 rounded-full bg-emerald-500 p-1.5">
                <Award className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onShortlist?.(candidate);
              }}
              className={cn(
                'h-8 w-8 rounded-lg p-0 transition-all duration-200',
                isShortlisted
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400'
                  : 'text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:text-rose-400'
              )}
            >
              <Heart
                className={cn('h-4 w-4', isShortlisted && 'fill-current')}
              />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <h3 className="text-foreground line-clamp-1 text-lg font-semibold">
              {candidate.name}
            </h3>
            {candidate.isRemote && (
              <Badge
                variant="secondary"
                className="bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                <Globe className="mr-1 h-3 w-3" />
                Remote
              </Badge>
            )}
          </div>

          <p className="text-primary line-clamp-1 text-base font-medium">
            {candidate.jobTitle}
          </p>

          <Badge
            className={cn(
              'w-fit rounded-full px-3 py-1 text-xs font-medium',
              getStatusColor(candidate.status || 'Available')
            )}
          >
            {candidate.status || 'Available'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative flex flex-1 flex-col pt-0 pb-4">
        <div className="flex-1 space-y-4">
          <div className="text-muted-foreground space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary/60 h-4 w-4" />
              <span className="truncate">{candidate.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="text-primary/60 h-4 w-4" />
              <span>{candidate.experience} years experience</span>
            </div>

            {candidate.company && (
              <div className="flex items-center gap-2">
                <Building2 className="text-primary/60 h-4 w-4" />
                <span className="truncate">{candidate.company}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatSalary(candidate.salary)}
              </span>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Key Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(candidate.skills || []).slice(0, 6).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 px-2 py-0.5 text-xs transition-colors"
                >
                  {skill}
                </Badge>
              ))}
              {(candidate.skills || []).length > 6 && (
                <Badge
                  variant="outline"
                  className="bg-muted/50 text-muted-foreground border-muted-foreground/20 px-2 py-0.5 text-xs"
                >
                  +{(candidate.skills || []).length - 6}
                </Badge>
              )}
            </div>
          </div>

          {/* Biography snippet */}
          {candidate.biography && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                About
              </p>
              <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                {candidate.biography}
              </p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile?.(candidate);
            }}
            className="bg-background hover:bg-primary/5 hover:border-primary/20 hover:text-primary h-9 flex-1 text-xs transition-colors"
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View Profile
          </Button>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onContact?.(candidate);
            }}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-9 flex-1 text-xs transition-colors"
          >
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
