'use client';

import {
  ImagesScrollingAnimation,
  type ScrollCard,
} from '@/components/ui/images-scrolling-animation';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const steps: ScrollCard[] = [
  {
    step: 1,
    badge: 'Prospect Connection',
    badgeColor: '#C084FC',
    title: 'ATS and Job Boards',
    description:
      'Seamlessly integrate with your ATS and job boards to bring candidate pipelines directly into Teamcast.',
    src: '/images/job-discussion/ats-and-job-boards.svg',
  },
  {
    step: 2,
    badge: 'Skill Match',
    badgeColor: '#FB923C',
    title: 'Resume Assessment',
    description:
      'AI evaluates resumes for completeness, quality, and baseline fit—removing noise before human review.',
    src: '/images/job-discussion/resume-assessment.svg',
  },
  {
    step: 3,
    badge: 'Smart Screening',
    badgeColor: '#4ADE80',
    title: 'First Round Interview',
    description:
      'Conversational AI video interviews personalized to each candidate, assessing real skills, depth of experience, and authenticity.',
    src: '/images/job-discussion/ai-interview.svg',
  },
  {
    step: 4,
    badge: 'TA Review',
    badgeColor: '#FFFC68',
    title: 'Talent Acquisition Review',
    description:
      'Hiring teams review structured assessments and video highlights, then confidently shortlist for the next round.',
    src: '/images/job-discussion/talent-aquisition.svg',
  },
  {
    step: 5,
    badge: 'Job Interview',
    badgeColor: '#84FCF2',
    title: 'Job-Specific Interview',
    description:
      'Adaptive AI interviews tailored to the role, evaluating cultural fit, problem-solving, and role-specific competencies.',
    src: '/images/job-discussion/job-specific-interview.svg',
  },
  {
    step: 6,
    badge: 'Top Ranking Candidates',
    badgeColor: '#FCB084',
    title: 'Match & Rank',
    description:
      'All candidate data—resumes, interviews, assessments—aggregated and scored to deliver the Top 3 hire-ready candidates with full justification.',
    src: '/images/job-discussion/match-and-rank.svg',
  },
];

export function PlatformShowcaseSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          className="flex flex-col gap-y-2 px-6 sm:px-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            The full hiring journey, automated
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-lg">
            From ATS integration to your Top 3 hire-ready candidates — every
            step handled intelligently by Teamcast AI.
          </p>
        </motion.div>
      </div>

      <div className="mt-6">
        <ImagesScrollingAnimation items={steps} />
      </div>
    </section>
  );
}
