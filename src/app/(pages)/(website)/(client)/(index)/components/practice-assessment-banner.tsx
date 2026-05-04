'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ArrowRight, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function PracticeAssessmentBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-4 bottom-24 z-50 sm:right-6"
        >
          {/* Connector line to chat widget below */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="absolute right-6 -bottom-4 h-4 w-px origin-top bg-gradient-to-b from-purple-400/40 to-transparent"
          />

          <Link href="/candidate" className="group block">
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#6e55cf] to-[#4f3d99] shadow-lg shadow-purple-500/15 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 dark:border-purple-400/10">
              {/* Subtle shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: 'easeInOut',
                }}
              />

              <div className="relative flex items-center gap-3 px-4 py-3 sm:gap-3.5 sm:px-5 sm:py-3.5">
                {/* Icon with pulse indicator */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <BrainCircuit className="h-5 w-5 text-white" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#6e55cf]" />
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 pr-5">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-white">
                      AI Practice Interview
                    </p>
                    <Sparkles className="h-3 w-3 shrink-0 text-amber-300" />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-purple-200/80">
                    Free mock assessment
                    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </p>
                </div>
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDismissed(true);
                }}
                className="absolute top-1.5 right-1.5 rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
