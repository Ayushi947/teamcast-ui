'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ActionBarProps {
  selectedJobs: string[];
  onClearSelection: () => void;
  onApply: () => void;
  isLoggedIn?: boolean;
}

export const ActionBar = ({
  selectedJobs,
  onClearSelection,
  onApply,
  isLoggedIn = false,
}: ActionBarProps) => {
  const router = useRouter();
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  if (selectedJobs.length === 0) return null;

  const handleApply = () => {
    if (isLoggedIn) {
      onApply();
    } else {
      setShowSignupDialog(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 bottom-0 left-0 z-[60] border-t border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {selectedJobs.length} jobs selected
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClearSelection}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear Selection
            </Button>
            <Button
              onClick={handleApply}
              className="bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/20 text-white"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Modernized Signup Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogTitle></DialogTitle>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-7 text-white">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/20 p-2">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              Unlock Full Access
            </h3>
            <p className="mt-2 text-sm font-medium text-white/90">
              Apply to {selectedJobs.length} selected jobs instantly and track
              your applications
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6 rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
              <h4 className="mb-3 font-medium text-indigo-900 dark:text-indigo-300">
                You&apos;ll get:
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary flex h-6 w-6 items-center justify-center rounded-full">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    1-click apply to multiple jobs
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary flex h-6 w-6 items-center justify-center rounded-full">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Application tracking dashboard
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary flex h-6 w-6 items-center justify-center rounded-full">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Personalized job recommendations
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() =>
                  router.push('/app/auth/login?user_type=candidate')
                }
                className="bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/20 flex w-full items-center justify-center gap-2 text-white"
              >
                <UserPlus className="h-4 w-4" />
                <span>Signup with Email</span>
              </Button>

              <div className="relative flex items-center gap-2 py-2">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  OR CONTINUE WITH
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/linkedin')}
                  className="flex items-center justify-center gap-2 border-gray-200 bg-white py-5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-[#0A66C2]"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-sm">LinkedIn</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/github')}
                  className="flex items-center justify-center gap-2 border-gray-200 bg-white py-5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Github className="h-5 w-5" />
                  <span className="text-sm">GitHub</span>
                </Button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                </span>
                <button
                  onClick={() =>
                    router.push('/app/auth/login?user_type=candidate')
                  }
                  className="text-primary hover:text-primary/90 dark:text-primary/10 dark:hover:text-primary/20 text-xs font-medium"
                >
                  Log in
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
