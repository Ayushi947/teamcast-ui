'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/seo/breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Star,
  User,
  Clock,
  GraduationCap,
  Shield,
  Eye,
  Mail,
  Grid3X3,
  List,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useApp } from '@/lib/context/app-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock data for candidates
interface Candidate {
  id: string;
  name: string;
  jobTitle: string;
  location: string;
  experience: number;
  skills: string[];
  education: string;
  matchScore: number;
  avatar: string;
  bio: string;
  salaryRange: string;
  availability:
    | 'immediately'
    | 'within_2_weeks'
    | 'within_month'
    | 'not_available';
  verifiedProfile: boolean;
  lastActive: string;
  completionPercentage: number;
  industries: string[];
  languages: string[];
}

// Mock candidate data
const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    jobTitle: 'Senior Frontend Developer',
    location: 'San Francisco, CA',
    experience: 5,
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    education: 'MS Computer Science - Stanford University',
    matchScore: 95,
    avatar: '/avatars/sarah.jpg',
    bio: 'Passionate frontend developer with expertise in modern React ecosystem. Led 3 major product launches.',
    salaryRange: '$120k - $150k',
    availability: 'within_2_weeks',
    verifiedProfile: true,
    lastActive: '2 days ago',
    completionPercentage: 98,
    industries: ['Technology', 'Fintech'],
    languages: ['English', 'Mandarin'],
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    jobTitle: 'Full Stack Engineer',
    location: 'New York, NY',
    experience: 7,
    skills: ['Node.js', 'React', 'PostgreSQL', 'AWS', 'Docker'],
    education: 'BS Software Engineering - MIT',
    matchScore: 88,
    avatar: '/avatars/marcus.jpg',
    bio: 'Full-stack engineer with strong backend expertise. Built scalable systems serving millions of users.',
    salaryRange: '$130k - $160k',
    availability: 'immediately',
    verifiedProfile: true,
    lastActive: '1 day ago',
    completionPercentage: 92,
    industries: ['Technology', 'E-commerce'],
    languages: ['English', 'Spanish'],
  },
  {
    id: '3',
    name: 'Priya Patel',
    jobTitle: 'Data Scientist',
    location: 'Austin, TX',
    experience: 4,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'R'],
    education: 'PhD Data Science - University of Texas',
    matchScore: 82,
    avatar: '/avatars/priya.jpg',
    bio: 'Data scientist specializing in ML model deployment and statistical analysis. Published researcher.',
    salaryRange: '$110k - $140k',
    availability: 'within_month',
    verifiedProfile: true,
    lastActive: '3 days ago',
    completionPercentage: 95,
    industries: ['Healthcare', 'Technology'],
    languages: ['English', 'Hindi', 'Gujarati'],
  },
  {
    id: '4',
    name: 'Alex Thompson',
    jobTitle: 'DevOps Engineer',
    location: 'Seattle, WA',
    experience: 6,
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Jenkins', 'Monitoring'],
    education: 'BS Computer Engineering - University of Washington',
    matchScore: 79,
    avatar: '/avatars/alex.jpg',
    bio: 'DevOps engineer focused on infrastructure automation and cloud architecture. Reduced deployment time by 70%.',
    salaryRange: '$125k - $155k',
    availability: 'within_2_weeks',
    verifiedProfile: false,
    lastActive: '1 week ago',
    completionPercentage: 87,
    industries: ['Technology', 'Cloud Services'],
    languages: ['English'],
  },
  {
    id: '5',
    name: 'Emily Rodriguez',
    jobTitle: 'UX/UI Designer',
    location: 'Los Angeles, CA',
    experience: 3,
    skills: [
      'Figma',
      'Adobe Creative Suite',
      'Prototyping',
      'User Research',
      'Design Systems',
    ],
    education: 'MFA Design - Art Center College of Design',
    matchScore: 91,
    avatar: '/avatars/emily.jpg',
    bio: 'Creative UX/UI designer with a focus on user-centered design. Improved user engagement by 40% in previous role.',
    salaryRange: '$90k - $120k',
    availability: 'immediately',
    verifiedProfile: true,
    lastActive: '4 hours ago',
    completionPercentage: 94,
    industries: ['Technology', 'Media'],
    languages: ['English', 'Spanish'],
  },
  {
    id: '6',
    name: 'David Kim',
    jobTitle: 'Backend Developer',
    location: 'Chicago, IL',
    experience: 8,
    skills: ['Java', 'Spring Boot', 'Microservices', 'Redis', 'MongoDB'],
    education: 'MS Computer Science - Northwestern University',
    matchScore: 85,
    avatar: '/avatars/david.jpg',
    bio: 'Senior backend developer with expertise in distributed systems and high-performance applications.',
    salaryRange: '$135k - $165k',
    availability: 'within_month',
    verifiedProfile: true,
    lastActive: '5 days ago',
    completionPercentage: 89,
    industries: ['Fintech', 'Technology'],
    languages: ['English', 'Korean'],
  },
];

const ClientTalentPage = () => {
  const { user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceRange, setExperienceRange] = useState([0, 10]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'experience' | 'recent'>(
    'match'
  );

  // All available skills extracted from candidates
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    mockCandidates.forEach((candidate) => {
      candidate.skills.forEach((skill) => skills.add(skill));
    });
    return Array.from(skills).sort();
  }, []);

  // Filter and search candidates
  const filteredCandidates = useMemo(() => {
    let filtered = mockCandidates;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          candidate.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter((candidate) =>
        selectedSkills.every((skill) =>
          candidate.skills.some((candidateSkill) =>
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter((candidate) =>
        candidate.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Experience range filter
    filtered = filtered.filter(
      (candidate) =>
        candidate.experience >= experienceRange[0] &&
        candidate.experience <= experienceRange[1]
    );

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchScore - a.matchScore;
        case 'experience':
          return b.experience - a.experience;
        case 'recent':
          return (
            new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
          );
        default:
          return b.matchScore - a.matchScore;
      }
    });

    return filtered;
  }, [searchTerm, selectedSkills, locationFilter, experienceRange, sortBy]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500); // Simulate API call
  }, []);

  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }, []);

  const handleCandidateClick = useCallback(
    (candidate: Candidate) => {
      if (!user) {
        toast.info('Authentication Required', {
          description:
            'Sign up or log in to access full candidate profiles, contact information, and send interview invitations.',
          action: {
            label: 'Sign In',
            onClick: () => (window.location.href = '/auth/login'),
          },
        });
        setShowAuthDialog(true);
        return;
      }
      setSelectedCandidate(candidate);
    },
    [user]
  );

  const getMatchScoreColor = useCallback((score: number) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 80) return 'from-blue-500 to-blue-600';
    if (score >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  }, []);

  const getAvailabilityColor = useCallback((availability: string) => {
    switch (availability) {
      case 'immediately':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'within_2_weeks':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'within_month':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }, []);

  const formatAvailability = useCallback((availability: string) => {
    switch (availability) {
      case 'immediately':
        return 'Available Now';
      case 'within_2_weeks':
        return 'Within 2 Weeks';
      case 'within_month':
        return 'Within Month';
      default:
        return 'Not Available';
    }
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbConfigs.clientTalent} />
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
              Find Your Perfect Talent
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-lg md:text-xl">
              Discover exceptional candidates from our curated pool of verified
              professionals. Use AI-powered matching to find the best fit for
              your team.
            </p>
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
              placeholder="Search by name, job title, skills, or location..."
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
                  experienceRange[0] > 0 ||
                  experienceRange[1] < 10) && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedSkills.length +
                      (locationFilter ? 1 : 0) +
                      (experienceRange[0] > 0 || experienceRange[1] < 10
                        ? 1
                        : 0)}
                  </Badge>
                )}
              </Button>

              <Select
                value={sortBy}
                onValueChange={(value: 'match' | 'experience' | 'recent') =>
                  setSortBy(value)
                }
              >
                <SelectTrigger className="h-11 w-full sm:w-52">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best Match</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="recent">Recently Active</SelectItem>
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
                      {allSkills.map((skill) => (
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

                  {/* Location and Experience Filters */}
                  <div className="grid gap-8 lg:grid-cols-2">
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
          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-foreground text-2xl font-semibold lg:text-3xl">
              {isLoading
                ? 'Searching...'
                : `${filteredCandidates.length} candidates found`}
            </h2>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-14" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Candidates Grid/List */}
          {!isLoading && (
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' : 'mx-auto max-w-3xl grid-cols-1'}`}
            >
              <AnimatePresence>
                {filteredCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className="group hover:border-primary/50 relative cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-xl"
                      onClick={() => handleCandidateClick(candidate)}
                    >
                      {/* Match Score Badge */}
                      <div className="absolute top-0 right-0 z-10">
                        <div
                          className={`bg-gradient-to-r ${getMatchScoreColor(candidate.matchScore)} flex items-center gap-1 rounded-bl-lg px-3 py-2 text-white shadow-lg`}
                        >
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-sm font-bold">
                            {candidate.matchScore}%
                          </span>
                        </div>
                      </div>

                      {/* Verified Badge */}
                      {candidate.verifiedProfile && (
                        <div className="absolute top-0 left-0 z-10">
                          <div className="flex items-center gap-1 rounded-br-lg bg-green-500 px-3 py-2 text-white shadow-lg">
                            <Shield className="h-3 w-3" />
                            <span className="text-xs font-medium">
                              Verified
                            </span>
                          </div>
                        </div>
                      )}

                      <CardHeader className="pt-12 pb-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="from-primary/20 to-primary/10 ring-primary/10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ring-2">
                              <User className="text-primary h-8 w-8" />
                            </div>
                            <div className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-white bg-green-500 shadow-sm"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="mb-2 text-lg leading-tight lg:text-xl">
                              {candidate.name}
                            </CardTitle>
                            <p className="text-muted-foreground text-sm font-medium lg:text-base">
                              {candidate.jobTitle}
                            </p>
                            <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs lg:text-sm">
                              <MapPin className="h-3 w-3" />
                              {candidate.location}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-5 px-6 pb-6">
                        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed lg:text-base">
                          {candidate.bio}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="px-3 py-1 text-xs font-medium lg:text-sm"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 3 && (
                            <Badge
                              variant="outline"
                              className="px-3 py-1 text-xs font-medium lg:text-sm"
                            >
                              +{candidate.skills.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm lg:text-base">
                          <div className="flex items-center gap-2">
                            <Briefcase className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">
                              {candidate.experience}y exp
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">
                              {candidate.lastActive}
                            </span>
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center justify-between pt-2">
                          <Badge
                            className={cn(
                              'px-3 py-1 text-xs font-medium lg:text-sm',
                              getAvailabilityColor(candidate.availability)
                            )}
                          >
                            {formatAvailability(candidate.availability)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary-foreground hover:bg-primary font-medium"
                          >
                            View Profile
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredCandidates.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                <Search className="text-muted-foreground h-12 w-12" />
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                No candidates found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters to find more
                candidates.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSkills([]);
                  setLocationFilter('');
                  setExperienceRange([0, 10]);
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
                You need to be logged in to view candidate profiles and send
                invitations.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a href="/app/auth/login?user_type=client">Log In</a>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <a href="/app/client/signup">Sign Up</a>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Candidate Detail Dialog (for authenticated users) */}
        <Dialog
          open={!!selectedCandidate}
          onOpenChange={() => setSelectedCandidate(null)}
        >
          <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
            {selectedCandidate && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className="from-primary/20 to-primary/10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br">
                      <User className="text-primary h-10 w-10" />
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl">
                        {selectedCandidate.name}
                      </DialogTitle>
                      <DialogDescription className="text-foreground text-lg font-medium">
                        {selectedCandidate.jobTitle}
                      </DialogDescription>
                      <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedCandidate.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {selectedCandidate.experience} years experience
                        </div>
                      </div>
                    </div>
                    <div
                      className={`bg-gradient-to-r ${getMatchScoreColor(selectedCandidate.matchScore)} rounded-lg px-4 py-2 text-white`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {selectedCandidate.matchScore}%
                        </div>
                        <div className="text-xs">Match</div>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <div className="space-y-6 md:col-span-2">
                    {/* Bio */}
                    <div>
                      <h3 className="mb-2 font-semibold">About</h3>
                      <p className="text-muted-foreground">
                        {selectedCandidate.bio}
                      </p>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="mb-2 font-semibold">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <h3 className="mb-2 font-semibold">Education</h3>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="text-muted-foreground h-4 w-4" />
                        <span>{selectedCandidate.education}</span>
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="mb-2 font-semibold">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.languages.map((language) => (
                          <Badge key={language} variant="outline">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Quick Stats */}
                    <Card className="p-4">
                      <h3 className="mb-3 font-semibold">Quick Stats</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Profile Completion</span>
                          <span className="font-medium">
                            {selectedCandidate.completionPercentage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Salary Range</span>
                          <span className="font-medium">
                            {selectedCandidate.salaryRange}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Availability</span>
                          <Badge
                            className={cn(
                              'text-xs',
                              getAvailabilityColor(
                                selectedCandidate.availability
                              )
                            )}
                          >
                            {formatAvailability(selectedCandidate.availability)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Active</span>
                          <span className="font-medium">
                            {selectedCandidate.lastActive}
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button className="w-full" size="lg">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Interview Invite
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View Full Resume
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ClientTalentPage;
