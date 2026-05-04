'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { useRef } from 'react';
import atsJobBoards from '../../../../../../../public/images/job-discussion/ats-and-job-boards.svg';
import resumeAssessment from '../../../../../../../public/images/job-discussion/resume-assessment.svg';
import aiVideoInterviews from '../../../../../../../public/images/job-discussion/ai-interview.svg';
import jobSpecificInterview from '../../../../../../../public/images/job-discussion/job-specific-interview.svg';
import matchAndRank from '../../../../../../../public/images/job-discussion/match-and-rank.svg';
import talentAcquisitionReview from '../../../../../../../public/images/job-discussion/talent-aquisition.svg';

export function JobDiscussionSection() {
  const [ref, _inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Transform values for perfect page-like transitions
  const section1Y = useTransform(
    scrollYProgress,
    [0, 0.15, 0.3],
    [0, -100, -200]
  );
  const section2Y = useTransform(
    scrollYProgress,
    [0.1, 0.25, 0.4],
    [100, 0, -100]
  );
  const section3Y = useTransform(
    scrollYProgress,
    [0.2, 0.35, 0.5],
    [100, 0, -100]
  );
  const section4Y = useTransform(
    scrollYProgress,
    [0.3, 0.45, 0.6],
    [100, 0, -100]
  );
  const section5Y = useTransform(
    scrollYProgress,
    [0.4, 0.55, 0.7],
    [100, 0, -100]
  );
  const section6Y = useTransform(
    scrollYProgress,
    [0.5, 0.65, 0.8],
    [100, 0, 0]
  );

  // Remove opacity animations to prevent transparency
  const section1Opacity = 1;
  const section2Opacity = 1;
  const section3Opacity = 1;
  const section4Opacity = 1;
  const section5Opacity = 1;
  const section6Opacity = 1;

  return (
    <section id="stats-section" className="bg-background py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={containerRef} className="relative mt-20 h-[600vh]">
          {/* Section 1 - ATS and Job Boards */}
          <motion.div
            className="bg-background sticky top-20 flex h-screen items-center transition-all duration-300"
            style={{ y: section1Y, opacity: section1Opacity }}
          >
            <div className="w-full">
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-row items-center gap-x-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#C084FC] text-xs">
                    1
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Prospect Connection
                  </p>
                </div>
                <h4 className="text-foreground mt-3 text-3xl font-medium">
                  ATS and Job Boards
                </h4>
                <p className="text-muted-foreground w-full text-lg md:w-[55%]">
                  Seamlessly integrate with your ATS and job boards to bring
                  candidate pipelines directly into Teamcast.
                </p>
              </div>
              <div className="mx-auto mt-14 max-w-7xl">
                <Image
                  src={atsJobBoards}
                  alt="ATS and Job Boards"
                  width={1000}
                  height={1000}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Section 2 - Resume Assessment */}
          <motion.div
            className="bg-background sticky top-20 flex h-screen items-center"
            style={{ y: section2Y, opacity: section2Opacity }}
          >
            <div className="w-full">
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-row items-center gap-x-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#FB923C] text-xs">
                    2
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Skill Match
                  </p>
                </div>
                <h4 className="text-foreground mt-3 text-3xl font-medium">
                  Resume Assessment
                </h4>
                <p className="text-muted-foreground w-full text-lg md:w-[55%]">
                  AI evaluates resumes for completeness, quality, and baseline
                  fit—removing noise before human review.
                </p>
              </div>
              <div className="mx-auto mt-14 max-w-7xl">
                <Image
                  src={resumeAssessment}
                  alt="Resume Assessment - Sourced Candidates"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Section 3 - First Round Interview */}
          <motion.div
            className="bg-background sticky top-20 flex h-screen items-center"
            style={{ y: section3Y, opacity: section3Opacity }}
          >
            <div className="w-full">
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-row items-center gap-x-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#4ADE80] text-xs">
                    3
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Smart Screening
                  </p>
                </div>
                <h4 className="text-foreground mt-3 text-3xl font-medium">
                  First Round Interview
                </h4>
                <p className="text-muted-foreground w-full text-lg md:w-[55%]">
                  Conversational AI video interviews personalized to each
                  candidate, assessing real skills, depth of experience, and
                  authenticity.
                </p>
              </div>
              <div className="mx-auto mt-14 max-w-7xl">
                <Image
                  src={aiVideoInterviews}
                  alt="AI Video Interviews"
                  width={1000}
                  height={1000}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </motion.div>
          {/* Section 4 - Job-Specific Interview */}
          <motion.div
            className="bg-background sticky top-20 flex h-screen items-center"
            style={{ y: section4Y, opacity: section4Opacity }}
          >
            <div className="w-full">
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-row items-center gap-x-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#FFFC68] text-xs">
                    4
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    TA Review
                  </p>
                </div>
                <h4 className="text-foreground mt-3 text-3xl font-medium">
                  Talent Acquisition Review
                </h4>
                <p className="text-muted-foreground w-full text-lg md:w-[55%]">
                  Hiring teams review structured assessments and video
                  highlights, then confidently shortlist for the next round.
                </p>
              </div>
              <div className="mx-auto mt-14 max-w-7xl">
                <Image
                  src={talentAcquisitionReview}
                  alt="Technical Assessment"
                  width={1000}
                  height={1000}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </motion.div>
          {/* Section 5 - Match & Rank */}
          <motion.div
            className="bg-background sticky top-20 flex h-screen items-center"
            style={{ y: section5Y, opacity: section5Opacity }}
          >
            <div className="w-full">
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-row items-center gap-x-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#84FCF2] text-xs">
                    5
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Job Interview
                  </p>
                </div>
                <h4 className="text-foreground mt-3 text-3xl font-medium">
                  Job-Specific Interview
                </h4>
                <p className="text-muted-foreground w-full text-lg md:w-[55%]">
                  Adaptive AI interviews tailored to the role, evaluating
                  cultural fit, problem-solving, and role-specific competencies.
                </p>
              </div>
              <div className="mx-auto mt-14 max-w-7xl">
                <Image
                  src={jobSpecificInterview}
                  alt="AI-Powered Ranking"
                  width={1000}
                  height={1000}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </motion.div>
          {/* Section 6 - Final Selection */}
          <motion.div
            className="bg-background sticky top-20 flex h-screen items-center"
            style={{ y: section6Y, opacity: section6Opacity }}
          >
            <div className="w-full">
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-row items-center gap-x-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#FCB084] text-xs">
                    6
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Top Ranking Candidates
                  </p>
                </div>
                <h4 className="text-foreground mt-3 text-3xl font-medium">
                  Match & Rank
                </h4>
                <p className="text-muted-foreground w-full text-lg md:w-[55%]">
                  All candidate data—resumes, interviews, assessments—aggregated
                  and scored to deliver the Top 3 hire-ready candidates with
                  full justification.
                </p>
              </div>
              <div className="mx-auto mt-14 max-w-7xl">
                <Image
                  src={matchAndRank}
                  alt="Top 3 Candidates"
                  width={1000}
                  height={1000}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
