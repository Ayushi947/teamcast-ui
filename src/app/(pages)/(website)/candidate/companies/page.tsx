'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/seo/breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Grid3X3,
  List,
  ArrowRight,
  Lock,
  Calendar,
  Users,
  BookmarkPlus,
  Share2,
  TrendingUp,
  CheckCircle,
  Star,
  Globe,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/lib/context/app-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  candidateJobPostingService,
  candidateApplicationService,
} from '@/lib/services/services';
import {
  ICandidateJobPosting,
  ICandidateJobPostingApply,
  IPaginatedResponse,
  WorkTypeEnum,
  WorkCommitmentEnum,
  CompanyIndustryEnum,
  logger,
} from '@/lib/shared';
import { format } from 'date-fns';

// Helper function to format enum values
const formatEnumValue = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const CandidateJobsPage = () => {
  const { user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState<
    CompanyIndustryEnum | ''
  >('');
  const [jobTypeFilter, setJobTypeFilter] = useState<WorkTypeEnum | ''>('');
  const [commitmentFilter, setCommitmentFilter] = useState<
    WorkCommitmentEnum | ''
  >('');
  const [salaryRange, setSalaryRange] = useState([0, 200000]);
  const [experienceRange, setExperienceRange] = useState([0, 15]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ICandidateJobPosting | null>(
    null
  );
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'salary' | 'match'>('recent');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [applicationNotes, setApplicationNotes] = useState('');
  const [showApplicationDialog, setShowApplicationDialog] =
    useState<ICandidateJobPosting | null>(null);

  // Fetch published job postings (public access)
  const { data: jobsResponse, isLoading: jobsLoading } = useQuery<
    IPaginatedResponse<ICandidateJobPosting>
  >({
    queryKey: [
      'candidate-jobs',
      searchTerm,
      industryFilter,
      jobTypeFilter,
      commitmentFilter,
    ],
    queryFn: () =>
      candidateJobPostingService.getJobPostings({
        search: searchTerm,
        industry: industryFilter || undefined,
        jobType: jobTypeFilter || undefined,
        jobCommitment: commitmentFilter || undefined,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const jobs = jobsResponse?.items || [];

  // Extract all available skills from jobs
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    jobs.forEach((job) => {
      job.requiredSkills?.forEach((skill) => skills.add(skill));
      job.preferredSkills?.forEach((skill) => skills.add(skill));
    });
    return Array.from(skills).sort();
  }, [jobs]);

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter((job) =>
        selectedSkills.every((skill) =>
          [...(job.requiredSkills || []), ...(job.preferredSkills || [])].some(
            (jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(
        (job) => job.isRemote || locationFilter.toLowerCase().includes('remote')
      );
    }

    // Salary range filter
    filtered = filtered.filter((job) => {
      if (!job.minSalary || !job.maxSalary) return true;
      return job.minSalary >= salaryRange[0] && job.maxSalary <= salaryRange[1];
    });

    // Experience range filter
    filtered = filtered.filter((job) => {
      if (!job.totalExperience) return true;
      return (
        job.totalExperience >= experienceRange[0] &&
        job.totalExperience <= experienceRange[1]
      );
    });

    // Sort results
    filtered.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;

      switch (sortBy) {
        case 'recent':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'salary':
          return (b.maxSalary || 0) - (a.maxSalary || 0);
        case 'match':
          // Simple match score based on skills overlap (placeholder logic)
          aScore = selectedSkills.filter((skill) =>
            [...(a.requiredSkills || []), ...(a.preferredSkills || [])].some(
              (jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase())
            )
          ).length;
          bScore = selectedSkills.filter((skill) =>
            [...(b.requiredSkills || []), ...(b.preferredSkills || [])].some(
              (jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase())
            )
          ).length;
          return bScore - aScore;
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return filtered;
  }, [
    jobs,
    selectedSkills,
    locationFilter,
    salaryRange,
    experienceRange,
    sortBy,
  ]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }, []);

  const handleJobClick = useCallback((job: ICandidateJobPosting) => {
    // Allow viewing basic job details without authentication
    // Full details and application features require authentication
    setSelectedJob(job);
  }, []);

  const handleSaveJob = useCallback(
    (jobId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) {
        setShowAuthDialog(true);
        return;
      }

      setSavedJobs((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(jobId)) {
          newSet.delete(jobId);
          toast.success('Job removed from saved jobs');
        } else {
          newSet.add(jobId);
          toast.success('Job saved successfully');
        }
        return newSet;
      });
    },
    [user]
  );

  // Job application mutation
  const applyJobMutation = useMutation({
    mutationFn: async (data: { jobId: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const applicationData: ICandidateJobPostingApply = {
        notes: data.notes,
      };

      return candidateApplicationService.updateApplication(
        data.jobId,
        applicationData
      );
    },

    onSuccess: () => {
      toast.success('Application submitted successfully!');
      setShowApplicationDialog(null);
      setApplicationNotes('');
    },
    onError: (error) => {
      logger.error('Application error:', error);
      toast.error('Failed to submit application. Please try again.');
    },
  });

  const handleApplyToJob = useCallback(
    (job: ICandidateJobPosting, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      if (!user) {
        toast.info('Authentication Required', {
          description: 'Please sign up or log in to apply for jobs.',
          action: {
            label: 'Sign In',
            onClick: () =>
              (window.location.href = '/app/auth/login?user_type=candidate'),
          },
        });
        setShowAuthDialog(true);
        return;
      }

      setShowApplicationDialog(job);
    },
    [user]
  );

  const handleConfirmApplication = useCallback(() => {
    if (!showApplicationDialog) return;

    applyJobMutation.mutate({
      jobId: showApplicationDialog.id,
      notes: applicationNotes.trim() || undefined,
    });
  }, [showApplicationDialog, applicationNotes, applyJobMutation]);

  const formatSalary = useCallback(
    (min?: number, max?: number, currency = 'USD') => {
      if (!min && !max) return 'Salary not specified';
      if (!max) return `From $${min?.toLocaleString()}`;
      if (!min) return `Up to $${max?.toLocaleString()}`;
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
    },
    []
  );

  const getJobTypeColor = useCallback((type: WorkTypeEnum) => {
    switch (type) {
      case WorkTypeEnum.EMPLOYEE:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case WorkTypeEnum.CONTRACTOR:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case WorkTypeEnum.INTERN:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbConfigs.candidateCompanies} />
      </div>

      {/* Header Section */}
      <div className="from-primary/10 via-primary/5 to-background border-b bg-gradient-to-r pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center"
          >
            <h1 className="text-foreground text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
              Find Your Dream Job
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-lg md:text-xl">
              Discover amazing opportunities from top companies. Browse
              thousands of active job postings and find the perfect role that
              matches your skills and aspirations.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>{jobs.length}+ Active Jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span>500+ Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                <span>Remote & On-site</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Main Search Bar */}
          <div className="relative mx-auto max-w-5xl">
            <Search className="text-muted-foreground absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 transform" />
            <Input
              placeholder="Search by job title, company, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="focus:border-primary h-16 rounded-xl border-2 py-6 pr-6 pl-14 text-lg shadow-lg transition-all duration-200 hover:shadow-xl focus:shadow-xl"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex h-11 items-center gap-2 px-6"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(selectedSkills.length > 0 ||
                  locationFilter ||
                  industryFilter ||
                  jobTypeFilter ||
                  commitmentFilter ||
                  salaryRange[0] > 0 ||
                  salaryRange[1] < 200000 ||
                  experienceRange[0] > 0 ||
                  experienceRange[1] < 15) && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedSkills.length +
                      (locationFilter ? 1 : 0) +
                      (industryFilter ? 1 : 0) +
                      (jobTypeFilter ? 1 : 0) +
                      (commitmentFilter ? 1 : 0) +
                      (salaryRange[0] > 0 || salaryRange[1] < 200000 ? 1 : 0) +
                      (experienceRange[0] > 0 || experienceRange[1] < 15
                        ? 1
                        : 0)}
                  </Badge>
                )}
              </Button>

              <Select
                value={sortBy}
                onValueChange={(value: 'recent' | 'salary' | 'match') =>
                  setSortBy(value)
                }
              >
                <SelectTrigger className="h-11 w-full sm:w-52">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                  <SelectItem value="match">Best Match</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-11 w-11"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-11 w-11"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="space-y-8 p-8">
                  {/* Skills Filter */}
                  <div className="space-y-4">
                    <h3 className="text-foreground text-lg font-semibold">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {allSkills.slice(0, 20).map((skill) => (
                        <Button
                          key={skill}
                          variant={
                            selectedSkills.includes(skill)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => handleSkillToggle(skill)}
                          className="h-9 text-sm"
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Other Filters */}
                  <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-4">
                      <h3 className="text-foreground text-lg font-semibold">
                        Location
                      </h3>
                      <Input
                        placeholder="Enter city or state..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-foreground text-lg font-semibold">
                        Industry
                      </h3>
                      <Select
                        value={industryFilter}
                        onValueChange={(value: CompanyIndustryEnum | '') =>
                          setIndustryFilter(value)
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Industries</SelectItem>
                          {Object.values(CompanyIndustryEnum).map(
                            (industry) => (
                              <SelectItem key={industry} value={industry}>
                                {formatEnumValue(industry)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-foreground text-lg font-semibold">
                        Job Type
                      </h3>
                      <Select
                        value={jobTypeFilter}
                        onValueChange={(value: WorkTypeEnum | '') =>
                          setJobTypeFilter(value)
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          {Object.values(WorkTypeEnum).map((type) => (
                            <SelectItem key={type} value={type}>
                              {formatEnumValue(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-foreground text-lg font-semibold">
                        Work Commitment
                      </h3>
                      <Select
                        value={commitmentFilter}
                        onValueChange={(value: WorkCommitmentEnum | '') =>
                          setCommitmentFilter(value)
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select commitment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Commitments</SelectItem>
                          {Object.values(WorkCommitmentEnum).map(
                            (commitment) => (
                              <SelectItem key={commitment} value={commitment}>
                                {formatEnumValue(commitment)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-foreground text-lg font-semibold">
                        Salary Range: ${salaryRange[0].toLocaleString()} - $
                        {salaryRange[1].toLocaleString()}
                      </h3>
                      <div className="px-2 py-4">
                        <Slider
                          value={salaryRange}
                          onValueChange={setSalaryRange}
                          max={200000}
                          min={0}
                          step={5000}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-foreground text-lg font-semibold">
                        Experience: {experienceRange[0]} - {experienceRange[1]}{' '}
                        years
                      </h3>
                      <div className="px-2 py-4">
                        <Slider
                          value={experienceRange}
                          onValueChange={setExperienceRange}
                          max={15}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8"
        >
          {/* Results Header */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-foreground text-2xl font-semibold lg:text-3xl">
              {jobsLoading
                ? 'Loading jobs...'
                : `${filteredJobs.length} jobs found`}
            </h2>
          </div>

          {/* Loading State */}
          {(jobsLoading || isLoading) && (
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' : 'grid-cols-1'}`}
            >
              {Array.from({ length: 9 }).map((_, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-14" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Jobs Grid/List */}
          {!jobsLoading && !isLoading && (
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' : 'mx-auto max-w-4xl grid-cols-1'}`}
            >
              <AnimatePresence>
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className="group hover:border-primary/50 relative cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-xl"
                      onClick={() => handleJobClick(job)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="mb-2 line-clamp-2 text-lg leading-tight lg:text-xl">
                              {job.title}
                            </CardTitle>
                            <div className="text-muted-foreground flex items-center gap-2 text-sm lg:text-base">
                              <Building2 className="h-4 w-4" />
                              <span className="font-medium">
                                {job.company?.name || 'Company Name'}
                              </span>
                            </div>
                            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs lg:text-sm">
                              <MapPin className="h-3 w-3" />
                              {job.isRemote ? 'Remote' : 'Location TBD'}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleSaveJob(job.id, e)}
                            className="text-muted-foreground hover:text-foreground opacity-0 transition-all group-hover:opacity-100"
                          >
                            <BookmarkPlus
                              className={cn(
                                'h-4 w-4',
                                savedJobs.has(job.id) &&
                                  'text-primary fill-current'
                              )}
                            />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-5 px-6 pb-6">
                        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed lg:text-base">
                          {job.description}
                        </p>

                        {/* Job Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm lg:text-base">
                          <div className="flex items-center gap-2">
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">
                              {formatSalary(
                                job.minSalary,
                                job.maxSalary,
                                job.salaryCurrency
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">
                              {job.totalExperience || 0}+ years
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">
                              {formatEnumValue(job.jobCommitment)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">
                              {job.numberOfOpenings} opening
                              {job.numberOfOpenings > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Job Type and Posted Date */}
                        <div className="flex items-center justify-between">
                          <Badge
                            className={cn(
                              'px-3 py-1 text-xs font-medium',
                              getJobTypeColor(job.jobType)
                            )}
                          >
                            {formatEnumValue(job.jobType)}
                          </Badge>
                          <div className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(job.createdAt), 'MMM dd')}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills?.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="px-2 py-1 text-xs font-medium"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {(job.requiredSkills?.length || 0) > 3 && (
                            <Badge
                              variant="outline"
                              className="px-2 py-1 text-xs font-medium"
                            >
                              +{(job.requiredSkills?.length || 0) - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {job.isFeatured && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium text-yellow-600">
                                    Featured
                                  </span>
                                </div>
                              )}
                              {job.isRemote && (
                                <Badge variant="outline" className="text-xs">
                                  Remote
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:text-primary-foreground hover:bg-primary font-medium"
                            >
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={(e) => handleApplyToJob(job, e)}
                            >
                              Apply Now
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleSaveJob(job.id, e)}
                            >
                              <BookmarkPlus
                                className={cn(
                                  'h-4 w-4',
                                  savedJobs.has(job.id) &&
                                    'text-primary fill-current'
                                )}
                              />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* No Results */}
          {!jobsLoading && !isLoading && filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                <Search className="text-muted-foreground h-12 w-12" />
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                No jobs found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters to find more
                opportunities.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSkills([]);
                  setLocationFilter('');
                  setIndustryFilter('');
                  setJobTypeFilter('');
                  setCommitmentFilter('');
                  setSalaryRange([0, 200000]);
                  setExperienceRange([0, 15]);
                }}
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Authentication Required Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Authentication Required
              </DialogTitle>
              <DialogDescription>
                Sign up or log in to view full job details, save jobs, and apply
                for positions.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a href="/app/auth/login?user_type=candidate">Log In</a>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <a href="/app/candidate/signup">Sign Up</a>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Job Detail Dialog (for authenticated users) */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
            {selectedJob && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className="from-primary/20 to-primary/10 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br">
                      <Building2 className="text-primary h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl">
                        {selectedJob.title}
                      </DialogTitle>
                      <DialogDescription className="text-foreground text-lg font-medium">
                        {selectedJob.company?.name || 'Company Name'}
                      </DialogDescription>
                      <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedJob.isRemote ? 'Remote' : 'Location TBD'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Posted{' '}
                          {format(
                            new Date(selectedJob.createdAt),
                            'MMMM dd, yyyy'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary/10 rounded-lg px-4 py-2">
                      <div className="text-center">
                        <div className="text-primary text-2xl font-bold">
                          {selectedJob.numberOfOpenings}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Opening{selectedJob.numberOfOpenings > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <div className="space-y-6 md:col-span-2">
                    {/* Job Description */}
                    <div>
                      <h3 className="mb-3 text-lg font-semibold">
                        About This Role
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedJob.description}
                      </p>
                    </div>

                    {/* Responsibilities */}
                    {selectedJob.responsibilities &&
                      selectedJob.responsibilities.length > 0 && (
                        <div>
                          <h3 className="mb-3 text-lg font-semibold">
                            Key Responsibilities
                          </h3>
                          <ul className="space-y-2">
                            {selectedJob.responsibilities.map(
                              (responsibility, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground flex items-start gap-2"
                                >
                                  <CheckCircle className="text-primary mt-1 h-4 w-4 shrink-0" />
                                  <span>{responsibility}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Required Skills */}
                    {selectedJob.requiredSkills &&
                      selectedJob.requiredSkills.length > 0 && (
                        <div>
                          <h3 className="mb-3 text-lg font-semibold">
                            Required Skills
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.requiredSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="default"
                                className="px-3 py-1"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Preferred Skills */}
                    {selectedJob.preferredSkills &&
                      selectedJob.preferredSkills.length > 0 && (
                        <div>
                          <h3 className="mb-3 text-lg font-semibold">
                            Preferred Skills
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.preferredSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="px-3 py-1"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Benefits */}
                    {selectedJob.benefits &&
                      selectedJob.benefits.length > 0 && (
                        <div>
                          <h3 className="mb-3 text-lg font-semibold">
                            Benefits & Perks
                          </h3>
                          <ul className="space-y-2">
                            {selectedJob.benefits.map((benefit, index) => (
                              <li
                                key={index}
                                className="text-muted-foreground flex items-start gap-2"
                              >
                                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>

                  <div className="space-y-6">
                    {/* Job Summary */}
                    <Card className="p-4">
                      <h3 className="mb-4 font-semibold">Job Summary</h3>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Job Type
                          </span>
                          <Badge
                            className={getJobTypeColor(selectedJob.jobType)}
                          >
                            {formatEnumValue(selectedJob.jobType)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Commitment
                          </span>
                          <span className="font-medium">
                            {formatEnumValue(selectedJob.jobCommitment)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Experience
                          </span>
                          <span className="font-medium">
                            {selectedJob.totalExperience || 0}+ years
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Department
                          </span>
                          <span className="font-medium">
                            {selectedJob.department || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Industry
                          </span>
                          <span className="font-medium">
                            {formatEnumValue(selectedJob.industry)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Salary</span>
                          <span className="font-medium">
                            {formatSalary(
                              selectedJob.minSalary,
                              selectedJob.maxSalary,
                              selectedJob.salaryCurrency
                            )}
                          </span>
                        </div>
                        {selectedJob.equity && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Equity
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Available
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => handleApplyToJob(selectedJob)}
                      >
                        Apply Now
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => handleSaveJob(selectedJob.id, e)}
                        >
                          <BookmarkPlus className="mr-2 h-4 w-4" />
                          {savedJobs.has(selectedJob.id) ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Application Deadline */}
                    {selectedJob.applicationDeadline && (
                      <Card className="border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            Application deadline:{' '}
                            {format(
                              new Date(selectedJob.applicationDeadline),
                              'MMMM dd, yyyy'
                            )}
                          </span>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Job Application Dialog */}
        <Dialog
          open={!!showApplicationDialog}
          onOpenChange={() => setShowApplicationDialog(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Apply for Job</DialogTitle>
              <DialogDescription>
                {showApplicationDialog && (
                  <>
                    Submit your application for{' '}
                    <span className="font-medium">
                      {showApplicationDialog.title}
                    </span>{' '}
                    at{' '}
                    <span className="font-medium">
                      {showApplicationDialog.company?.name || 'this company'}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  placeholder="Add any additional information about your application, cover letter, or relevant experience..."
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowApplicationDialog(null)}
                disabled={applyJobMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmApplication}
                disabled={applyJobMutation.isPending}
              >
                {applyJobMutation.isPending
                  ? 'Submitting...'
                  : 'Submit Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CandidateJobsPage;
