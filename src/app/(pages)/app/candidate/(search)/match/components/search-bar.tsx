'use client';

import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  suggestions: string[];
  debounceTime?: number;
}

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  suggestions,
  debounceTime = 300,
}: SearchBarProps) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(searchQuery);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value);
    }, debounceTime);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchFocus = () => {
    setSearchFocused(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onSearchChange(suggestion);
    setSearchFocused(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        if (
          selectedSuggestionIndex >= 0 &&
          suggestions[selectedSuggestionIndex]
        ) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSearchFocused(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-primary text-primary">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <Command className="border-border bg-background focus-within:border-primary focus-within:ring-primary w-full rounded-xl border shadow-sm transition-all duration-200 focus-within:ring-1">
        <div className="border-border border-b px-4">
          <CommandInput
            placeholder="Search by job title, company, or skills..."
            value={inputValue}
            onValueChange={handleInputChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyDown}
            className="placeholder:text-muted-foreground flex h-12 w-full rounded-md bg-transparent py-3 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <AnimatePresence>
          {searchFocused && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <CommandList className="w-full">
                <CommandGroup heading="Suggestions">
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={suggestion}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                      className={cn(
                        'hover:bg-muted cursor-pointer px-4 py-2',
                        index === selectedSuggestionIndex && 'bg-muted'
                      )}
                    >
                      {highlightMatch(suggestion, inputValue)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </motion.div>
          )}
        </AnimatePresence>
      </Command>
    </div>
  );
};
