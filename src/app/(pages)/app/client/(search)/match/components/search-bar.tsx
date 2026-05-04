import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface SearchBarProps {
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
  activeFilters: string[];
  removeFilter: (filter: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchBar = ({
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
  activeFilters,
  removeFilter,
  onKeyDown,
}: SearchBarProps) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const [typeaheadSuggestion, setTypeaheadSuggestion] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>(searchQuery);

  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 1000),
    [setSearchQuery]
  );

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  const handleSearchChange = (value: string) => {
    setInputValue(value);

    debouncedSetSearchQuery(value);

    if (value.trim().length > 0 && searchSuggestions.length > 0) {
      const closestMatch = searchSuggestions.find((suggestion) =>
        suggestion.toLowerCase().startsWith(value.toLowerCase())
      );
      setTypeaheadSuggestion(closestMatch || '');
    } else {
      setTypeaheadSuggestion('');
    }
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }

    if (e.key === 'Tab' && typeaheadSuggestion) {
      e.preventDefault();
      setInputValue(typeaheadSuggestion);
      debouncedSetSearchQuery(typeaheadSuggestion);
      // Position cursor at the end
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = typeaheadSuggestion.length;
          inputRef.current.selectionEnd = typeaheadSuggestion.length;
        }
      }, 0);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate through suggestions
      const direction = e.key === 'ArrowDown' ? 1 : -1;

      // Find suggestions that start with the current input value
      const matchingSuggestions = searchSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().startsWith(inputValue.toLowerCase())
      );

      if (matchingSuggestions.length > 0) {
        // Find current index or start at -1
        let currentIndex = matchingSuggestions.findIndex(
          (s) => s === typeaheadSuggestion
        );
        if (currentIndex === -1)
          currentIndex = direction > 0 ? -1 : matchingSuggestions.length;

        // Calculate next index
        const nextIndex =
          (currentIndex + direction + matchingSuggestions.length) %
          matchingSuggestions.length;
        setTypeaheadSuggestion(matchingSuggestions[nextIndex] || '');
      }
    } else if (
      e.key === 'Enter' &&
      typeaheadSuggestion &&
      inputValue.length > 0
    ) {
      if (typeaheadSuggestion !== inputValue) {
        e.preventDefault(); // Prevent form submission
        setInputValue(typeaheadSuggestion);
        debouncedSetSearchQuery.flush();
        setSearchQuery(typeaheadSuggestion);

        // Now let the parent's onKeyDown handle the submission on the next render
        setTimeout(() => {
          if (onKeyDown && inputRef.current) {
            const enterEvent = new KeyboardEvent('keydown', {
              key: 'Enter',
            }) as any;
            onKeyDown(enterEvent);
          }
        }, 0);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchFocused(false);
      setTypeaheadSuggestion('');
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSearchFocused]);

  const _highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={i}
          className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      {/* Active Search Indicator & Filters */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {/* Remove the redundant "Searching for:" chip */}
        {searchQuery &&
          !extractedPosition &&
          !extractedLocation &&
          !extractedCompensation &&
          extractedSkills.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              <span>Query:</span>
              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300">
                {searchQuery}
              </Badge>
              <button onClick={clearSearch}>
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}

        {/* Processing indicator */}
        {isProcessingQuery && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Analyzing search...</span>
          </motion.div>
        )}

        {/* Extracted Natural Language Parameters */}
        {(extractedPosition || extractedLocation || extractedCompensation) && (
          <div className="flex flex-wrap gap-2">
            {extractedPosition && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300"
              >
                <span className="text-xs font-medium">Position:</span>
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300"
                >
                  {extractedPosition}
                  <button
                    className="ml-1 rounded-full"
                    onClick={() => clearExtractedParameter('position')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            )}

            {extractedLocation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <span className="text-xs font-medium">Location:</span>
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  {extractedLocation}
                  <button
                    className="ml-1 rounded-full"
                    onClick={() => clearExtractedParameter('location')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            )}

            {extractedCompensation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              >
                <span className="text-xs font-medium">Salary:</span>
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                >
                  {extractedCompensation}
                  <button
                    className="ml-1 rounded-full"
                    onClick={() => clearExtractedParameter('compensation')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            )}

            {/* Extracted Skills */}
            {extractedSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1.5 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              >
                <span className="text-xs font-medium">Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {extractedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                    >
                      {skill}
                      <button
                        className="ml-1 rounded-full"
                        onClick={() => clearExtractedParameter('skill', skill)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <motion.div
                key={filter}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                >
                  {filter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar with Typeahead */}
      <div
        ref={searchRef}
        className={`relative ${searchFocused ? 'z-50' : ''}`}
      >
        <div className="relative h-12">
          {/* Background input that shows the full suggestion */}
          <input
            type="text"
            className="border-input absolute inset-0 h-full w-full rounded-md border bg-white px-3 py-2 dark:bg-gray-900"
            style={{ color: 'transparent' }}
            value={
              typeaheadSuggestion && searchFocused && inputValue
                ? typeaheadSuggestion
                : ''
            }
            readOnly
          />

          {/* Show suggestion text */}
          {typeaheadSuggestion &&
            searchFocused &&
            inputValue &&
            typeaheadSuggestion !== inputValue && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3">
                <span className="invisible">{inputValue}</span>
                <span className="text-gray-400 dark:text-gray-500">
                  {typeaheadSuggestion.slice(inputValue.length)}
                </span>
              </div>
            )}

          {/* Foreground input that the user interacts with */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for 'Frontend engineer in New York within range of 40k to 50k'"
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyDown}
            className="border-input absolute inset-0 h-full w-full rounded-md border bg-transparent px-3 py-2 text-gray-900 dark:text-white"
          />

          {inputValue && (
            <button
              onClick={() => {
                setInputValue('');
                debouncedSetSearchQuery.cancel();
                clearSearch();
              }}
              className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
