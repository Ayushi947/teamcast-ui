'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Grid,
  LayoutDashboard,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Filters } from './filters';
import { FilterState } from './filters';

interface HeaderControlsProps {
  activeFilters: string[];
  selectedFilters: FilterState;
  setSelectedFilters: (filters: FilterState) => void;
  sortBy: 'matchScore' | 'salary';
  sortDirection: 'asc' | 'desc';
  toggleSort: (field: 'matchScore' | 'salary') => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  jobCount: number;
  onGoBack: () => void;
  onGoToDashboard: () => void;
}

export const HeaderControls = ({
  activeFilters,
  selectedFilters,
  setSelectedFilters,
  sortBy,
  sortDirection,
  toggleSort,
  viewMode,
  setViewMode,
  jobCount,
  onGoBack,
  onGoToDashboard,
}: HeaderControlsProps) => {
  const getSortIcon = (field: 'matchScore' | 'salary') => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <>
      {/* Header Section */}
      <div className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="mx-auto py-4 sm:px-2 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onGoBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-foreground text-xl font-semibold">
                Find Your Dream Job
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToDashboard}
                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Filters
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                activeFilters={activeFilters}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls and View Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Sort by:</span>
          <div className="border-border bg-background flex items-center gap-1 rounded-lg border p-1">
            <button
              onClick={() => toggleSort('matchScore')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                sortBy === 'matchScore'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Match Score
              {getSortIcon('matchScore')}
            </button>
            <button
              onClick={() => toggleSort('salary')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                sortBy === 'salary'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Salary
              {getSortIcon('salary')}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-muted-foreground text-sm">
            {jobCount} jobs found
          </div>
          <div className="border-border bg-background flex items-center gap-1 rounded-lg border p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-md',
                viewMode === 'grid'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-md',
                viewMode === 'list'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
