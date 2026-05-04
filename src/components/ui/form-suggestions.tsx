'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  DollarSign,
  Star,
  Briefcase,
  TrendingUp,
  Award,
  MapPin,
  FileText,
} from 'lucide-react';

interface FormSuggestion {
  id: string;
  title: string;
  description: string;
  tips: string[];
  icon: React.ComponentType<{ className?: string }>;
  priority: 'high' | 'medium' | 'low';
  category: 'required' | 'recommended' | 'optional';
}

interface FormSuggestionsProps {
  stage: string;
  className?: string;
}

const STAGE_SUGGESTIONS: Record<string, FormSuggestion[]> = {
  basic: [
    {
      id: 'job-title',
      title: 'Craft a Clear Job Title',
      description:
        'A specific, searchable job title helps attract the right candidates.',
      tips: [
        'Use standard industry titles (e.g., "Senior Software Engineer" not "Code Ninja")',
        'Include seniority level (Junior, Senior, Lead, Principal)',
        'Avoid internal jargon or company-specific terms',
        'Keep it under 60 characters for better visibility',
      ],
      icon: Briefcase,
      priority: 'high',
      category: 'required',
    },
    {
      id: 'job-description',
      title: 'Write a Compelling Description',
      description:
        'A detailed description sets clear expectations and attracts quality candidates.',
      tips: [
        'Start with a brief overview of the role and its impact',
        'Describe day-to-day responsibilities clearly',
        'Mention growth opportunities and career path',
        'Include team structure and collaboration aspects',
        'Aim for 150-300 words for optimal engagement',
      ],
      icon: FileText,
      priority: 'high',
      category: 'required',
    },
    {
      id: 'department',
      title: 'Specify Department',
      description:
        'Help candidates understand the team structure and reporting lines.',
      tips: [
        'Use clear department names (Engineering, Marketing, Sales)',
        'Consider sub-departments for large organizations',
        'This helps with internal organization and candidate expectations',
      ],
      icon: Users,
      priority: 'medium',
      category: 'recommended',
    },
  ],
  details: [
    {
      id: 'job-type',
      title: 'Define Employment Type',
      description: 'Clear employment terms help filter the right candidates.',
      tips: [
        'Employee: Full-time permanent position with benefits',
        'Contractor: Project-based or temporary work',
        'Freelancer: Independent contractor for specific tasks',
        'Intern: Learning-focused temporary position',
      ],
      icon: Target,
      priority: 'high',
      category: 'required',
    },
    {
      id: 'experience',
      title: 'Set Realistic Experience Requirements',
      description: 'Balance experience needs with candidate availability.',
      tips: [
        '0-2 years: Entry level, recent graduates',
        '2-5 years: Mid-level, some industry experience',
        '5+ years: Senior level, leadership potential',
        'Consider equivalent experience, not just years',
      ],
      icon: TrendingUp,
      priority: 'high',
      category: 'required',
    },
    {
      id: 'reporting',
      title: 'Clarify Reporting Structure',
      description:
        'Help candidates understand their place in the organization.',
      tips: [
        'Specify the direct manager role/title',
        'Mention team size if managing others',
        'Include any cross-functional collaboration',
        'Be specific about hierarchy level',
      ],
      icon: Users,
      priority: 'medium',
      category: 'required',
    },
  ],
  compensation: [
    {
      id: 'salary-range',
      title: 'Set Competitive Salary Range',
      description: 'Transparent compensation attracts serious candidates.',
      tips: [
        'Research market rates for similar roles',
        'Consider total compensation, not just base salary',
        'Leave room for negotiation (10-20% range)',
        'Factor in location and remote work policies',
        'Use appropriate units (thousands, lakhs, crores) for clarity',
      ],
      icon: DollarSign,
      priority: 'high',
      category: 'required',
    },
    {
      id: 'benefits',
      title: 'Highlight Benefits & Perks',
      description:
        'Comprehensive benefits package can differentiate your offer.',
      tips: [
        'Health insurance and medical benefits',
        'Retirement plans and financial benefits',
        'Professional development opportunities',
        'Work-life balance perks (flexible hours, PTO)',
        'Unique company perks (gym, meals, events)',
      ],
      icon: Award,
      priority: 'medium',
      category: 'recommended',
    },
    {
      id: 'equity',
      title: 'Consider Equity Compensation',
      description:
        'Equity can be attractive for startup and growth-stage companies.',
      tips: [
        'Stock options for startups and high-growth companies',
        'RSUs for established companies',
        'Clearly communicate vesting schedules',
        'Explain the potential value and risks',
      ],
      icon: TrendingUp,
      priority: 'low',
      category: 'optional',
    },
  ],
  requirements: [
    {
      id: 'skills',
      title: 'Define Required vs Preferred Skills',
      description: 'Clear skill requirements help candidates self-assess fit.',
      tips: [
        'List 3-5 must-have technical skills',
        'Include 2-3 soft skills (communication, teamwork)',
        'Separate required from nice-to-have skills',
        'Be specific about proficiency levels needed',
        'Consider including learning opportunities',
      ],
      icon: Star,
      priority: 'high',
      category: 'required',
    },
    {
      id: 'responsibilities',
      title: 'Outline Key Responsibilities',
      description:
        'Clear responsibilities help candidates understand the role scope.',
      tips: [
        'List 5-7 main responsibilities',
        'Use action verbs (develop, manage, collaborate)',
        'Include both individual and team responsibilities',
        'Mention any special projects or initiatives',
        'Balance routine tasks with growth opportunities',
      ],
      icon: CheckCircle2,
      priority: 'high',
      category: 'required',
    },
    {
      id: 'tags',
      title: 'Add Relevant Tags',
      description: 'Tags improve searchability and help categorize the role.',
      tips: [
        'Include technology stack (React, Python, AWS)',
        'Add methodology tags (Agile, Scrum, DevOps)',
        'Include industry-specific terms',
        'Use standard terminology for better matching',
      ],
      icon: Target,
      priority: 'medium',
      category: 'recommended',
    },
  ],
  preferences: [
    {
      id: 'education',
      title: 'Educational Preferences',
      description:
        'Specify educational background preferences without being overly restrictive.',
      tips: [
        'Consider equivalent experience over strict degree requirements',
        'List preferred universities if relevant to role',
        'Include relevant certifications or bootcamps',
        'Focus on skills and potential over credentials',
      ],
      icon: Star,
      priority: 'low',
      category: 'optional',
    },
    {
      id: 'location',
      title: 'Location Preferences',
      description: 'Help candidates understand work location expectations.',
      tips: [
        'List preferred cities or regions',
        'Clarify remote work policies',
        'Mention any travel requirements',
        'Consider time zone preferences for remote roles',
      ],
      icon: MapPin,
      priority: 'medium',
      category: 'recommended',
    },
    {
      id: 'industry',
      title: 'Industry Experience',
      description:
        'Relevant industry experience can be valuable for certain roles.',
      tips: [
        'List industries where experience would be beneficial',
        'Consider adjacent industries with transferable skills',
        'Balance industry knowledge with fresh perspectives',
        'Focus on domain expertise when truly necessary',
      ],
      icon: Briefcase,
      priority: 'low',
      category: 'optional',
    },
  ],
};

export function FormSuggestions({ stage, className }: FormSuggestionsProps) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<string[]>([]);
  const suggestions = STAGE_SUGGESTIONS[stage] || [];

  const toggleSuggestion = (id: string) => {
    setExpandedSuggestions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'required':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'recommended':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'optional':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <Card
      className={cn(
        'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Helpful Tips for This Stage
          </h3>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion) => {
            const isExpanded = expandedSuggestions.includes(suggestion.id);
            const IconComponent = suggestion.icon;

            return (
              <div
                key={suggestion.id}
                className="rounded-lg border border-blue-200 bg-white dark:border-blue-800 dark:bg-blue-950/10"
              >
                <Button
                  variant="ghost"
                  onClick={() => toggleSuggestion(suggestion.id)}
                  className="h-auto w-full justify-between p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {suggestion.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {suggestion.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        'text-xs',
                        getPriorityColor(suggestion.priority)
                      )}
                    >
                      {suggestion.priority}
                    </Badge>
                    <Badge
                      className={cn(
                        'text-xs',
                        getCategoryColor(suggestion.category)
                      )}
                    >
                      {suggestion.category}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </Button>

                {isExpanded && (
                  <div className="px-3 pb-3">
                    <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/10">
                      <ul className="space-y-2">
                        {suggestion.tips.map((tip, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface FormProgressProps {
  currentStage: string;
  stages: Array<{ id: string; title: string; completed?: boolean }>;
  className?: string;
}

export function FormProgress({
  currentStage,
  stages,
  className,
}: FormProgressProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Progress</span>
        <span>
          {stages.filter((s) => s.completed).length} of {stages.length}{' '}
          completed
        </span>
      </div>

      <div className="flex items-center gap-2">
        {stages.map((stage, index) => {
          const isActive = stage.id === currentStage;
          const isCompleted = stage.completed;
          const isAccessible = index === 0 || stages[index - 1]?.completed;

          return (
            <div key={stage.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-blue-500 text-white'
                      : isAccessible
                        ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {index < stages.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-8',
                    isCompleted
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {stages.find((s) => s.id === currentStage)?.title}
      </div>
    </div>
  );
}
