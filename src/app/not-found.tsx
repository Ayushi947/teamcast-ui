'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { TeamcastLogo } from '@/components/icons';

// Fun messages related to hiring and interviews
const funnyMessages = [
  {
    title: '404: Position Not Found',
    message:
      "This page didn't pass the technical interview. It couldn't handle the 'fizzbuzz' test!",
    emoji: '🤔',
  },
  {
    title: '404: Candidate Ghosted',
    message:
      "Looks like this page pulled a classic move - it didn't show up for the interview!",
    emoji: '👻',
  },
  {
    title: '404: Cultural Misfit',
    message:
      "This page wasn't a culture fit - it kept using spaces instead of tabs!",
    emoji: '😅',
  },
  {
    title: '404: Experience Required',
    message:
      "Sorry, this page needs 10 years of experience in a framework that's only 2 years old!",
    emoji: '⏰',
  },
  {
    title: '404: Salary Expectations',
    message:
      "This page's salary expectations were way above our budget - it wanted infinite bandwidth!",
    emoji: '💸',
  },
  {
    title: '404: Work-Life Balance',
    message:
      'This page refused to work weekends - said something about having a life?',
    emoji: '⚖️',
  },
  {
    title: '404: Remote Work Issue',
    message:
      "This page's internet connection dropped during the virtual interview!",
    emoji: '🌐',
  },
  {
    title: '404: AI Confusion',
    message:
      'Our AI recruiter got confused - it tried to hire a 404 error as a senior developer!',
    emoji: '🤖',
  },
  {
    title: '404: Skill Mismatch',
    message:
      "This page listed 'HTML' as a programming language on its resume...",
    emoji: '📝',
  },
  {
    title: '404: Benefits Package',
    message:
      "Page declined our offer - said our unlimited PTO policy didn't include time travel!",
    emoji: '🎁',
  },
];

export default function NotFound() {
  const router = useRouter();
  const [randomMessage, setRandomMessage] = useState(funnyMessages[0]); // Start with first message for SSR
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set random message after component mounts
    const randomIndex = Math.floor(Math.random() * funnyMessages.length);
    setRandomMessage(funnyMessages[randomIndex]);
  }, []);

  // Show initial message during SSR and first render
  if (!mounted) {
    return null;
  }

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
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="text-primary text-9xl font-bold">404</div>
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute -top-6 -right-8"
          >
            <Search className="text-muted-foreground h-12 w-12" />
          </motion.div>
        </motion.div>

        {/* Fun Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 space-y-4"
        >
          <h1 className="flex items-center justify-center gap-2 text-4xl font-bold tracking-tight">
            {randomMessage.title} {randomMessage.emoji}
          </h1>
          <p className="text-muted-foreground text-lg">
            {randomMessage.message}
          </p>
          <p className="text-primary text-xl font-medium">
            Meanwhile, why not explore our talent pool? 🎯
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
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
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
                💡 Pro Tip: Keep refreshing for more tech recruiting humor! Each
                visit is like a new interview round.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
