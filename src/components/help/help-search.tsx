'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Clock,
  TrendingUp,
  BookOpen,
  Users,
  Settings,
  Brain,
  CreditCard,
  Building,
  HelpCircle,
  Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  readTime: string;
  popularity: number;
  url: string;
}

export interface SearchFilters {
  categories: string[];
  readTime: string[];
  popularity: number;
  tags: string[];
}

interface HelpSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  suggestions?: SearchResult[];
  recentSearches?: string[];
  popularSearches?: string[];
  className?: string;
}

const categories = [
  { id: 'getting-started', name: 'Getting Started', icon: BookOpen },
  { id: 'for-clients', name: 'For Clients', icon: Building },
  { id: 'for-candidates', name: 'For Candidates', icon: Users },
  { id: 'ai-features', name: 'AI Features', icon: Brain },
  { id: 'account-settings', name: 'Account & Settings', icon: Settings },
  { id: 'billing', name: 'Billing & Subscriptions', icon: CreditCard },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: HelpCircle },
];

const readTimeOptions = [
  { id: 'quick', name: 'Quick (1-3 min)', value: '1-3' },
  { id: 'medium', name: 'Medium (4-8 min)', value: '4-8' },
  { id: 'detailed', name: 'Detailed (9+ min)', value: '9+' },
];

const popularTags = [
  'profile setup',
  'job posting',
  'AI matching',
  'interviews',
  'billing',
  'troubleshooting',
  'integrations',
  'notifications',
  'settings',
  'security',
];

export const HelpSearch: React.FC<HelpSearchProps> = ({
  onSearch,
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    readTime: [],
    popularity: 0,
    tags: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Calculate active filters count
  useEffect(() => {
    const count =
      filters.categories.length +
      filters.readTime.length +
      filters.tags.length +
      (filters.popularity > 0 ? 1 : 0);
    setActiveFilters(count);
  }, [filters]);

  // Filter suggestions based on query
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    return suggestions.filter(
      (suggestion) =>
        suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.tags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    );
  }, [query, suggestions]);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, filters);
      setShowSuggestions(false);
    }
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters };

    if (
      filterType === 'categories' ||
      filterType === 'readTime' ||
      filterType === 'tags'
    ) {
      const currentArray = newFilters[filterType] as string[];
      if (currentArray.includes(value)) {
        newFilters[filterType] = currentArray.filter((item) => item !== value);
      } else {
        newFilters[filterType] = [...currentArray, value];
      }
    } else {
      newFilters[filterType] = value;
    }

    setFilters(newFilters);
    handleSearch();
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      readTime: [],
      popularity: 0,
      tags: [],
    });
    handleSearch();
  };

  const clearFilter = (filterType: keyof SearchFilters, value?: string) => {
    const newFilters = { ...filters };

    if (
      value &&
      (filterType === 'categories' ||
        filterType === 'readTime' ||
        filterType === 'tags')
    ) {
      const currentArray = newFilters[filterType] as string[];
      newFilters[filterType] = currentArray.filter((item) => item !== value);
    } else if (filterType === 'popularity') {
      newFilters[filterType] = 0;
    }

    setFilters(newFilters);
    handleSearch();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search help articles, guides, and FAQs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => setShowSuggestions(true)}
          className="h-12 pr-20 pl-10 text-base"
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Filter className="h-4 w-4" />
                {activeFilters > 0 && (
                  <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilters > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Categories</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category.id}
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={() =>
                            handleFilterChange('categories', category.id)
                          }
                        />
                        <label
                          htmlFor={category.id}
                          className="flex cursor-pointer items-center gap-1 text-sm"
                        >
                          <category.icon className="h-3 w-3" />
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Read Time */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Read Time</h5>
                  <div className="space-y-2">
                    {readTimeOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={option.id}
                          checked={filters.readTime.includes(option.value)}
                          onCheckedChange={() =>
                            handleFilterChange('readTime', option.value)
                          }
                        />
                        <label
                          htmlFor={option.id}
                          className="cursor-pointer text-sm"
                        >
                          {option.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Topics</h5>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          filters.tags.includes(tag) ? 'default' : 'outline'
                        }
                        className="cursor-pointer text-xs"
                        onClick={() => handleFilterChange('tags', tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={() => handleSearch()} size="sm">
            Search
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFilters > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {filters.categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {categories.find((c) => c.id === category)?.name}
                <X
                  className="hover:text-destructive h-3 w-3 cursor-pointer"
                  onClick={() => clearFilter('categories', category)}
                />
              </Badge>
            ))}
            {filters.readTime.map((time) => (
              <Badge
                key={time}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {readTimeOptions.find((r) => r.value === time)?.name}
                <X
                  className="hover:text-destructive h-3 w-3 cursor-pointer"
                  onClick={() => clearFilter('readTime', time)}
                />
              </Badge>
            ))}
            {filters.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <X
                  className="hover:text-destructive h-3 w-3 cursor-pointer"
                  onClick={() => clearFilter('tags', tag)}
                />
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions &&
          (query.length > 0 ||
            recentSearches.length > 0 ||
            popularSearches.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 left-0 z-50 mt-1"
            >
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  {/* Search Results */}
                  {filteredSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-muted-foreground text-sm font-medium">
                        Search Results
                      </h4>
                      {filteredSuggestions.slice(0, 5).map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="hover:bg-muted flex cursor-pointer items-start gap-3 rounded-md p-2"
                          onClick={() => {
                            setQuery(suggestion.title);
                            handleSearch(suggestion.title);
                          }}
                        >
                          <BookOpen className="text-muted-foreground mt-0.5 h-4 w-4" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {suggestion.title}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">
                              {suggestion.description}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              <span className="text-muted-foreground text-xs">
                                {suggestion.readTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {query.length === 0 && recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        Recent Searches
                      </h4>
                      {recentSearches.slice(0, 3).map((search, index) => (
                        <div
                          key={index}
                          className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md p-2"
                          onClick={() => {
                            setQuery(search);
                            handleSearch(search);
                          }}
                        >
                          <Search className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">{search}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Popular Searches */}
                  {query.length === 0 && popularSearches.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                        <TrendingUp className="h-4 w-4" />
                        Popular Searches
                      </h4>
                      {popularSearches.slice(0, 3).map((search, index) => (
                        <div
                          key={index}
                          className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md p-2"
                          onClick={() => {
                            setQuery(search);
                            handleSearch(search);
                          }}
                        >
                          <Star className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">{search}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Backdrop */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};
