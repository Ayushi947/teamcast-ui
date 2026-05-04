'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Search, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'end-of-results';
  jobCount?: number;
  onClearFilters: () => void;
}

export const EmptyState = ({
  type,
  jobCount = 0,
  onClearFilters,
}: EmptyStateProps) => {
  if (type === 'no-results') {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-gray-100/50 bg-gradient-to-br from-white via-gray-50/50 to-white p-12 text-center shadow-xl backdrop-blur-sm dark:border-gray-800/50 dark:from-gray-900/90 dark:via-gray-800/50 dark:to-gray-900/90">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg dark:from-indigo-900/30 dark:to-purple-900/30">
          <Search className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        </div>

        <h3 className="mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300">
          No Results Found
        </h3>

        <p className="mb-8 max-w-md text-base leading-relaxed text-gray-600 dark:text-gray-300">
          Try adjusting your search criteria or explore different keywords to
          discover more opportunities that match your skills.
        </p>

        <div>
          <Button
            variant="outline"
            className="group relative overflow-hidden rounded-xl border-2 border-indigo-200 bg-white px-8 py-3 text-indigo-600 shadow-md transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-lg dark:border-indigo-700 dark:bg-gray-800 dark:text-indigo-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20"
            onClick={onClearFilters}
          >
            <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
            Clear Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-16 flex flex-col items-center justify-center rounded-2xl border border-gray-100/50 bg-gradient-to-br from-white via-emerald-50/30 to-white p-12 text-center shadow-xl backdrop-blur-sm dark:border-gray-800/50 dark:from-gray-900/90 dark:via-emerald-900/20 dark:to-gray-900/90">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg dark:from-emerald-900/30 dark:to-teal-900/30">
        <CheckCircle className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
      </div>

      <h3 className="mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300">
        You&apos;ve reached the end
      </h3>

      <p className="mb-8 max-w-md text-base leading-relaxed text-gray-600 dark:text-gray-300">
        We&apos;ve shown all{' '}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {jobCount}
        </span>{' '}
        jobs that match your criteria.
        <br />
        Didn&apos;t find what you&apos;re looking for?
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          variant="outline"
          className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-8 py-3 text-gray-700 shadow-md transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
          onClick={onClearFilters}
        >
          <Search className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
          Clear Search
        </Button>

        <Button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-white shadow-md transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600">
          <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
          Contact Us
        </Button>
      </div>
    </div>
  );
};
