import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowLeft,
  Bot,
  Briefcase,
  LayoutGrid,
  List,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Filters } from './filters';
import { SearchBar } from './search-bar';

interface HeaderProps {
  sortedCandidatesLength: number;
  onOpenAIJobEditor: () => void;
  onOpenJobDescription: () => void;
  filterOptions: any;
  selectedFilters: any;
  setSelectedFilters: any;
  sortBy: 'matchScore' | 'experience';
  setSortBy: any;
  sortDirection: 'asc' | 'desc';
  setSortDirection: any;
  activeFilters: string[];
  clearFilters: () => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  // User auth props
  isLoggedIn: boolean;
  onLogout: () => void;
  // Search props
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;
  searchSuggestions: string[];
  isProcessingQuery: boolean;
  extractedPosition: string | null;
  extractedLocation: string | null;
  extractedCompensation: string | null;
  extractedSkills: string[];
  clearExtractedParameter: (
    type: 'position' | 'location' | 'compensation' | 'skill',
    skill?: string
  ) => void;
  clearSearch: () => void;
  removeFilter: (filter: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSearchSubmit: (e?: React.FormEvent) => void;
}

export const Header = ({
  sortedCandidatesLength,
  onOpenAIJobEditor,
  onOpenJobDescription,
  filterOptions,
  selectedFilters,
  setSelectedFilters,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  activeFilters,
  clearFilters,
  viewMode,
  setViewMode,
  // User auth props
  isLoggedIn,
  onLogout,
  // Search props
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
  searchSuggestions,
  isProcessingQuery,
  extractedPosition,
  extractedLocation,
  extractedCompensation,
  extractedSkills,
  clearExtractedParameter,
  clearSearch,
  removeFilter,
  onKeyDown,
  handleSearchSubmit,
}: HeaderProps) => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  const goBack = () => {
    router.back();
  };

  return (
    <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto py-4 sm:px-2 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Find Your Perfect Match
            </h1>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
              {sortedCandidatesLength} candidates found
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onOpenJobDescription}
              className="h-9 rounded-md border-gray-300 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              title="Edit Job Description"
            >
              <Briefcase className="h-4 w-4" /> Job Description
            </Button>

            <Button
              variant="outline"
              onClick={onOpenAIJobEditor}
              className="h-9 rounded-md border-gray-300 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              title="AI Job Editor"
            >
              <Bot className="h-4 w-4" /> AI Job Editor
            </Button>

            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative h-9 w-9 rounded-md border-gray-300 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  title="Filter Candidates"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilters.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-medium text-white dark:bg-indigo-500">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0"
                align="end"
                sideOffset={5}
                forceMount
                style={{ zIndex: 9999 }}
              >
                <Filters
                  filterOptions={filterOptions}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  sortDirection={sortDirection}
                  setSortDirection={setSortDirection}
                  activeFilters={activeFilters}
                  clearFilters={clearFilters}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-md border-gray-300 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              title={
                viewMode === 'grid'
                  ? 'Switch to List View'
                  : 'Switch to Grid View'
              }
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <LayoutGrid className="h-4 w-4" />
              )}
            </Button>

            {isLoggedIn && (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-md border-gray-300 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                title="Logout"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-auto max-w-6xl">
          <div className="mt-4 max-w-6xl">
            <form onSubmit={handleSearchSubmit}>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchFocused={searchFocused}
                setSearchFocused={setSearchFocused}
                searchSuggestions={searchSuggestions}
                isProcessingQuery={isProcessingQuery}
                extractedPosition={extractedPosition}
                extractedLocation={extractedLocation}
                extractedCompensation={extractedCompensation}
                extractedSkills={extractedSkills}
                clearExtractedParameter={clearExtractedParameter}
                clearSearch={clearSearch}
                activeFilters={activeFilters}
                removeFilter={removeFilter}
                onKeyDown={onKeyDown}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
