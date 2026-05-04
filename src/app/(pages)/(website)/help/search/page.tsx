'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  ArrowLeft,
  Clock,
  Eye,
  Star,
  ChevronDown,
  BookOpen,
  FileText,
  Download,
  HelpCircle,
  Calendar,
  Building,
  Users,
  Brain,
  Settings,
  CreditCard,
  Globe,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'guide' | 'resource';
  readTime: string;
  views: number;
  rating: number;
  href: string;
  tags: string[];
  lastUpdated: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface FilterState {
  categories: string[];
  types: string[];
  difficulty: string[];
  sortBy: string;
}

const categories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: Lightbulb,
    color: 'text-emerald-600',
  },
  {
    id: 'for-clients',
    name: 'For Clients',
    icon: Building,
    color: 'text-blue-600',
  },
  {
    id: 'for-candidates',
    name: 'For Candidates',
    icon: Users,
    color: 'text-purple-600',
  },
  {
    id: 'ai-features',
    name: 'AI Features',
    icon: Brain,
    color: 'text-orange-600',
  },
  {
    id: 'account-settings',
    name: 'Account Settings',
    icon: Settings,
    color: 'text-gray-600',
  },
  {
    id: 'billing',
    name: 'Billing & Plans',
    icon: CreditCard,
    color: 'text-green-600',
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    icon: HelpCircle,
    color: 'text-red-600',
  },
  {
    id: 'api-docs',
    name: 'API Documentation',
    icon: Globe,
    color: 'text-indigo-600',
  },
];

const contentTypes = [
  { id: 'article', name: 'Articles', icon: FileText },
  { id: 'guide', name: 'Guides', icon: BookOpen },
  { id: 'resource', name: 'Resources', icon: Download },
];

const difficulties = [
  { id: 'beginner', name: 'Beginner', color: 'bg-green-100 text-green-800' },
  {
    id: 'intermediate',
    name: 'Intermediate',
    color: 'bg-yellow-100 text-yellow-800',
  },
  { id: 'advanced', name: 'Advanced', color: 'bg-red-100 text-red-800' },
];

const sortOptions = [
  { id: 'relevance', name: 'Relevance' },
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'popular', name: 'Most Popular' },
  { id: 'rating', name: 'Highest Rated' },
];

// Mock search results data
const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'How to Create Your First Job Posting',
    description:
      'Complete step-by-step guide to creating effective job postings that attract top candidates using our AI-powered platform.',
    category: 'for-clients',
    type: 'article',
    readTime: '5 min read',
    views: 2340,
    rating: 4.8,
    href: '/help/articles/create-job-posting',
    tags: ['job posting', 'clients', 'getting started'],
    lastUpdated: '2024-01-15',
    difficulty: 'beginner',
  },
  {
    id: '2',
    title: 'Getting Started with Teamcast',
    description:
      'Everything you need to know to get up and running with Teamcast, including account setup and basic features.',
    category: 'getting-started',
    type: 'guide',
    readTime: '8 min read',
    views: 1890,
    rating: 4.9,
    href: '/help/getting-started',
    tags: ['getting started', 'setup', 'basics'],
    lastUpdated: '2024-01-20',
    difficulty: 'beginner',
  },
  {
    id: '3',
    title: 'Understanding AI-Powered Matching',
    description:
      'Learn how our AI algorithms work to match candidates with the perfect job opportunities.',
    category: 'ai-features',
    type: 'article',
    readTime: '6 min read',
    views: 1650,
    rating: 4.7,
    href: '/help/ai-features',
    tags: ['AI', 'matching', 'algorithm'],
    lastUpdated: '2024-01-18',
    difficulty: 'intermediate',
  },
  {
    id: '4',
    title: 'Candidate Profile Optimization',
    description:
      'Tips and best practices for creating a compelling candidate profile that gets noticed by recruiters.',
    category: 'for-candidates',
    type: 'guide',
    readTime: '7 min read',
    views: 1420,
    rating: 4.6,
    href: '/help/for-candidates',
    tags: ['profile', 'optimization', 'candidates'],
    lastUpdated: '2024-01-12',
    difficulty: 'beginner',
  },
  {
    id: '5',
    title: 'Account Security Settings',
    description:
      'How to secure your account with two-factor authentication and other security best practices.',
    category: 'account-settings',
    type: 'article',
    readTime: '4 min read',
    views: 1200,
    rating: 4.5,
    href: '/help/account-settings',
    tags: ['security', 'account', 'settings'],
    lastUpdated: '2024-01-10',
    difficulty: 'intermediate',
  },
  {
    id: '6',
    title: 'Billing and Subscription Management',
    description:
      'Complete guide to managing your subscription, payment methods, and billing information.',
    category: 'billing',
    type: 'guide',
    readTime: '6 min read',
    views: 980,
    rating: 4.4,
    href: '/help/billing',
    tags: ['billing', 'subscription', 'payment'],
    lastUpdated: '2024-01-08',
    difficulty: 'beginner',
  },
  {
    id: '7',
    title: 'Troubleshooting Common Issues',
    description:
      'Solutions to the most common problems users encounter and how to resolve them quickly.',
    category: 'troubleshooting',
    type: 'article',
    readTime: '8 min read',
    views: 1850,
    rating: 4.3,
    href: '/help/troubleshooting',
    tags: ['troubleshooting', 'issues', 'solutions'],
    lastUpdated: '2024-01-14',
    difficulty: 'intermediate',
  },
  {
    id: '8',
    title: 'API Documentation Overview',
    description:
      'Technical documentation for developers looking to integrate with Teamcast APIs.',
    category: 'api-docs',
    type: 'resource',
    readTime: '12 min read',
    views: 756,
    rating: 4.7,
    href: '/help/api-documentation',
    tags: ['API', 'documentation', 'developers'],
    lastUpdated: '2024-01-16',
    difficulty: 'advanced',
  },
];

// SearchContent component that uses useSearchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterState>({
    categories: searchParams.get('categories')?.split(',') || [],
    types: [],
    difficulty: [],
    sortBy: 'relevance',
  });
  const [filteredResults, setFilteredResults] =
    useState<SearchResult[]>(mockResults);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    filterResults();
  }, [searchQuery, filters]);

  const filterResults = () => {
    let results = mockResults;

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          result.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      results = results.filter((result) =>
        filters.categories.includes(result.category)
      );
    }

    // Filter by types
    if (filters.types.length > 0) {
      results = results.filter((result) => filters.types.includes(result.type));
    }

    // Filter by difficulty
    if (filters.difficulty.length > 0) {
      results = results.filter((result) =>
        filters.difficulty.includes(result.difficulty)
      );
    }

    // Sort results
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        case 'oldest':
          return (
            new Date(a.lastUpdated).getTime() -
            new Date(b.lastUpdated).getTime()
          );
        case 'popular':
          return b.views - a.views;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredResults(results);
  };

  const handleFilterChange = (type: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (type === 'sortBy') {
        newFilters[type] = value;
      } else {
        const currentValues = newFilters[type] as string[];
        if (currentValues.includes(value)) {
          newFilters[type] = currentValues.filter((v) => v !== value);
        } else {
          newFilters[type] = [...currentValues, value];
        }
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      types: [],
      difficulty: [],
      sortBy: 'relevance',
    });
  };

  const getActiveFilterCount = () => {
    return (
      filters.categories.length +
      filters.types.length +
      filters.difficulty.length
    );
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const getDifficultyColor = (difficulty: string) => {
    return (
      difficulties.find((d) => d.id === difficulty)?.color ||
      'bg-gray-100 text-gray-800'
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/help" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Help
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              <Badge variant="outline">Search Results</Badge>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                Search Results
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {filteredResults.length} results found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFilterCount()}
                  </Badge>
                )}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
              <Input
                placeholder="Search help articles, guides, and resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filters</CardTitle>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Categories Filter */}
                    <div>
                      <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
                        Categories
                      </h3>
                      <div className="space-y-2">
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
                              className="flex items-center gap-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              <category.icon
                                className={`h-4 w-4 ${category.color}`}
                              />
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content Types Filter */}
                    <div>
                      <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
                        Content Type
                      </h3>
                      <div className="space-y-2">
                        {contentTypes.map((type) => (
                          <div
                            key={type.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={type.id}
                              checked={filters.types.includes(type.id)}
                              onCheckedChange={() =>
                                handleFilterChange('types', type.id)
                              }
                            />
                            <label
                              htmlFor={type.id}
                              className="flex items-center gap-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              <type.icon className="h-4 w-4 text-slate-600" />
                              {type.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                      <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
                        Difficulty
                      </h3>
                      <div className="space-y-2">
                        {difficulties.map((difficulty) => (
                          <div
                            key={difficulty.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={difficulty.id}
                              checked={filters.difficulty.includes(
                                difficulty.id
                              )}
                              onCheckedChange={() =>
                                handleFilterChange('difficulty', difficulty.id)
                              }
                            />
                            <label
                              htmlFor={difficulty.id}
                              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {difficulty.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
                        Sort By
                      </h3>
                      <Select
                        value={filters.sortBy}
                        onValueChange={(value) =>
                          handleFilterChange('sortBy', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          <div className="space-y-6">
            {filteredResults.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center"
              >
                <Search className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  No results found
                </h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Try adjusting your search terms or filters to find what
                  you&apos;re looking for.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((result, index) => {
                  const categoryInfo = getCategoryInfo(result.category);
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group border-l-4 border-l-transparent transition-all duration-200 hover:border-l-blue-500 hover:shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="mb-3 flex items-center gap-3">
                                {categoryInfo && (
                                  <div className="flex items-center gap-2">
                                    <categoryInfo.icon
                                      className={`h-4 w-4 ${categoryInfo.color}`}
                                    />
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {categoryInfo.name}
                                    </Badge>
                                  </div>
                                )}
                                <Badge
                                  className={getDifficultyColor(
                                    result.difficulty
                                  )}
                                >
                                  {result.difficulty}
                                </Badge>
                              </div>
                              <Link
                                href={result.href}
                                className="transition-colors group-hover:text-blue-600"
                              >
                                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
                                  {result.title}
                                </h3>
                              </Link>
                              <p className="mb-4 line-clamp-2 text-slate-600 dark:text-slate-300">
                                {result.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {result.readTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {result.views.toLocaleString()} views
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  {result.rating}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(
                                    result.lastUpdated
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={result.href}
                                className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                Read More
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function SearchLoading() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/help" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Help
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              <Badge variant="outline">Search Results</Badge>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                Search Results
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Loading search results...
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
              <Input
                placeholder="Search help articles, guides, and resources..."
                disabled
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="mb-4 h-3 w-full rounded bg-gray-200"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded bg-gray-200"></div>
                    <div className="h-6 w-20 rounded bg-gray-200"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
