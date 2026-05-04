import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

// Selected filters type
interface SelectedFilters {
  showViewedProfiles: boolean;
  matchScoreCutoff: number;
  experience?: string;
  skills?: string[];
  education?: string;
}

interface FiltersProps {
  filterOptions?: any;
  selectedFilters: SelectedFilters;
  setSelectedFilters: React.Dispatch<React.SetStateAction<SelectedFilters>>;
  sortBy: 'matchScore' | 'experience';
  setSortBy: React.Dispatch<React.SetStateAction<'matchScore' | 'experience'>>;
  sortDirection: 'asc' | 'desc';
  setSortDirection: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  activeFilters: string[];
  clearFilters: () => void;
  id?: string;
}

export const Filters = ({
  selectedFilters,
  setSelectedFilters,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  activeFilters,
  clearFilters,
}: FiltersProps) => {
  const [_filterOpen, _setFilterOpen] = useState(false);

  return (
    <div
      className="h-full w-full rounded-lg bg-white dark:border-gray-800 dark:bg-gray-900"
      style={{ minHeight: '450px' }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">Filters & Sorting</h3>
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-sm text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      <Separator />
      <ScrollArea className="h-[450px]">
        <div className="space-y-6 p-5">
          {/* Sort Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort Results
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  'flex cursor-pointer items-center rounded-lg border p-3 transition-colors',
                  sortBy === 'experience' && sortDirection === 'desc'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                )}
                onClick={() => {
                  setSortBy('experience');
                  setSortDirection('desc');
                }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Experience</span>
                  <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Most First
                  </span>
                </div>
                {sortBy === 'experience' && sortDirection === 'desc' && (
                  <CheckCircle className="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div
                className={cn(
                  'flex cursor-pointer items-center rounded-lg border p-3 transition-colors',
                  sortBy === 'experience' && sortDirection === 'asc'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                )}
                onClick={() => {
                  setSortBy('experience');
                  setSortDirection('asc');
                }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Experience</span>
                  <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Least First
                  </span>
                </div>
                {sortBy === 'experience' && sortDirection === 'asc' && (
                  <CheckCircle className="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div
                className={cn(
                  'flex cursor-pointer items-center rounded-lg border p-3 transition-colors',
                  sortBy === 'matchScore' && sortDirection === 'desc'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                )}
                onClick={() => {
                  setSortBy('matchScore');
                  setSortDirection('desc');
                }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Best Match</span>
                  <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    High to Low
                  </span>
                </div>
                {sortBy === 'matchScore' && sortDirection === 'desc' && (
                  <CheckCircle className="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div
                className={cn(
                  'flex cursor-pointer items-center rounded-lg border p-3 transition-colors',
                  sortBy === 'matchScore' && sortDirection === 'asc'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                )}
                onClick={() => {
                  setSortBy('matchScore');
                  setSortDirection('asc');
                }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Best Match</span>
                  <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Low to High
                  </span>
                </div>
                {sortBy === 'matchScore' && sortDirection === 'asc' && (
                  <CheckCircle className="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Show Viewed Profiles Filter */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showViewedProfiles"
                checked={selectedFilters.showViewedProfiles}
                onCheckedChange={(checked) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    showViewedProfiles: checked === true,
                  }))
                }
              />
              <label
                htmlFor="showViewedProfiles"
                className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Show viewed profiles
              </label>
            </div>
          </div>

          <Separator />

          {/* Match Score Cutoff */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Match score cut-off
              </label>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                {selectedFilters.matchScoreCutoff}%
              </span>
            </div>
            <Slider
              value={[selectedFilters.matchScoreCutoff]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  matchScoreCutoff: value[0],
                }))
              }
              className="py-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Button
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          onClick={() => _setFilterOpen(false)}
        >
          Apply Filters & Sort
        </Button>
      </div>
    </div>
  );
};
