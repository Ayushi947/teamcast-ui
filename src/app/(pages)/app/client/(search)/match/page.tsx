'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Search,
  Grid3X3,
  List,
  Users,
  Target,
  Loader2,
  X,
  MessageCircle,
  Bookmark,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { useState, Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SearchService } from '@/lib/services/services';
import { ISearchResult } from '@/lib/shared';
import Navbar from '@/app/(pages)/(website)/components/navbar';
import { SearchFilterSection } from './components/search-filter-section';
import { CandidateCard } from './components/candidate-card';

interface SearchFilters {
  location: string;
  experience: string;
  skills: string[];
  salary: {
    min: number;
    max: number;
  };
  remote: boolean;
}

// Main component
const MatchPageContent = () => {
  // URL params
  const searchParams = useSearchParams();
  const paramQuery = searchParams.get('query');
  const router = useRouter();
  const pathname = usePathname();

  // Search state
  const [searchQuery, setSearchQuery] = useState(paramQuery || '');
  const [committedSearchQuery, setCommittedSearchQuery] = useState(
    paramQuery || ''
  );

  // Function to update URL with search query
  const updateSearchUrl = (query: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (query.trim()) {
      current.set('query', query.trim());
    } else {
      current.delete('query');
    }

    const search = current.toString();
    const queryString = search ? `?${search}` : '';

    router.replace(`${pathname}${queryString}`);
  };

  // View and filter state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    experience: '',
    skills: [],
    salary: { min: 0, max: 200000 },
    remote: false,
  });

  // Selection state
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showMatchDetails, setShowMatchDetails] = useState<string | null>(null);

  // Ref for auto-scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isUserInitiatedSearch, setIsUserInitiatedSearch] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Search query
  const {
    data: searchCandidates,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['search-candidates', committedSearchQuery, filters],
    queryFn: () =>
      SearchService.searchCandidates({ query: committedSearchQuery || '' }),
    enabled: true, // Always run the query
  });

  // Trigger initial search on page load
  useEffect(() => {
    // Set the committed search query on initial load to trigger search
    if (paramQuery) {
      setCommittedSearchQuery(paramQuery);
      // If there's a URL query, treat it as user-initiated for auto-scroll
      // This handles cases where users search from hero section
      setIsUserInitiatedSearch(true);
    } else {
      // Even if no URL query, trigger search with empty string
      setCommittedSearchQuery('');
    }
  }, [paramQuery]);

  // Mark page as loaded after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to results when search is triggered (only for user-initiated searches)
  useEffect(() => {
    if (isUserInitiatedSearch && resultsRef.current && isPageLoaded) {
      // Longer delay for URL-based searches (from hero section) to ensure page is fully loaded
      const scrollTimeout = setTimeout(
        () => {
          const yOffset = -80; // Offset to account for navbar and spacing
          const element = resultsRef.current;
          if (element) {
            const y =
              element.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
          setIsUserInitiatedSearch(false); // Reset flag
        },
        paramQuery ? 500 : 200
      ); // Longer delay for URL-based searches

      return () => clearTimeout(scrollTimeout);
    }
  }, [isUserInitiatedSearch, paramQuery, isPageLoaded]);

  // Handle candidate selection
  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  // Handle match details toggle
  const toggleMatchDetails = (candidateId: string) => {
    setShowMatchDetails((prev) => (prev === candidateId ? null : candidateId));
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedCandidates([]);
    setShowMatchDetails(null);
  };

  // Helper function to handle search with auto-scroll
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setCommittedSearchQuery(query);
    updateSearchUrl(query);
    setIsUserInitiatedSearch(true); // Mark as user-initiated search
  };

  // Popular searches
  const popularSearches = [
    'React Developer',
    'Python Engineer',
    'UI/UX Designer',
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="from-primary via-primary/90 to-primary/80 relative mt-16 overflow-hidden bg-gradient-to-br px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Target
                  className="h-10 w-10 animate-spin text-white"
                  style={{ animationDuration: '3s' }}
                />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Find Your Perfect Match
            </h1>
            <p className="mb-8 text-xl text-white/90 sm:text-2xl">
              AI-powered candidate matching for your next hire
            </p>

            {/* Search Filter Section */}
            <div className="mx-auto max-w-4xl">
              <SearchFilterSection
                searchQuery={searchQuery}
                onSearchInputSubmit={handleSearchSubmit}
              />
            </div>

            {/* Popular Searches */}
            <div className="mt-6">
              <p className="mb-3 text-sm text-white/80">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((search) => (
                  <Button
                    key={search}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSearchSubmit(search)}
                    className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>

      {/* Main Content */}
      <div
        ref={resultsRef}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Results Header */}
        {(committedSearchQuery || searchCandidates?.results || isLoading) && (
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {committedSearchQuery ? 'Search Results' : 'All Candidates'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {isLoading ? (
                    committedSearchQuery ? (
                      <>Searching for &ldquo;{committedSearchQuery}&rdquo;...</>
                    ) : (
                      'Loading all candidates...'
                    )
                  ) : (
                    <>
                      {searchCandidates?.results?.length || 0} candidates found
                      {committedSearchQuery && (
                        <> for &ldquo;{committedSearchQuery}&rdquo;</>
                      )}
                    </>
                  )}
                </p>
              </div>

              {/* Controls - Only show when not loading */}
              {!isLoading && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>

                  <div className="flex items-center rounded-lg border bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 px-3"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && !isLoading && (
          <Card className="mb-8 p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Location
                </label>
                <Input
                  placeholder="Any location"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Experience Level
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                >
                  <option value="">Any experience</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Principal</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Salary Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.salary.min}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        salary: { ...prev.salary, min: Number(e.target.value) },
                      }))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.salary.max}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        salary: { ...prev.salary, max: Number(e.target.value) },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      location: '',
                      experience: '',
                      skills: [],
                      salary: { min: 0, max: 200000 },
                      remote: false,
                    })
                  }
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {!isLoading && !isError && searchCandidates?.results ? (
          <>
            {searchCandidates.results.length > 0 ? (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {searchCandidates.results.map((candidate: ISearchResult) => (
                  <CandidateCard
                    key={candidate.id}
                    candidateId={candidate.id}
                    candidate={candidate}
                    viewMode={viewMode}
                    isSelected={selectedCandidates.includes(candidate.id)}
                    toggleSelection={toggleCandidateSelection}
                    showMatchDetails={showMatchDetails}
                    toggleMatchDetails={toggleMatchDetails}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  {committedSearchQuery
                    ? 'No Matches Found'
                    : 'No Candidates Available'}
                </h3>
                <p className="mb-6 text-slate-600 dark:text-slate-400">
                  {committedSearchQuery
                    ? "We couldn't find exact matches for your current criteria, but we have a vast database of talented candidates."
                    : 'No candidates are currently available. Please try again later or contact our team for assistance.'}
                </p>

                {/* Branding Data Section */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      50K+
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Active Candidates
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-900/20 dark:to-green-800/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      95%
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Match Accuracy
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-900/20 dark:to-purple-800/20">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      200+
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      Skills Tracked
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    variant="outline"
                    onClick={() => handleSearchSubmit('')}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {committedSearchQuery
                      ? 'Start New Search'
                      : 'Refresh Search'}
                  </Button>
                  <Button>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Our Team
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : isLoading ? (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="text-primary mx-auto mb-6 h-16 w-16 animate-spin" />
              <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                {committedSearchQuery
                  ? 'Searching Candidates...'
                  : 'Loading All Candidates...'}
              </h3>
              <p className="mb-2 text-slate-600 dark:text-slate-400">
                {committedSearchQuery
                  ? `Finding the best matches for "${committedSearchQuery}"`
                  : 'Fetching all available candidates from our database'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Our AI is analyzing thousands of profiles to find the perfect
                match
              </p>

              {/* Progress Animation */}
              <div className="mt-6 flex items-center justify-center space-x-2">
                <div className="bg-primary h-2 w-2 animate-bounce rounded-full"></div>
                <div
                  className="bg-primary h-2 w-2 animate-bounce rounded-full"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="bg-primary h-2 w-2 animate-bounce rounded-full"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        ) : isError ? (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <X className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
              Search Error
            </h3>
            <p className="mb-4 text-slate-600 dark:text-slate-400">
              We encountered an issue while searching. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <Target className="mx-auto mb-4 h-16 w-16 text-slate-400" />
            <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
              Initializing Search...
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we prepare your search experience.
            </p>
          </Card>
        )}
      </div>

      {/* Action Bar */}
      {selectedCandidates.length > 0 && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedCandidates.length} candidate
                {selectedCandidates.length !== 1 ? 's' : ''} selected
              </span>
              <Button variant="outline" size="sm" onClick={clearSelections}>
                Clear Selection
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Bookmark className="mr-2 h-4 w-4" />
                Save to List
              </Button>
              <Button>
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Loading component
const MatchPageLoading = () => (
  <div className="via-primary/30 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
        <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
          Loading Teamcast
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Preparing your candidate search experience...
        </p>
      </div>
    </div>
  </div>
);

// Main component with Suspense
const MatchPage = () => {
  return (
    <Suspense fallback={<MatchPageLoading />}>
      <MatchPageContent />
    </Suspense>
  );
};

export default MatchPage;
