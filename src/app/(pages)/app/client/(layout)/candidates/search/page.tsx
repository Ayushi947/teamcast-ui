'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Users,
  Download,
  MessageSquare,
  Briefcase,
  CheckCircle2,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Services and Components
import { CandidateAdvancedSearchPanel } from './components/candidate-advanced-search-panel';
import { CandidateCard } from './components/candidate-card';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/shared';

// Local interfaces for candidate search
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

interface ICandidateSearchResponse {
  items: ICandidateProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Types
interface CandidateSearchFilter {
  id: string;
  type:
    | 'skills'
    | 'location'
    | 'experience'
    | 'salary'
    | 'jobTitle'
    | 'education'
    | 'status';
  label: string;
  value: string | number | string[] | { min: number; max: number };
  operator: 'contains' | 'equals' | 'range' | 'in';
}

interface CandidateAdvancedSearchState {
  filters: CandidateSearchFilter[];
  quickFilters: {
    isRemote: boolean;
    availableNow: boolean;
    verified: boolean;
  };
  experienceRange: [number, number];
  salaryRange: [number, number];
  searchText: string;
}

interface SearchStats {
  total: number;
  filtered: number;
  shortlisted: number;
  contacted: number;
}

export default function CandidateSearchPage() {
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedSearchState, setAdvancedSearchState] =
    useState<CandidateAdvancedSearchState>({
      filters: [],
      quickFilters: {
        isRemote: false,
        availableNow: false,
        verified: false,
      },
      experienceRange: [0, 15],
      salaryRange: [30000, 200000],
      searchText: '',
    });
  const [shortlistedCandidates, setShortlistedCandidates] = useState<string[]>(
    []
  );
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Load shortlisted candidates from localStorage on initial render
  useEffect(() => {
    try {
      const savedShortlist = localStorage.getItem('shortlistedCandidates');
      if (savedShortlist) {
        const parsed = JSON.parse(savedShortlist);
        if (Array.isArray(parsed)) {
          setShortlistedCandidates(parsed);
        }
      }
    } catch (error) {
      logger.error('Error loading shortlisted candidates:', error);
      setShortlistedCandidates([]);
    }
  }, []);

  // Prepare search parameters
  const getSearchParams = useCallback(() => {
    const { filters, quickFilters, experienceRange, salaryRange, searchText } =
      advancedSearchState;

    return {
      page: currentPage,
      limit: 20,
      sortBy,
      sortOrder,
      filters: {
        search: searchQuery || searchText,
        isRemote: quickFilters.isRemote || undefined,
        experience: {
          min: experienceRange[0] > 0 ? experienceRange[0] : undefined,
          max: experienceRange[1] < 15 ? experienceRange[1] : undefined,
        },
        salary: {
          min: salaryRange[0] > 30000 ? salaryRange[0] : undefined,
          max: salaryRange[1] < 200000 ? salaryRange[1] : undefined,
        },
        skills: filters
          .filter((f) => f.type === 'skills')
          .flatMap((f) => (Array.isArray(f.value) ? f.value : [f.value]))
          .filter(Boolean) as string[],
        location: filters.find((f) => f.type === 'location')?.value as string,
        status: filters.find((f) => f.type === 'status')?.value as string,
      },
    };
  }, [advancedSearchState, searchQuery, sortBy, sortOrder, currentPage]);

  // Mock search function for development
  const searchCandidates = async (): Promise<ICandidateSearchResponse> => {
    // Mock data for development
    const mockCandidates: ICandidateProfile[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1234567890',
        location: 'New York, NY',
        status: 'active',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        experience: 5,
        education: 'Bachelor of Computer Science',
        jobTitle: 'Senior Frontend Developer',
        createdAt: '2024-01-15T10:30:00Z',
        completionPercentage: 95,
        salary: 120000,
        isRemote: true,
        employmentType: 'FULL_TIME',
        department: 'Engineering',
        biography:
          'Experienced frontend developer with a passion for creating user-friendly applications.',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johnsmith',
          github: 'https://github.com/johnsmith',
        },
        isVerified: true,
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1234567891',
        location: 'San Francisco, CA',
        status: 'active',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        experience: 7,
        education: 'Master of Computer Science',
        jobTitle: 'Backend Developer',
        createdAt: '2024-01-20T14:20:00Z',
        completionPercentage: 90,
        salary: 140000,
        isRemote: false,
        employmentType: 'FULL_TIME',
        department: 'Engineering',
        biography:
          'Backend developer specialized in scalable web applications.',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
        },
        isVerified: true,
      },
      {
        id: '3',
        name: 'Michael Chen',
        email: 'michael@example.com',
        phone: '+1234567892',
        location: 'Austin, TX',
        status: 'active',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'],
        experience: 4,
        education: 'Bachelor of Software Engineering',
        jobTitle: 'Java Developer',
        createdAt: '2024-02-01T09:15:00Z',
        completionPercentage: 85,
        salary: 100000,
        isRemote: true,
        employmentType: 'FULL_TIME',
        department: 'Engineering',
        biography: 'Java developer with expertise in enterprise applications.',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/michaelchen',
          github: 'https://github.com/michaelchen',
        },
        isVerified: false,
      },
      {
        id: '4',
        name: 'Emily Davis',
        email: 'emily@example.com',
        phone: '+1234567893',
        location: 'Seattle, WA',
        status: 'active',
        skills: ['React', 'Vue.js', 'CSS', 'JavaScript', 'UI/UX'],
        experience: 3,
        education: 'Bachelor of Design',
        jobTitle: 'Frontend Developer',
        createdAt: '2024-02-10T16:45:00Z',
        completionPercentage: 88,
        salary: 85000,
        isRemote: true,
        employmentType: 'FULL_TIME',
        department: 'Design',
        biography: 'Creative frontend developer with strong design skills.',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/emilydavis',
          portfolio: 'https://emilydavis.dev',
        },
        isVerified: true,
      },
      {
        id: '5',
        name: 'David Wilson',
        email: 'david@example.com',
        phone: '+1234567894',
        location: 'Chicago, IL',
        status: 'looking',
        skills: ['C#', '.NET', 'SQL Server', 'Azure'],
        experience: 6,
        education: 'Master of Information Technology',
        jobTitle: '.NET Developer',
        createdAt: '2024-02-15T11:30:00Z',
        completionPercentage: 92,
        salary: 110000,
        isRemote: false,
        employmentType: 'FULL_TIME',
        department: 'Engineering',
        biography: 'Experienced .NET developer with cloud expertise.',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/davidwilson',
        },
        isVerified: true,
      },
    ];

    // Apply basic filtering based on search query
    let filteredCandidates = mockCandidates;
    const params = getSearchParams();

    if (params.filters.search) {
      const searchTerm = params.filters.search.toLowerCase();
      filteredCandidates = filteredCandidates.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchTerm) ||
          candidate.jobTitle?.toLowerCase().includes(searchTerm) ||
          candidate.location?.toLowerCase().includes(searchTerm) ||
          candidate.skills?.some((skill) =>
            skill.toLowerCase().includes(searchTerm)
          )
      );
    }

    // Apply skills filter
    if (params.filters.skills && params.filters.skills.length > 0) {
      filteredCandidates = filteredCandidates.filter((candidate) =>
        params.filters.skills!.some((skill) =>
          candidate.skills?.some((candidateSkill) =>
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Apply experience filter
    if (params.filters.experience?.min !== undefined) {
      filteredCandidates = filteredCandidates.filter(
        (candidate) =>
          (candidate.experience || 0) >= params.filters.experience!.min!
      );
    }
    if (params.filters.experience?.max !== undefined) {
      filteredCandidates = filteredCandidates.filter(
        (candidate) =>
          (candidate.experience || 0) <= params.filters.experience!.max!
      );
    }

    // Apply salary filter
    if (params.filters.salary?.min !== undefined) {
      filteredCandidates = filteredCandidates.filter(
        (candidate) => (candidate.salary || 0) >= params.filters.salary!.min!
      );
    }
    if (params.filters.salary?.max !== undefined) {
      filteredCandidates = filteredCandidates.filter(
        (candidate) => (candidate.salary || 0) <= params.filters.salary!.max!
      );
    }

    // Apply remote filter
    if (params.filters.isRemote !== undefined) {
      filteredCandidates = filteredCandidates.filter(
        (candidate) => candidate.isRemote === params.filters.isRemote
      );
    }

    // Apply location filter
    if (params.filters.location) {
      filteredCandidates = filteredCandidates.filter((candidate) =>
        candidate.location
          ?.toLowerCase()
          .includes(params.filters.location!.toLowerCase())
      );
    }

    // Apply status filter
    if (params.filters.status) {
      filteredCandidates = filteredCandidates.filter(
        (candidate) =>
          candidate.status?.toLowerCase() ===
          params.filters.status!.toLowerCase()
      );
    }

    // Sort candidates
    filteredCandidates.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (params.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'experience':
          aValue = a.experience || 0;
          bValue = b.experience || 0;
          break;
        case 'salary':
          aValue = a.salary || 0;
          bValue = b.salary || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || '');
          bValue = new Date(b.createdAt || '');
          break;
      }

      if (params.sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Pagination
    const startIndex = (params.page! - 1) * params.limit!;
    const endIndex = startIndex + params.limit!;
    const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

    return {
      items: paginatedCandidates,
      pagination: {
        total: filteredCandidates.length,
        page: params.page!,
        limit: params.limit!,
        totalPages: Math.ceil(filteredCandidates.length / params.limit!),
      },
    };
  };

  // Fetch candidates using the candidate profile service
  const {
    data: candidatesResponse,
    isLoading: candidatesLoading,
    error: candidatesError,
    refetch: refetchCandidates,
  } = useQuery<ICandidateSearchResponse>({
    queryKey: [
      'candidates',
      advancedSearchState,
      searchQuery,
      sortBy,
      sortOrder,
      currentPage,
    ],
    queryFn: searchCandidates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const candidatesData = candidatesResponse?.items || [];

  // Filtered candidates based on all search parameters
  const filteredCandidates = useMemo(() => {
    return candidatesData;
  }, [candidatesData]);
  logger.info('filteredCandidates', filteredCandidates);

  // Calculate search stats
  const searchStats: SearchStats = useMemo(() => {
    return {
      total: candidatesResponse?.pagination?.total || candidatesData.length,
      filtered: filteredCandidates.length,
      shortlisted: shortlistedCandidates.length,
      contacted: 0, // This would come from API in real implementation
    };
  }, [candidatesResponse, filteredCandidates, shortlistedCandidates]);

  // Event handlers
  const handleAdvancedSearch = useCallback(
    (searchState: CandidateAdvancedSearchState) => {
      setAdvancedSearchState(searchState);
      setCurrentPage(1); // Reset to first page on new search
      toast.success('Search filters applied!');
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
    setAdvancedSearchState({
      filters: [],
      quickFilters: {
        isRemote: false,
        availableNow: false,
        verified: false,
      },
      experienceRange: [0, 15],
      salaryRange: [30000, 200000],
      searchText: '',
    });
    toast.success('Search cleared!');
  }, []);

  const handleShortlistCandidate = useCallback(
    (candidate: ICandidateProfile) => {
      const isCurrentlyShortlisted = shortlistedCandidates.includes(
        candidate.id
      );
      let updatedShortlist: string[];

      if (isCurrentlyShortlisted) {
        updatedShortlist = shortlistedCandidates.filter(
          (id) => id !== candidate.id
        );
        toast.success(`${candidate.name} removed from shortlist`);
      } else {
        updatedShortlist = [...shortlistedCandidates, candidate.id];
        toast.success(`${candidate.name} added to shortlist`);
      }

      setShortlistedCandidates(updatedShortlist);

      try {
        localStorage.setItem(
          'shortlistedCandidates',
          JSON.stringify(updatedShortlist)
        );
      } catch (error) {
        logger.error('Error saving to localStorage:', error);
      }
    },
    [shortlistedCandidates]
  );

  const handleContactCandidate = useCallback((candidate: ICandidateProfile) => {
    toast.success(`Contacting ${candidate.name}...`);
    // Implement contact functionality
  }, []);

  const handleViewProfile = useCallback(
    (candidate: ICandidateProfile) => {
      router.push(`/app/client/candidates/${candidate.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    refetchCandidates();
    toast.success('Candidates refreshed!');
  }, [refetchCandidates]);

  const toggleCandidateSelection = useCallback((candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map((c) => c.id));
    }
  }, [selectedCandidates, filteredCandidates]);

  const handleBulkMessage = useCallback(() => {
    toast.success(`Messaging ${selectedCandidates.length} candidates...`);
    // Implement bulk messaging
  }, [selectedCandidates]);

  const handleBulkShortlist = useCallback(() => {
    const newShortlisted = Array.from(
      new Set([...shortlistedCandidates, ...selectedCandidates])
    );
    setShortlistedCandidates(newShortlisted);

    try {
      localStorage.setItem(
        'shortlistedCandidates',
        JSON.stringify(newShortlisted)
      );
      toast.success(
        `${selectedCandidates.length} candidates added to shortlist`
      );
      setSelectedCandidates([]);
    } catch (error) {
      logger.error('Error saving to localStorage:', error);
      toast.error('Failed to save shortlist');
    }
  }, [shortlistedCandidates, selectedCandidates]);

  const handleExportSelected = useCallback(() => {
    const selectedData = filteredCandidates.filter((c) =>
      selectedCandidates.includes(c.id)
    );

    const csvContent = [
      ['Name', 'Title', 'Location', 'Experience', 'Skills'].join(','),
      ...selectedData.map((candidate) =>
        [
          candidate.name,
          candidate.jobTitle || '',
          candidate.location || '',
          `${candidate.experience || 0} years`,
          (candidate.skills || []).join('; '),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedCandidates.length} candidates`);
  }, [filteredCandidates, selectedCandidates]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const removeFilter = useCallback((filterIndex: number) => {
    setAdvancedSearchState((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, index) => index !== filterIndex),
    }));
  }, []);

  // Error state
  if (candidatesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-red-100 p-6 dark:bg-red-900/30">
              <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Failed to Load Candidates
            </h1>
            <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
              We encountered an error while loading candidate data. Please try
              again or contact support if the issue persists.
            </p>
            <Button onClick={handleRefresh} size="lg" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-lg bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
        <div className="mx-auto max-w-full px-16 py-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Candidate Search
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Find and connect with top talent across various industries and
                skill sets
              </p>

              {/* Search Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {searchStats.total.toLocaleString()} total
                </span>
                <span className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  {searchStats.filtered.toLocaleString()} filtered
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {searchStats.shortlisted} shortlisted
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={candidatesLoading}
                className="gap-2 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${candidatesLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>

              {selectedCandidates.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMessage}
                    className="gap-2 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message ({selectedCandidates.length})
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkShortlist}
                    className="gap-2 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Shortlist
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportSelected}
                    className="gap-2 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-16">
        <div className="space-y-6">
          {/* Search Controls */}
          <Card className="bg-white/60 shadow-sm backdrop-blur-sm dark:bg-slate-800/60">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full max-w-md">
                  <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search candidates by name, skills, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 border-gray-200 bg-white/50 pl-12 text-base focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="gap-2 bg-white/50 hover:border-gray-300 hover:bg-gray-50 dark:bg-slate-700/50 dark:hover:bg-slate-600"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Advanced Filters
                    {showAdvancedSearch ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {advancedSearchState.filters.length > 0 && (
                      <Badge className="ml-1 bg-blue-100 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {advancedSearchState.filters.length}
                      </Badge>
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-10 w-[180px] gap-2 border-gray-200 bg-white/50 dark:border-slate-600 dark:bg-slate-700/50">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Most Recent</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="salary">Salary</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSortOrder}
                      className="h-10 w-10 border-gray-200 bg-white/50 p-0 dark:border-slate-600 dark:bg-slate-700/50"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex h-10 items-center gap-1 rounded-lg border border-gray-200 bg-white/50 p-1 dark:border-slate-600 dark:bg-slate-700/50">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(searchQuery || advancedSearchState.filters.length > 0) && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active filters:
                  </span>

                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: &quot;{searchQuery}&quot;
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {advancedSearchState.filters.map((filter, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {filter.label || filter.type}:{' '}
                      {Array.isArray(filter.value)
                        ? filter.value.join(', ')
                        : typeof filter.value === 'object'
                          ? `${filter.value.min} - ${filter.value.max}`
                          : filter.value}
                      <button
                        onClick={() => removeFilter(index)}
                        className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced search panel */}
          <CandidateAdvancedSearchPanel
            isVisible={showAdvancedSearch}
            onToggle={() => setShowAdvancedSearch(!showAdvancedSearch)}
            onSearch={handleAdvancedSearch}
            onClear={handleClearSearch}
          />

          {/* Results section */}
          <div className="space-y-6">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {filteredCandidates.length.toLocaleString()} Candidates
                    {searchQuery || advancedSearchState.filters.length > 0
                      ? ' Found'
                      : ''}
                  </p>
                  {searchQuery && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing results for &quot;
                      <span className="font-medium text-gray-900 dark:text-white">
                        {searchQuery}
                      </span>
                      &quot;
                    </p>
                  )}
                </div>
              </div>

              {filteredCandidates.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="gap-2 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {selectedCandidates.length === filteredCandidates.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              )}
            </div>

            {/* Loading state */}
            {candidatesLoading ? (
              <div className="space-y-6">
                {viewMode === 'grid' ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card
                        key={i}
                        className="animate-pulse bg-white/60 dark:bg-slate-800/60"
                      >
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                              <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex gap-2">
                              <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                              <div className="h-6 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Card
                        key={i}
                        className="animate-pulse bg-white/60 dark:bg-slate-800/60"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                              <div className="h-3 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-6 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-slate-800/60">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    No candidates found
                  </h3>
                  <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
                    {searchQuery || advancedSearchState.filters.length > 0
                      ? 'Try adjusting your search criteria or clearing some filters.'
                      : 'Start by searching for candidates or applying filters.'}
                  </p>
                  {(searchQuery || advancedSearchState.filters.length > 0) && (
                    <Button
                      variant="outline"
                      onClick={handleClearSearch}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onViewProfile={handleViewProfile}
                    onContact={handleContactCandidate}
                    onShortlist={handleShortlistCandidate}
                    isShortlisted={shortlistedCandidates.includes(candidate.id)}
                    viewMode={viewMode}
                    isSelected={selectedCandidates.includes(candidate.id)}
                    onSelect={() => toggleCandidateSelection(candidate.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination controls */}
            {filteredCandidates.length > 0 &&
              candidatesResponse?.pagination && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing{' '}
                    <span className="font-medium">
                      {filteredCandidates.length}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">
                      {candidatesResponse.pagination.total}
                    </span>{' '}
                    candidates
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className="h-8 w-8 border-gray-200 bg-white p-0 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <ChevronUp className="h-4 w-4 rotate-90" />
                    </Button>

                    <span className="flex items-center px-3 text-sm text-gray-700 dark:text-gray-300">
                      Page {currentPage} of{' '}
                      {candidatesResponse.pagination.totalPages || 1}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        currentPage >=
                        (candidatesResponse.pagination.totalPages || 1)
                      }
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="h-8 w-8 border-gray-200 bg-white p-0 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <ChevronUp className="h-4 w-4 -rotate-90" />
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
