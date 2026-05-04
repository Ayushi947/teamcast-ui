import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, List, Grid3X3 } from 'lucide-react';

interface SearchFilterSectionProps {
  searchQuery: string;
  onSearchInputSubmit: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  searchQuery,
  onSearchInputSubmit,
  viewMode,
  onViewModeChange,
}) => {
  const [inputValue, setInputValue] = React.useState(searchQuery);

  React.useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchInputSubmit(inputValue);
    }
  };

  return (
    <div className="dark:border-primary/10 dark:bg-primary/10 rounded-xl border-b border-gray-200 bg-white p-4 shadow-xl sm:p-5">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Center - Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-white" />
            <Input
              type="text"
              placeholder="Search job, companies or skills..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="focus:border-primary focus:ring-primary dark:border-primary/10 dark:bg-primary/10 h-12 w-full border-gray-200 bg-white pr-4 pl-10 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Bottom row on mobile, right side on desktop - View toggle */}
        <div className="w-full flex-shrink-0 sm:w-auto">
          <div className="dark:border-primary/10 dark:bg-primary/10 flex h-12 w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`flex flex-1 items-center justify-center gap-2 sm:flex-none ${
                viewMode === 'list'
                  ? 'bg-primary dark:bg-primary/10 text-white shadow-sm'
                  : 'hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-600/50'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List view</span>
              <span className="sm:hidden">List</span>
            </Button>

            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={`flex flex-1 items-center justify-center gap-2 sm:flex-none ${
                viewMode === 'grid'
                  ? 'bg-primary dark:bg-primary/10 text-white shadow-sm'
                  : 'hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-600/50'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Grid view</span>
              <span className="sm:hidden">Grid</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
