'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RefreshCcw, Home, Wrench } from 'lucide-react';
import Link from 'next/link';
import { TeamcastLogo } from '@/components/icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {/* Branding */}
      <motion.div
        initial={{ y: -20, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-8 left-8"
      >
        <Link href="/">
          <TeamcastLogo />
        </Link>
      </motion.div>

      {/* Gradient Background */}
      <div className="bg-grid-white/10 bg-grid-small absolute inset-0" />
      <div className="from-background via-background/90 to-background/80 absolute inset-0 bg-gradient-to-tr" />

      <div className="relative container flex max-w-2xl flex-col items-center text-center">
        {/* Animated 500 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="text-primary text-9xl font-bold">500</div>
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-6 -right-8"
          >
            <Wrench className="text-muted-foreground h-12 w-12" />
          </motion.div>
        </motion.div>

        {/* Fun Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Oops! Something Went Wrong
          </h1>
          <p className="text-muted-foreground text-lg">
            Our AI recruiter is having a coffee break! We&apos;ve dispatched our
            best tech talent to fix this issue.
          </p>
          <p className="text-primary text-xl font-medium">
            Don&apos;t worry, even the best systems need a reboot sometimes! 🔄
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 flex flex-col gap-4 sm:flex-row"
        >
          <Button
            variant="default"
            size="lg"
            onClick={() => reset()}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </motion.div>

        {/* Fun Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12"
        >
          <div className="relative">
            <div className="bg-primary/10 absolute -top-4 -left-4 h-24 w-24 rounded-full" />
            <div className="bg-primary/5 absolute -right-4 -bottom-4 h-32 w-32 rounded-full" />
            <div className="bg-card relative z-10 rounded-lg border p-8 shadow-sm">
              <p className="text-card-foreground text-sm">
                🛠️ Tech Humor: This error is like a code review - unexpected but
                helps us build something better!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 w-full"
          >
            <div className="bg-card/50 rounded-lg border p-4">
              <p className="text-destructive font-mono text-sm">
                {error.message || error.toString()}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
