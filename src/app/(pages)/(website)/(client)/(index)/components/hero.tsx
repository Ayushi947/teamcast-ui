'use client';

import { Button } from '@/components/ui/button';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const router = useRouter();

  const handleRouteSignup = () => router.push('/app/client/signup');
  // const handleRouteAIInterviewer = () => router.push('/demo');
  const handleRouteDemo = () =>
    window.open(
      'https://meetings-na2.hubspot.com/meetings/teamcast-ai/book-a-demo',
      '_blank'
    );

  const titleComponent = (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI-Powered Hiring Platform
        <span className="bg-primary rounded-full px-2 py-0.5 text-xs font-semibold text-white">
          10× faster
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="text-foreground mt-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
      >
        From JD to{' '}
        <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
          Top 3
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="text-foreground/70 mt-3 text-2xl font-medium tracking-tight sm:text-3xl"
      >
        Own Your Candidate Pipeline
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg"
      >
        Upload a job description and get your top 3 qualified candidates in
        minutes. Our AI interviews, scores, and delivers hire-ready talent.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Button
          size="lg"
          className="group h-12 bg-[#6e55cf] px-8 text-base font-semibold text-white hover:bg-[#5a4ba8]"
          onClick={handleRouteSignup}
        >
          Start Free Trial
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 px-8 text-base font-semibold"
          onClick={handleRouteDemo}
        >
          Book a Demo
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-5 text-xs sm:text-sm"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-yellow-400">★★★★★</span>
          4.5/5 rating
        </span>
        <span className="bg-muted-foreground/40 h-1 w-1 rounded-full" />
        <span>10,000+ interviews conducted</span>
        <span className="bg-muted-foreground/40 h-1 w-1 rounded-full" />
        <span>95% accuracy rate</span>
      </motion.div>
    </div>
  );

  const cardContent = (
    <div className="relative h-full w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute -top-3 right-3 z-10"
      >
        {/* <button
          type="button"
          className="cursor-pointer rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-xs font-semibold text-primary shadow-md shadow-primary/20 ring-2 ring-primary/30 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-primary/25 hover:ring-primary/50 dark:bg-primary/30 dark:text-white dark:shadow-primary/30 dark:ring-primary/40 dark:hover:bg-primary/40"
          onClick={handleRouteAIInterviewer}
        >
          ✨ Try AI Interviewer
        </button> */}
      </motion.div>
      <div className="h-full w-full overflow-hidden rounded-2xl">
        <img
          src="/gifs/hero-section-video.gif"
          alt="Teamcast platform demonstration"
          className="h-full w-full scale-[1.12] object-cover object-left-top"
        />
      </div>
    </div>
  );

  return (
    <section className="from-background via-background to-muted/40 relative isolate overflow-hidden bg-gradient-to-b">
      {/* Background blob */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#6e55cf]/30 to-[#a78bfa]/20 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <ContainerScroll titleComponent={titleComponent}>
        {cardContent}
      </ContainerScroll>
    </section>
  );
}
