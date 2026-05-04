import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Link, Users } from 'lucide-react';

export const PublicProfileNotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-14 md:pt-20 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-16">
        <Card className="bg-white p-12 text-center dark:bg-gray-800">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Profile Not Found
          </h1>

          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            The profile you&apos;re looking for is not available or has been set
            to private.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700/50">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Why might this happen?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                  <span>The candidate has set their profile to private</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                  <span>The profile is not fully completed yet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                  <span>The URL may be incorrect or outdated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                  <span>
                    The candidate may have deactivated their public profile
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                  <span>
                    The public profile API endpoint may not be available yet
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <h3 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                For Testing & Development
              </h3>
              <p className="mb-3 text-sm text-blue-700 dark:text-blue-300">
                Try these test URLs to see the public profile in action:
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <Link
                    href="/candidate/profile/1"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    /candidate/profile/1
                  </Link>
                  <span className="text-blue-600 dark:text-blue-400">
                    {' '}
                    - Test profile with mock data
                  </span>
                </div>
                <div>
                  <Link
                    href="/candidate/profile/demo"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    /candidate/profile/demo
                  </Link>
                  <span className="text-blue-600 dark:text-blue-400">
                    {' '}
                    - Full demo with complete data
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>

              <Button
                variant="default"
                asChild
                className="flex items-center gap-2"
              >
                <Link href="/candidate/profile/demo">
                  <Users className="h-4 w-4" />
                  View Demo Profile
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Looking to create your own public profile?{' '}
              <a
                href="/auth/signup"
                className="text-primary hover:text-primary/80 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Teamcast
              </a>{' '}
              and showcase your professional expertise.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
