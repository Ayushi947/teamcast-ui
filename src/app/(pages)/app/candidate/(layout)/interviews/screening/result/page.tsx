'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BarChart,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code,
  Download,
  FileText,
  Info,
  Lightbulb,
  Share2,
  Star,
  ThumbsUp,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Define proper types
type AudioQuestion = {
  id: string;
  text: string;
  responseType: 'audio';
  transcription: string;
  score: number;
  feedback: string;
};

type CodeQuestion = {
  id: string;
  text: string;
  responseType: 'code';
  language: string;
  code: string;
  score: number;
  feedback: string;
};

type InterviewQuestion = AudioQuestion | CodeQuestion;

type InterviewSection = {
  id: string;
  title: string;
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement?: string[];
  questions: InterviewQuestion[];
};

type InterviewResult = {
  candidateName: string;
  position: string;
  overallScore: number;
  completedAt: string;
  duration: string;
  overallFeedback: string;
  recommendation: string;
  recommendedJobs: {
    id: string;
    title: string;
    team: string;
    location: string;
    match: number;
    skills: string[];
    description: string;
  }[];
  sections: InterviewSection[];
  videoInsights: {
    engagement: number;
    confidence: number;
    clarity: number;
    insights: {
      title: string;
      description: string;
    }[];
    summary: string;
    keyHighlights: {
      timestamp: string;
      description: string;
    }[];
    improvementAreas: string[];
  };
  aiRecommendation: string;
  status?: 'qualified' | 'unqualified';
  coolingPeriodEndDate?: string;
};

const ScreeningResultsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [candidateStatus, setCandidateStatus] = useState<
    'qualified' | 'unqualified'
  >('qualified');

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Toggle between qualified and unqualified for testing
  const toggleCandidateStatus = () => {
    setCandidateStatus((prev) =>
      prev === 'qualified' ? 'unqualified' : 'qualified'
    );
  };

  // Calculate cooling period end date (30 days from completedAt)
  const getCoolingPeriodEndDate = (completedDate: string) => {
    const completed = new Date(completedDate);
    const endDate = new Date(completed);
    endDate.setDate(endDate.getDate() + 30);
    return endDate.toISOString();
  };

  // Mock data that would come from the API in a real application
  const resultData: InterviewResult = {
    candidateName: 'Alex Johnson',
    position: 'Senior Frontend Developer',
    overallScore: candidateStatus === 'qualified' ? 87 : 54,
    completedAt: '2023-06-10T14:30:00',
    duration: '38 minutes',
    overallFeedback:
      candidateStatus === 'qualified'
        ? 'Strong technical knowledge with good communication skills. Candidate demonstrated excellent problem-solving abilities and in-depth React knowledge.'
        : 'Candidate showed basic technical knowledge but struggled with complex problem-solving questions. More experience with React and modern web frameworks is needed.',
    recommendation:
      candidateStatus === 'qualified'
        ? 'Selected for Next Round'
        : 'Not Qualified',
    status: candidateStatus,
    coolingPeriodEndDate: getCoolingPeriodEndDate('2023-06-10T14:30:00'),
    recommendedJobs: [
      {
        id: 'job-1',
        title: 'Senior React Developer',
        team: 'Product Development',
        location: 'San Francisco, CA (Hybrid)',
        match: 94,
        skills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
        description:
          'Looking for a senior developer to build and maintain our customer-facing web applications.',
      },
      {
        id: 'job-2',
        title: 'Frontend Tech Lead',
        team: 'Customer Experience',
        location: 'Remote (US)',
        match: 89,
        skills: ['React', 'Team Leadership', 'Architecture', 'Performance'],
        description:
          'Lead a team of frontend developers building our next-generation user interfaces.',
      },
      {
        id: 'job-3',
        title: 'Full Stack Engineer',
        team: 'Platform Services',
        location: 'New York, NY (On-site)',
        match: 82,
        skills: ['React', 'Node.js', 'API Design', 'AWS'],
        description:
          'Join our platform team to develop both frontend interfaces and backend services.',
      },
    ],
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        score: candidateStatus === 'qualified' ? 92 : 65,
        feedback:
          candidateStatus === 'qualified'
            ? 'Clear introduction with relevant background information. Candidate demonstrated enthusiasm and good communication skills.'
            : 'Introduction was adequate but lacked specific details about relevant experience. Some enthusiasm shown but communication could be improved.',
        strengths:
          candidateStatus === 'qualified'
            ? ['Articulate communication', 'Relevant background']
            : ['Basic communication', 'Some enthusiasm'],
        areasForImprovement:
          candidateStatus === 'qualified'
            ? undefined
            : ['More specific details', 'Better articulation of experience'],
        questions: [
          {
            id: 'intro-1',
            text: 'Please introduce yourself and tell us about your background in technology.',
            responseType: 'audio',
            transcription:
              "I&apos;m Alex Johnson, a frontend developer with 6 years of experience specializing in React and TypeScript. I've worked on enterprise applications at Company XYZ, focusing on performance optimization and component libraries...",
            score: 95,
            feedback:
              'Excellent introduction with relevant background and specific technologies mentioned.',
          },
          {
            id: 'intro-2',
            text: 'What excites you most about joining our team?',
            responseType: 'audio',
            transcription:
              "I&apos;m particularly excited about the opportunity to work on innovative products that leverage modern technologies. Your company's focus on user experience aligns perfectly with my passion...",
            score: 90,
            feedback: 'Good enthusiasm and alignment with company values.',
          },
        ],
      },
      {
        id: 'technical-background',
        title: 'Technical Experience',
        score: candidateStatus === 'qualified' ? 88 : 52,
        feedback:
          candidateStatus === 'qualified'
            ? 'Strong technical background with relevant experience in required technologies.'
            : 'Limited technical experience with key technologies. Candidate needs to develop a deeper understanding of core concepts.',
        strengths:
          candidateStatus === 'qualified'
            ? [
                'In-depth React knowledge',
                'Performance optimization experience',
              ]
            : ['Basic coding knowledge', 'Some JavaScript experience'],
        areasForImprovement:
          candidateStatus === 'qualified'
            ? undefined
            : [
                'React fundamentals',
                'JavaScript proficiency',
                'Modern web development concepts',
              ],
        questions: [
          {
            id: 'tech-1',
            text: 'What programming languages are you most proficient in and why do you prefer them?',
            responseType: 'audio',
            transcription:
              'I&apos;m most proficient in JavaScript, TypeScript, and have experience with Python. I prefer TypeScript for frontend development because of its type safety features...',
            score: 90,
            feedback:
              'Good explanation of language preferences with reasoning.',
          },
          {
            id: 'tech-2',
            text: 'Describe a challenging technical problem you solved recently.',
            responseType: 'audio',
            transcription:
              'Recently, I tackled a performance issue in a complex dashboard that was rendering thousands of data points. I implemented virtualization using react-window and optimized re-renders...',
            score: 85,
            feedback:
              'Clear problem description with specific solution approach. Could have provided more details on the outcome.',
          },
        ],
      },
      {
        id: 'coding-assessment',
        title: 'Coding Challenge',
        score: candidateStatus === 'qualified' ? 82 : 48,
        feedback:
          candidateStatus === 'qualified'
            ? 'Good solution with proper logic, but could improve code organization and error handling.'
            : 'Solution did not meet requirements. Code showed fundamental misunderstandings of algorithms and data structures.',
        strengths:
          candidateStatus === 'qualified'
            ? ['Correct algorithm implementation', 'Edge case handling']
            : ['Basic syntax knowledge'],
        areasForImprovement:
          candidateStatus === 'qualified'
            ? ['Code optimization', 'Documentation']
            : [
                'Algorithm complexity',
                'Code organization',
                'Problem solving approach',
              ],
        questions: [
          {
            id: 'code-1',
            text: 'Implement a function that finds the most frequent element in an array.',
            responseType: 'code',
            language: 'javascript',
            code: `function findMostFrequent(arr) {
  if (!arr || arr.length === 0) return null;
  
  const frequency = {};
  let maxFreq = 0;
  let mostFrequentElement;
  
  for (const element of arr) {
    frequency[element] = (frequency[element] || 0) + 1;
    
    if (frequency[element] > maxFreq) {
      maxFreq = frequency[element];
      mostFrequentElement = element;
    }
  }
  
  return mostFrequentElement;
}`,
            score: 82,
            feedback:
              'Correct implementation with good edge case handling. Could optimize by using Map instead of object for better performance.',
          },
        ],
      },
      {
        id: 'system-design',
        title: 'System Design',
        score: candidateStatus === 'qualified' ? 78 : 42,
        feedback:
          candidateStatus === 'qualified'
            ? 'Good understanding of system architecture but could improve on scalability considerations.'
            : 'Limited understanding of system architecture concepts. Design lacked consideration for basic scalability and maintenance.',
        strengths:
          candidateStatus === 'qualified'
            ? ['Conflict resolution approach', 'Component structure']
            : ['Basic component understanding'],
        areasForImprovement:
          candidateStatus === 'qualified'
            ? ['Scalability planning', 'Database considerations']
            : [
                'Architecture principles',
                'Scalability concepts',
                'Component design',
              ],
        questions: [
          {
            id: 'design-1',
            text: 'How would you design a real-time collaborative document editing system?',
            responseType: 'audio',
            transcription:
              'I would implement a system using operational transformation or CRDT for conflict resolution. For the architecture, I would use WebSockets for real-time communication...',
            score: 78,
            feedback:
              'Good understanding of collaborative editing concepts, but could elaborate more on database and caching strategies.',
          },
        ],
      },
      {
        id: 'work-preferences',
        title: 'Work Style',
        score: candidateStatus === 'qualified' ? 95 : 62,
        feedback:
          candidateStatus === 'qualified'
            ? 'Excellent work style that aligns well with team culture.'
            : 'Work preferences showed some alignment with team culture, but lacked depth in collaborative approach.',
        strengths:
          candidateStatus === 'qualified'
            ? ['Team collaboration focus', 'Continuous learning mindset']
            : ['Some teamwork experience', 'Basic adaptability'],
        areasForImprovement:
          candidateStatus === 'qualified'
            ? undefined
            : ['Collaborative workflow', 'Communication in team settings'],
        questions: [
          {
            id: 'pref-1',
            text: 'Describe your ideal work environment and collaboration style.',
            responseType: 'audio',
            transcription:
              'I thrive in collaborative environments where team members share knowledge openly. I prefer regular check-ins with clear communication channels...',
            score: 95,
            feedback: 'Excellent description of collaborative work style.',
          },
          {
            id: 'pref-2',
            text: 'How do you stay updated with new technologies?',
            responseType: 'audio',
            transcription:
              'I follow key tech blogs, participate in online communities like Stack Overflow, and dedicate time weekly to explore new libraries and frameworks...',
            score: 94,
            feedback:
              'Strong commitment to continuous learning with specific examples.',
          },
        ],
      },
    ],
    videoInsights: {
      engagement: 90,
      confidence: 88,
      clarity: 92,
      insights: [
        {
          title: 'Engaged Presence',
          description:
            'Maintained good eye contact and showed active engagement.',
        },
        {
          title: 'Professional Demeanor',
          description:
            'Presented with confidence and clarity throughout the interview.',
        },
        {
          title: 'Clear Communication',
          description:
            'Used appropriate gestures and expressions to emphasize key points.',
        },
      ],
      summary:
        'The candidate exhibited strong communication skills throughout the interview. They maintained consistent eye contact, used appropriate hand gestures, and showed genuine enthusiasm when discussing technical topics. Their posture was professional, and speaking pace was well-measured with minimal filler words. The candidate demonstrated confidence when answering difficult questions and used visual aids effectively when explaining complex concepts.',
      keyHighlights: [
        {
          timestamp: '05:23',
          description:
            'Excellent explanation of architecture design with clear reasoning',
        },
        {
          timestamp: '12:47',
          description:
            'Strong problem-solving approach demonstrated in coding challenge',
        },
        {
          timestamp: '24:16',
          description:
            'Thoughtful questions about team culture and development practices',
        },
      ],
      improvementAreas: [
        'Occasionally rushed through technical explanations',
        'Could provide more concrete examples from past work',
        'Hesitated when discussing scaling challenges',
      ],
    },
    aiRecommendation:
      "Based on the candidate's strong technical skills and cultural fit, I recommend advancing to the next interview round. The candidate demonstrates solid React knowledge and problem-solving capabilities that align well with the role requirements.",
  };

  const ScoreIndicator = ({ score }: { score: number }) => {
    const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-emerald-500';
      if (score >= 80) return 'text-blue-500';
      if (score >= 70) return 'text-amber-500';
      return 'text-red-500';
    };

    const getScoreBackground = (score: number) => {
      if (score >= 90) return 'bg-emerald-100';
      if (score >= 80) return 'bg-blue-100';
      if (score >= 70) return 'bg-amber-100';
      return 'bg-red-100';
    };

    return (
      <div className="flex items-center space-x-2">
        <div
          className={`${getScoreBackground(score)} ${getScoreColor(score)} flex h-12 w-12 items-center justify-center rounded-full font-bold`}
        >
          {score}
        </div>
        <div className="text-sm text-gray-500">/100</div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-4">
        {/* Header with proper positioning */}
        <div className="">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground mb-4 flex w-fit items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Application
          </Button>
          <div className="pb-4">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-foreground text-3xl font-bold">
                    {resultData.candidateName}
                  </h1>
                  {/* Moved toggle next to the name */}
                  <div className="border-border bg-card inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium shadow-sm">
                    <span className="text-muted-foreground mr-2">Test:</span>
                    <button
                      onClick={toggleCandidateStatus}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        candidateStatus === 'qualified'
                          ? 'bg-success'
                          : 'bg-destructive'
                      }`}
                    >
                      <span
                        className={`bg-background inline-block h-3.5 w-3.5 transform rounded-full transition-transform ${
                          candidateStatus === 'qualified'
                            ? 'translate-x-5'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="text-muted-foreground flex items-center pt-2">
                  <span>{resultData.position}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">
                    {formatDate(resultData.completedAt)}
                  </span>
                  <span className="mx-2">•</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-sm ${
                      candidateStatus === 'qualified'
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {candidateStatus === 'qualified'
                      ? 'Qualified'
                      : 'Not Qualified'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="border-border bg-card text-foreground hover:bg-muted flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </button>
                <button className="flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </button>
                {candidateStatus === 'qualified' && (
                  <button className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    <Zap className="mr-2 h-4 w-4" />
                    Find Your Dream Job
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="pt-4 pb-10">
          {/* Top card with score and recommendation - Redesigned */}
          <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="grid md:grid-cols-3">
              <div className="p-6 md:col-span-2">
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`rounded-full ${
                      candidateStatus === 'qualified'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    } px-3 py-1 text-sm font-medium`}
                  >
                    {resultData.recommendation}
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {resultData.duration}
                  </div>
                </div>

                <h2 className="mb-4 text-xl font-semibold text-slate-900">
                  Overall Assessment
                </h2>
                <p className="text-slate-700">{resultData.overallFeedback}</p>

                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-medium text-slate-700">
                    AI Recommendation
                  </h3>
                  <div className="flex items-start rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                    <Zap className="mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
                    <p className="text-sm text-slate-700">
                      {resultData.aiRecommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Completely redesigned Performance Overview section */}
              <div className="flex flex-col border-t border-slate-100 bg-gradient-to-b from-slate-50 via-white to-white px-4 py-6 md:border-t-0 md:border-l">
                {/* Innovative radar/spider chart visualization */}
                <div className="relative mx-auto mb-4 h-64 w-64">
                  {/* Background circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-full rounded-full border-2 border-dashed border-slate-200 opacity-30"></div>
                    <div className="absolute h-3/4 w-3/4 rounded-full border-2 border-dashed border-slate-200 opacity-50"></div>
                    <div className="absolute h-1/2 w-1/2 rounded-full border-2 border-dashed border-slate-200 opacity-70"></div>
                    <div className="absolute h-1/4 w-1/4 rounded-full border-2 border-dashed border-slate-200"></div>
                  </div>

                  {/* Section score points and connecting lines */}
                  <div className="absolute inset-0">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient
                          id="scoreGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite
                            in="SourceGraphic"
                            in2="blur"
                            operator="over"
                          />
                        </filter>
                      </defs>

                      {/* Polygon connecting all points */}
                      <polygon
                        points={resultData.sections
                          .map((section, i) => {
                            const angle =
                              (Math.PI * 2 * i) / resultData.sections.length;
                            const scoreRatio = section.score / 100;
                            const distance = 45 * scoreRatio;
                            const x = 50 + distance * Math.sin(angle);
                            const y = 50 - distance * Math.cos(angle);
                            return `${x},${y}`;
                          })
                          .join(' ')}
                        fill="rgba(59, 130, 246, 0.15)"
                        stroke="url(#scoreGradient)"
                        strokeWidth="1"
                        filter="url(#glow)"
                      />

                      {/* Points for each section score */}
                      {resultData.sections.map((section, i) => {
                        const angle =
                          (Math.PI * 2 * i) / resultData.sections.length;
                        const scoreRatio = section.score / 100;
                        const distance = 45 * scoreRatio;
                        const x = 50 + distance * Math.sin(angle);
                        const y = 50 - distance * Math.cos(angle);

                        // Also draw thin lines from center to each data point
                        return (
                          <g key={i}>
                            <line
                              x1="50"
                              y1="50"
                              x2={x}
                              y2={y}
                              stroke="#e2e8f0"
                              strokeWidth="0.5"
                            />
                            <circle
                              cx={x}
                              cy={y}
                              r="3"
                              fill={
                                section.score >= 90
                                  ? '#10b981'
                                  : section.score >= 80
                                    ? '#3b82f6'
                                    : section.score >= 70
                                      ? '#f59e0b'
                                      : '#ef4444'
                              }
                              filter="url(#glow)"
                            />
                          </g>
                        );
                      })}

                      {/* Overall score in center */}
                      <circle
                        cx="50"
                        cy="50"
                        r="12"
                        fill="url(#scoreGradient)"
                        className="drop-shadow-lg"
                      />
                      <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dy=".3em"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {resultData.overallScore}
                      </text>
                    </svg>
                  </div>

                  {/* Section labels around the chart */}
                  {resultData.sections.map((section, i) => {
                    const angle =
                      (Math.PI * 2 * i) / resultData.sections.length;
                    const labelDistance = 52;
                    const x = 50 + labelDistance * Math.sin(angle);
                    const y = 50 - labelDistance * Math.cos(angle);

                    // Remove unused textAnchor variable
                    const labelX = x;
                    const labelY = y;

                    return (
                      <div
                        key={i}
                        className="absolute -ml-16 w-32 text-center text-xs font-medium text-slate-700"
                        style={{
                          left: `${(labelX / 100) * 100}%`,
                          top: `${(labelY / 100) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div className="group flex cursor-pointer flex-col items-center">
                          <span className="rounded-full px-2 py-0.5 text-center whitespace-nowrap">
                            {section.title}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                              section.score >= 90
                                ? 'text-emerald-600'
                                : section.score >= 80
                                  ? 'text-blue-600'
                                  : section.score >= 70
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                            }`}
                          >
                            {section.score}
                          </span>

                          {/* Tooltip */}
                          <div className="absolute z-10 -mt-1 hidden w-48 translate-y-8 transform rounded-lg bg-white p-2 shadow-lg group-hover:block">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-900">
                                {section.title}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  section.score >= 90
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : section.score >= 80
                                      ? 'bg-blue-100 text-blue-700'
                                      : section.score >= 70
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {section.score}/100
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                              {section.feedback}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary legend with score comparisons */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="col-span-3 mb-2 text-center">
                    <span className="rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 px-3 py-1 text-xs font-medium text-white">
                      Overall Performance: {resultData.overallScore}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-7 border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('summary')}
                className={`border-b-2 px-1 pb-3 text-sm font-medium ${activeTab === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
              >
                Assessment Overview
              </button>
              <button
                onClick={() => setActiveTab('detailed')}
                className={`border-b-2 px-1 pb-3 text-sm font-medium ${activeTab === 'detailed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
              >
                Detailed Responses
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`border-b-2 px-1 pb-3 text-sm font-medium ${activeTab === 'video' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
              >
                Video Analysis
              </button>
            </nav>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'summary' && (
            <div className="space-y-10">
              {/* Section scores - Enhanced design and made collapsible */}
              <section>
                <h3 className="mb-5 inline-flex items-center text-lg font-medium text-slate-900">
                  <BarChart className="mr-2 h-5 w-5 text-blue-500" />
                  Section Breakdown
                </h3>
                <div className="mb-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {resultData.sections.map((section) => (
                    <div
                      key={section.id}
                      className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow"
                    >
                      <div className="absolute top-0 left-0 h-1 w-full bg-slate-100">
                        <div
                          className={`h-full ${
                            section.score >= 90
                              ? 'bg-emerald-500'
                              : section.score >= 80
                                ? 'bg-blue-500'
                                : section.score >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                          }`}
                          style={{ width: `${section.score}%` }}
                        ></div>
                      </div>

                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-start justify-between p-5 text-left"
                      >
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-slate-900">
                            {section.title}
                          </h4>
                          {!expandedSections[section.id] && (
                            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                              {section.feedback}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 flex items-center">
                          <ScoreIndicator score={section.score} />
                          <svg
                            className={`ml-3 h-5 w-5 transform text-slate-500 transition-transform ${expandedSections[section.id] ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      {expandedSections[section.id] && (
                        <div className="border-t border-slate-100 px-5 pt-3 pb-5">
                          <p className="mb-4 text-sm text-slate-600">
                            {section.feedback}
                          </p>

                          <div className="space-y-3">
                            {section.strengths && (
                              <div>
                                <h5 className="mb-1.5 flex items-center text-xs font-medium text-slate-700">
                                  <ThumbsUp className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                                  STRENGTHS
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {section.strengths.map((strength, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                                    >
                                      {strength}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {section.areasForImprovement && (
                              <div>
                                <h5 className="mb-1.5 flex items-center text-xs font-medium text-slate-700">
                                  <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                                  AREAS FOR IMPROVEMENT
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {section.areasForImprovement.map(
                                    (area, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                                      >
                                        {area}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                  <div className="flex">
                    <Info className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Looking for more insights?
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Explore the detailed responses tab to see specific
                          answers and feedback for each question.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Next Steps section - Enhanced and conditional based on candidate status */}
              <section>
                <h3 className="mb-5 inline-flex items-center text-lg font-medium text-slate-900">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-blue-500" />
                  Next Steps
                </h3>

                {candidateStatus === 'qualified' ? (
                  /* Qualified candidate experience */
                  <div className="mb-2 grid gap-5 sm:grid-cols-2">
                    {/* Prepare for Interview Card - Enhanced */}
                    <div className="rounded-xl bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="mb-2 text-lg font-medium text-slate-900">
                        Prepare for Your Interview
                      </h4>
                      <p className="mb-5 text-slate-600">
                        Congratulations on being selected! Take these steps to
                        maximize your chances of success in the next round.
                      </p>

                      <div className="mb-6 space-y-4">
                        <div className="flex items-start">
                          <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            1
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-slate-900">
                              Take Practice Interviews
                            </h5>
                            <p className="text-sm text-slate-600">
                              Practice with our AI interviewer to get
                              comfortable with technical questions.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            2
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-slate-900">
                              Review Your Performance
                            </h5>
                            <p className="text-sm text-slate-600">
                              Study the feedback from this screening to identify
                              areas for improvement.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            3
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-slate-900">
                              Research the Company
                            </h5>
                            <p className="text-sm text-slate-600">
                              Learn about our culture, products, and recent news
                              to show your interest.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                          View Resources
                        </button>
                        <button className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                          Schedule Practice
                        </button>
                      </div>
                    </div>

                    {/* Apply for Jobs Card - Updated with full-width button */}
                    <div className="rounded-xl bg-gradient-to-br from-white to-emerald-50 p-6 shadow-sm">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                        <Zap className="h-6 w-6 text-emerald-600" />
                      </div>
                      <h4 className="mb-2 text-lg font-medium text-slate-900">
                        Apply for Open Positions
                      </h4>
                      <p className="mb-6 text-slate-600">
                        Based on your interview performance, we&apos;ve
                        identified several positions that match your skills and
                        experience. Explore our job listings to find your
                        perfect fit.
                      </p>

                      <div className="mb-5 rounded-lg bg-emerald-50 p-4">
                        <div className="flex items-center">
                          <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-600" />
                          <p className="text-sm font-medium text-emerald-800">
                            {resultData.recommendedJobs.length} positions match
                            your skills
                          </p>
                        </div>
                      </div>

                      <button className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                        Find Your Dream Job
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Unqualified candidate experience */
                  <div className="mb-2 grid gap-5 sm:grid-cols-2">
                    {/* Improvement Plan Card */}
                    <div className="rounded-xl bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Lightbulb className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="mb-2 text-lg font-medium text-slate-900">
                        Your Improvement Plan
                      </h4>
                      <p className="mb-6 text-slate-600">
                        We&apos;ve identified key areas that need improvement.
                        Focus on these skills to increase your chances of
                        success in your next attempt.
                      </p>

                      <div className="mb-6 space-y-4">
                        {resultData.sections
                          .filter((section) => section.score < 70)
                          .slice(0, 3)
                          .map((section, index) => (
                            <div key={section.id} className="flex items-start">
                              <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                {index + 1}
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-slate-900">
                                  {section.title}
                                </h5>
                                <p className="text-sm text-slate-600">
                                  {section.areasForImprovement?.[0] ||
                                    'Focus on improving skills in this area.'}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                          View Learning Materials
                        </button>
                        <button className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                          Start Practice Tests
                        </button>
                      </div>
                    </div>

                    {/* Cooling Period Card */}
                    <div className="rounded-xl bg-gradient-to-br from-white to-amber-50 p-6 shadow-sm">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                        <svg
                          className="h-6 w-6 text-amber-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="mb-2 text-lg font-medium text-slate-900">
                        Cooling Period
                      </h4>
                      <p className="mb-6 text-slate-600">
                        There is a 30-day cooling period before you can attempt
                        the screening interview again. Use this time to improve
                        your skills and prepare better for your next
                        opportunity.
                      </p>

                      <div className="mb-3 rounded-lg bg-amber-50 p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-amber-800">
                              Cooling Period Ends
                            </span>
                            <span className="text-sm font-bold text-amber-800">
                              {new Date(
                                resultData.coolingPeriodEndDate || ''
                              ).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-amber-200">
                            <div
                              className="h-2 rounded-full bg-amber-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    ((new Date().getTime() -
                                      new Date(
                                        resultData.completedAt
                                      ).getTime()) /
                                      (new Date(
                                        resultData.coolingPeriodEndDate || ''
                                      ).getTime() -
                                        new Date(
                                          resultData.completedAt
                                        ).getTime())) *
                                      100
                                  )
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <div className="flex items-start">
                          <Info className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-amber-500" />
                          <p className="text-sm text-amber-700">
                            Mark your calendar! After the cooling period ends,
                            you&apos;ll be able to attempt the screening
                            interview again with your improved skills.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-lg bg-slate-100 p-4">
                  <div className="flex">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-slate-900">
                        {candidateStatus === 'qualified'
                          ? 'Your profile has been shared with our hiring team'
                          : 'Your results have been recorded'}
                      </h3>
                      <div className="mt-2 text-sm text-slate-600">
                        <p>
                          {candidateStatus === 'qualified'
                            ? 'We&apos;ll notify you when the next steps are scheduled. In the meantime, explore recommended positions below.'
                            : 'Review the detailed feedback and work on improving your skills. We look forward to seeing your progress!'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recommended Jobs - Show only for qualified candidates */}
              {candidateStatus === 'qualified' && (
                <section>
                  <h3 className="mb-5 inline-flex items-center text-lg font-medium text-slate-900">
                    <Zap className="mr-2 h-5 w-5 text-blue-500" />
                    Recommended Positions
                  </h3>
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {resultData.recommendedJobs.map((job) => (
                        <Link
                          key={job.id}
                          href="#"
                          className="group block overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow"
                        >
                          <div className="relative border-b border-slate-100 bg-slate-50 p-4">
                            <div className="absolute top-4 right-4">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-medium text-white">
                                {job.match}%
                              </div>
                            </div>
                            <div className="pr-8">
                              <h4 className="font-medium text-slate-900 group-hover:text-blue-600">
                                {job.title}
                              </h4>
                              <div className="mt-1 text-sm text-slate-500">
                                {job.team} • {job.location}
                              </div>
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="mb-4 text-sm text-slate-600">
                              {job.description}
                            </p>

                            <div className="mb-5 flex flex-wrap gap-1.5">
                              {job.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>

                            <div>
                              <button className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                                Apply Now
                              </button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="flex flex-col items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-center sm:flex-row sm:text-left">
                      <div className="mb-4 sm:mb-0">
                        <h4 className="text-lg font-medium text-slate-900">
                          Ready to explore more opportunities?
                        </h4>
                        <p className="mt-1 text-slate-600">
                          Discover all available positions that match your
                          unique skills and experience.
                        </p>
                      </div>
                      <button className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                        Find Your Dream Job
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Recommended Resources - Show for unqualified candidates */}
              {candidateStatus === 'unqualified' && (
                <section>
                  <h3 className="mb-5 inline-flex items-center text-lg font-medium text-slate-900">
                    <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
                    Recommended Resources
                  </h3>
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Resource cards */}
                      <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow">
                        <div className="relative h-36 bg-gradient-to-r from-blue-500 to-indigo-600">
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            <Code className="h-16 w-16 opacity-20" />
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="mb-2 font-medium text-slate-900">
                            Technical Interview Preparation
                          </h4>
                          <p className="mb-4 text-sm text-slate-600">
                            Master coding challenges, system design questions,
                            and technical concepts through our structured
                            courses.
                          </p>
                          <button className="inline-flex items-center text-sm font-medium text-blue-600">
                            Start Learning{' '}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow">
                        <div className="relative h-36 bg-gradient-to-r from-amber-500 to-orange-600">
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            <Lightbulb className="h-16 w-16 opacity-20" />
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="mb-2 font-medium text-slate-900">
                            Problem-Solving Skills
                          </h4>
                          <p className="mb-4 text-sm text-slate-600">
                            Improve your analytical thinking and approach to
                            complex problems with guided exercises and
                            tutorials.
                          </p>
                          <button className="inline-flex items-center text-sm font-medium text-blue-600">
                            Explore Exercises{' '}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow">
                        <div className="relative h-36 bg-gradient-to-r from-emerald-500 to-teal-600">
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            <Users className="h-16 w-16 opacity-20" />
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="mb-2 font-medium text-slate-900">
                            Communication Skills
                          </h4>
                          <p className="mb-4 text-sm text-slate-600">
                            Learn to articulate complex ideas clearly and
                            improve your interview presence with our
                            communication workshops.
                          </p>
                          <button className="inline-flex items-center text-sm font-medium text-blue-600">
                            Join Workshop{' '}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-center sm:flex-row sm:text-left">
                      <div className="mb-4 sm:mb-0">
                        <h4 className="text-lg font-medium text-slate-900">
                          Ready to improve your skills?
                        </h4>
                        <p className="mt-1 text-slate-600">
                          Access our complete learning platform with courses,
                          practice tests, and personalized feedback.
                        </p>
                      </div>
                      <button className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                        Access Learning Center
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-medium text-slate-900">
                    Detailed Assessment
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    Total Questions:{' '}
                    {resultData.sections.reduce(
                      (sum, section) => sum + section.questions.length,
                      0
                    )}
                  </span>
                  <div className="h-5 w-[1px] bg-slate-200"></div>
                  <span className="text-sm text-slate-500">
                    Average Score:{' '}
                    {Math.round(
                      resultData.sections.reduce(
                        (sum, section) => sum + section.score,
                        0
                      ) / resultData.sections.length
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                {resultData.sections.map((section) => (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-xl bg-white shadow-sm"
                  >
                    {/* Section Header - Collapsible */}
                    <button
                      className="w-full text-left focus:outline-none"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {section.id === 'introduction' && (
                              <FileText className="h-5 w-5 text-blue-600" />
                            )}
                            {section.id === 'technical-background' && (
                              <Zap className="h-5 w-5 text-amber-600" />
                            )}
                            {section.id === 'coding-assessment' && (
                              <Code className="h-5 w-5 text-emerald-600" />
                            )}
                            {section.id === 'system-design' && (
                              <Share2 className="h-5 w-5 text-purple-600" />
                            )}
                            {section.id === 'work-preferences' && (
                              <Users className="h-5 w-5 text-blue-600" />
                            )}
                            <h3 className="mr-2 text-lg font-medium text-slate-900">
                              {section.title}
                            </h3>
                            <div
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                section.score >= 90
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : section.score >= 80
                                    ? 'bg-blue-100 text-blue-700'
                                    : section.score >= 70
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-red-100 text-red-700'
                              }`}
                            >
                              Score: {section.score}/100
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-slate-500">
                              {section.questions.length} Questions
                            </span>
                            <svg
                              className={`h-5 w-5 transform text-slate-500 transition-transform ${expandedSections[section.id] ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Section Overview Preview - Shown when collapsed */}
                    {!expandedSections[section.id] && (
                      <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 p-4">
                        <div className="flex items-start">
                          <Info className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-blue-500" />
                          <p className="line-clamp-2 text-sm text-slate-600">
                            {section.feedback}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {section.strengths &&
                            section.strengths.slice(0, 2).map((strength, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                              >
                                <ThumbsUp className="mr-1 h-3 w-3 text-emerald-600" />
                                {strength}
                              </span>
                            ))}
                          {section.strengths &&
                            section.strengths.length > 2 && (
                              <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
                                +{section.strengths.length - 2} more
                              </span>
                            )}
                          {section.areasForImprovement &&
                            section.areasForImprovement
                              .slice(0, 1)
                              .map((area, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                                >
                                  <Lightbulb className="mr-1 h-3 w-3 text-amber-600" />
                                  {area}
                                </span>
                              ))}
                        </div>
                      </div>
                    )}

                    {/* Section Content - Expanded state */}
                    {expandedSections[section.id] && (
                      <div className="p-5">
                        <div className="mb-6 rounded-lg bg-slate-50 p-4">
                          <div className="flex items-start gap-3">
                            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                            <div>
                              <h4 className="mb-1 text-sm font-medium text-slate-900">
                                Section Overview
                              </h4>
                              <p className="text-sm text-slate-700">
                                {section.feedback}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {section.strengths && (
                              <div className="rounded-lg bg-emerald-50 p-3">
                                <h5 className="mb-2 text-xs font-medium text-emerald-700 uppercase">
                                  Strengths
                                </h5>
                                <ul className="space-y-1">
                                  {section.strengths.map((strength, i) => (
                                    <li key={i} className="flex items-start">
                                      <ThumbsUp className="mt-0.5 mr-2 h-3 w-3 text-emerald-600" />
                                      <span className="text-sm text-emerald-700">
                                        {strength}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {section.areasForImprovement && (
                              <div className="rounded-lg bg-amber-50 p-3">
                                <h5 className="mb-2 text-xs font-medium text-amber-700 uppercase">
                                  Areas for Improvement
                                </h5>
                                <ul className="space-y-1">
                                  {section.areasForImprovement.map(
                                    (area, i) => (
                                      <li key={i} className="flex items-start">
                                        <Lightbulb className="mt-0.5 mr-2 h-3 w-3 text-amber-600" />
                                        <span className="text-sm text-amber-700">
                                          {area}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Questions accordion */}
                        <div className="space-y-4">
                          {section.questions.map((question, qIndex) => (
                            <div
                              key={question.id}
                              className="overflow-hidden rounded-lg border border-slate-100 bg-white"
                            >
                              <details className="group">
                                <summary className="flex cursor-pointer items-center justify-between p-4 text-left text-sm font-medium text-slate-900">
                                  <div className="flex items-center">
                                    <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                      {qIndex + 1}
                                    </div>
                                    {question.text}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                        question.score >= 90
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : question.score >= 80
                                            ? 'bg-blue-100 text-blue-700'
                                            : question.score >= 70
                                              ? 'bg-amber-100 text-amber-700'
                                              : 'bg-red-100 text-red-700'
                                      }`}
                                    >
                                      {question.score}/100
                                    </span>
                                    <svg
                                      className="h-5 w-5 transform text-slate-500 transition-transform group-open:rotate-180"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </div>
                                </summary>

                                <div className="border-t border-slate-100 bg-slate-50 p-4">
                                  {question.responseType === 'audio' ? (
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">
                                          Audio Response
                                        </span>
                                        <button className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="mr-1.5 h-3 w-3"
                                          >
                                            <path d="M8 5v14l11-7z" />
                                          </svg>
                                          Play Audio
                                        </button>
                                      </div>

                                      <div className="rounded-lg bg-white p-4 shadow-sm">
                                        <h5 className="mb-2 text-xs font-medium text-slate-500">
                                          Transcript
                                        </h5>
                                        <p className="text-sm text-slate-600 italic">
                                          {
                                            (question as AudioQuestion)
                                              .transcription
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">
                                          Code Solution (
                                          {(question as CodeQuestion).language})
                                        </span>
                                        <div className="flex gap-2">
                                          <button className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                              className="mr-1.5 h-3 w-3"
                                            >
                                              <path d="M11.5 5.5a.5.5 0 0 1 1 0v13a.5.5 0 0 1-1 0v-13ZM6 12a.75.75 0 0 1 0-1.5h12a.75.75 0 0 1 0 1.5H6Z" />
                                            </svg>
                                            Collapse
                                          </button>
                                          <button className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                              className="mr-1.5 h-3 w-3"
                                            >
                                              <path d="M4.5 18.75a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5H5.25v11.25a.75.75 0 0 1-.75.75ZM19.5 6.75a.75.75 0 0 1-.75.75h-.75v10.5a.75.75 0 0 1 0 1.5h1.5a.75.75 0 0 0 .75-.75v-12a.75.75 0 0 0-.75-.75h-12a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A2.25 2.25 0 0 1 7.5 4.5h12a2.25 2.25 0 0 1 2.25 2.25v12a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25V7.5H19.5a.75.75 0 0 1 .75.75Z" />
                                            </svg>
                                            Copy
                                          </button>
                                        </div>
                                      </div>

                                      <div className="overflow-x-auto rounded-lg bg-slate-800 p-4 font-mono">
                                        <pre className="text-sm text-slate-50">
                                          <code>
                                            {(question as CodeQuestion).code}
                                          </code>
                                        </pre>
                                      </div>
                                    </div>
                                  )}

                                  <div className="mt-4 rounded-lg bg-blue-50 p-3">
                                    <h5 className="mb-1 flex items-center text-xs font-medium text-blue-700">
                                      <Info className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                                      FEEDBACK
                                    </h5>
                                    <p className="text-sm text-blue-700">
                                      {question.feedback}
                                    </p>
                                  </div>
                                </div>
                              </details>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <div className="flex">
                  <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900">
                      Assessment Summary
                    </h3>
                    <div className="mt-2 text-sm text-slate-600">
                      <p>{resultData.overallFeedback}</p>
                      <div className="mt-3 flex items-center">
                        <div
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            resultData.overallScore >= 90
                              ? 'bg-emerald-100 text-emerald-700'
                              : resultData.overallScore >= 80
                                ? 'bg-blue-100 text-blue-700'
                                : resultData.overallScore >= 70
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                          }`}
                        >
                          Overall Score: {resultData.overallScore}/100
                        </div>
                        <span className="mx-2">•</span>
                        <span className="text-xs text-slate-500">
                          {resultData.recommendation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 p-5">
                <h3 className="text-lg font-medium text-slate-900">
                  Video Analysis
                </h3>
              </div>

              <div className="p-5">
                {/* Video Player */}
                <div className="mb-8 overflow-hidden rounded-lg bg-slate-900">
                  <div className="relative aspect-video w-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 cursor-pointer rounded-full bg-blue-600/90 p-5 text-white transition-transform hover:scale-110">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-full w-full"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <Image
                      src="https://images.unsplash.com/photo-1573497161161-c3e73707e25c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                      alt="Video thumbnail"
                      className="h-full w-full object-cover opacity-70"
                      width={2340}
                      height={1500}
                    />

                    {/* Video Controls */}
                    <div className="absolute right-0 bottom-0 left-0 flex items-center bg-gradient-to-t from-slate-900/80 to-transparent p-4">
                      <button className="mr-3 rounded-full bg-white p-2 text-slate-900">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>

                      <div className="flex-1">
                        <div className="h-1 w-full rounded-full bg-slate-600">
                          <div className="h-full w-[35%] rounded-full bg-blue-500"></div>
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-white">
                          <span>12:45</span>
                          <span>38:20</span>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center">
                        <button className="p-2 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                          >
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="p-2 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                          >
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </button>
                        <button className="p-2 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                          >
                            <path d="M4 8h16v13a1 1 0 01-1 1H5a1 1 0 01-1-1V8zm18-2v1H2V6a1 1 0 011-1h5V3a1 1 0 011-1h6a1 1 0 011 1zM10 4v1h4V4h-4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Analysis Summary */}
                <div className="mb-8 rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <h4 className="mb-3 text-base font-medium text-slate-900">
                    Analysis Summary
                  </h4>
                  <p className="mb-5 text-slate-700">
                    {resultData.videoInsights.summary}
                  </p>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <h5 className="mb-2 text-sm font-medium text-slate-900">
                        Key Moments
                      </h5>
                      <div className="space-y-2">
                        {resultData.videoInsights.keyHighlights.map(
                          (highlight, index) => (
                            <div
                              key={index}
                              className="flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
                            >
                              <div className="mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="h-5 w-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">
                                  {highlight.timestamp}
                                </div>
                                <div className="text-sm text-slate-600">
                                  {highlight.description}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="mb-2 text-sm font-medium text-slate-900">
                        Areas for Improvement
                      </h5>
                      <ul className="space-y-2">
                        {resultData.videoInsights.improvementAreas.map(
                          (area, index) => (
                            <li
                              key={index}
                              className="flex items-start rounded-lg border border-slate-200 bg-white p-3"
                            >
                              <div className="mt-0.5 mr-3 flex-shrink-0 text-amber-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="h-5 w-5"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.25 2.25 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.25 2.25 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-slate-700">{area}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-base font-medium text-slate-900">
                    Performance Metrics
                  </h4>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download Video
                    </button>
                    <button className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                      <Share2 className="mr-1.5 h-3.5 w-3.5" />
                      Share Video
                    </button>
                  </div>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-green-50 to-green-100 p-5 text-center">
                    <div className="mb-2 text-sm font-medium text-green-700">
                      Engagement
                    </div>
                    <div className="relative mb-1 h-24 w-24">
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeDasharray={`${resultData.videoInsights.engagement} 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-green-600">
                        {resultData.videoInsights.engagement}%
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-blue-50 to-blue-100 p-5 text-center">
                    <div className="mb-2 text-sm font-medium text-blue-700">
                      Confidence
                    </div>
                    <div className="relative mb-1 h-24 w-24">
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray={`${resultData.videoInsights.confidence} 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-blue-600">
                        {resultData.videoInsights.confidence}%
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-purple-50 to-purple-100 p-5 text-center">
                    <div className="mb-2 text-sm font-medium text-purple-700">
                      Clarity
                    </div>
                    <div className="relative mb-1 h-24 w-24">
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="3"
                          strokeDasharray={`${resultData.videoInsights.clarity} 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-purple-600">
                        {resultData.videoInsights.clarity}%
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="mb-4 text-base font-medium text-slate-900">
                  Key Insights
                </h4>
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                  {resultData.videoInsights.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Star className="h-4 w-4" />
                      </div>
                      <h5 className="mb-1 text-sm font-medium text-slate-900">
                        {insight.title}
                      </h5>
                      <p className="text-sm text-slate-600">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div className="mb-4 sm:mb-0">
                    <h4 className="font-medium text-slate-900">
                      Review the Interview
                    </h4>
                    <p className="text-sm text-slate-600">
                      Complete video recording is available
                    </p>
                  </div>
                  <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Watch Interview
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScreeningResultsPage;
