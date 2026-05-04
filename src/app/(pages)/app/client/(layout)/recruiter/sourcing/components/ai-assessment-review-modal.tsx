import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { IJobPostingAssessment } from '@/lib/shared/models/domain/client/job.posting.assessment.domain';
import { cn, enumToReadableText, formatEnumValue } from '@/lib/utils';
import {
  CheckCircle,
  AlertCircle,
  Info,
  Award,
  ListChecks,
  ShieldCheck,
  FileText,
  Copy as CopyIcon,
} from 'lucide-react';
import React, { useState } from 'react';

interface AiAssessmentReviewModalProps {
  open: boolean;
  onClose: () => void;
  assessment: IJobPostingAssessment | null;
}

// --- Helper: ProgressBar for Quality Scores ---
function ProgressBar({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || isNaN(value)) {
    return <span className="ml-2 text-xs text-gray-400">N/A</span>;
  }
  let color = 'bg-green-500';
  if (value < 0.5) color = 'bg-red-500';
  else if (value < 0.8) color = 'bg-yellow-500';
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <div className="relative h-2 w-24 rounded bg-gray-200">
        <div
          className={`absolute top-0 left-0 h-2 rounded ${color}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-medium">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

// --- Helper: Copyable, Collapsible Job Posting Text ---
function JobPostingTextCard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const MAX_LINES = 8;
  const lines = text?.split('\n') || [];
  const isLong = lines.length > MAX_LINES;
  const displayText =
    expanded || !isLong ? text : lines.slice(0, MAX_LINES).join('\n');
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="relative">
      <button
        className="absolute top-2 right-2 rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={handleCopy}
        aria-label="Copy job posting text"
        type="button"
      >
        <CopyIcon className="h-4 w-4" />
        <span className="sr-only">Copy</span>
      </button>
      {copied && (
        <span className="tex t-xs absolute top-2 right-10 text-green-600 dark:text-green-400">
          Copied!
        </span>
      )}
      <pre className="max-h-68 overflow-x-auto rounded border border-gray-100 bg-gray-50 p-2 text-xs whitespace-pre-wrap dark:border-gray-800 dark:bg-gray-900">
        {displayText}
      </pre>
      {isLong && (
        <button
          className="text-primary hover:text-primary/80 mt-1 text-xs underline"
          onClick={() => setExpanded((v) => !v)}
          type="button"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

export function AiAssessmentReviewModal({
  open,
  onClose,
  assessment,
}: AiAssessmentReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'key-areas'>(
    'overview'
  );
  if (!assessment) return null;

  // Recommendation badge styling
  const recommendationStyle =
    assessment?.recommendation === 'HIGHLY_RECOMMENDED' ||
    assessment?.recommendation === 'RECOMMENDED'
      ? {
          color:
            'bg-green-100 border-green-100 font-bold text-xs text-green-800 dark:bg-green-100/20 dark:border-green-700 dark:text-green-800',
          icon: CheckCircle,
        }
      : {
          color:
            'bg-red-100 border-red-100 font-bold text-xs text-red-800 dark:bg-red-100/20 dark:border-red-700 dark:text-red-800',
          icon: AlertCircle,
        };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto bg-white dark:bg-gray-900 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700">
        <DialogHeader>
          <DialogTitle className="mb-4 flex justify-between text-xl font-bold dark:text-white">
            <span>AI Assessment Review</span>
            <div className="flex items-center justify-end">
              <div
                className={cn(
                  recommendationStyle.color,
                  'mr-4 flex items-center gap-1 rounded-full border px-3 py-1'
                )}
              >
                <recommendationStyle.icon className="h-3 w-3" />
                {formatEnumValue(assessment?.recommendation || '')}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Overall Feedback */}
        <div className="bg-background mb-6 rounded-lg p-4 dark:bg-gray-800">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold dark:text-white">
            <Info className="text-primary h-5 w-5" /> Overall Feedback
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {assessment?.overallFeedback || 'No feedback provided.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-2">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'overview'
                  ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('key-areas')}
              className={cn(
                'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'key-areas'
                  ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              )}
            >
              Key Assessment Areas
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="mb-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Strengths */}
                <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-medium dark:text-white">
                    <Award className="h-5 w-5 text-green-500" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {assessment?.strengths?.length ? (
                      assessment.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" />
                          <span className="text-sm dark:text-gray-300">
                            {strength}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No strengths listed.</li>
                    )}
                  </ul>
                </div>
                {/* Areas for Improvement */}
                <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-medium dark:text-white">
                    <AlertCircle className="h-5 w-5 text-amber-500" /> Areas for
                    Improvement
                  </h3>
                  <ul className="space-y-2">
                    {assessment?.areasForImprovement?.length ? (
                      assessment.areasForImprovement.map((area, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="mt-1 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                          <span className="text-sm dark:text-gray-300">
                            {area}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No areas listed.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'key-areas' && (
            <div>
              {/* Skills */}
              <div className="mb-6">
                <div className="bg-background rounded-lg p-6 dark:bg-gray-800">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold dark:text-white">
                    <ListChecks className="text-primary h-5 w-5" /> Skills &
                    Relevance
                  </h2>
                  <div className="mb-6">
                    <span className="font-semibold">Identified Skills:</span>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {assessment.identifiedSkills?.length ? (
                        assessment.identifiedSkills.map((skill, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {enumToReadableText(skill)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">
                          No skills identified.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-6">
                    <span className="font-semibold">Required Skills:</span>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {assessment.requiredSkills?.length ? (
                        assessment.requiredSkills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {enumToReadableText(skill)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-6">
                    <span className="font-semibold">Preferred Skills:</span>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {assessment.preferredSkills?.length ? (
                        assessment.preferredSkills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {enumToReadableText(skill)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-6">
                    <span className="font-semibold">Industry Relevance:</span>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {assessment.industryRelevance?.length ? (
                        assessment.industryRelevance.map((ind, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {formatEnumValue(ind)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold">Role Clarity:</span>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {assessment.roleClarity?.length ? (
                        assessment.roleClarity.map((role, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance & Quality */}
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Compliance & Quality Card */}
                <div className="bg-background rounded-lg border border-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
                    <ShieldCheck className="text-primary h-5 w-5" />
                    <span className="text-base font-semibold dark:text-white">
                      Compliance & Quality
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold">Compliance Issues:</span>
                    <ul className="mt-1 ml-4 list-disc text-yellow-700 dark:text-yellow-300">
                      {assessment.complianceIssues?.length ? (
                        assessment.complianceIssues.map((c, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-1 text-sm"
                          >
                            {c}
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center gap-1 text-sm text-green-700 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 text-green-500" /> No
                          compliance issues.
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="mb-4 flex gap-2">
                    <Badge
                      variant={
                        assessment.diversityCompliance ? 'success' : 'error'
                      }
                      className="px-2 py-0.5 text-xs"
                    >
                      Diversity: {assessment.diversityCompliance ? 'Yes' : 'No'}
                    </Badge>
                    <Badge
                      variant={assessment.legalCompliance ? 'success' : 'error'}
                      className="px-2 py-0.5 text-xs"
                    >
                      Legal: {assessment.legalCompliance ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-semibold">Quality Scores:</span>
                    <ul className="mt-1 ml-4 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-24 text-xs text-gray-600 dark:text-gray-300">
                          Title
                        </span>
                        <ProgressBar value={assessment.titleQuality ?? null} />
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-24 text-xs text-gray-600 dark:text-gray-300">
                          Description
                        </span>
                        <ProgressBar
                          value={assessment.descriptionQuality ?? null}
                        />
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-24 text-xs text-gray-600 dark:text-gray-300">
                          Requirements
                        </span>
                        <ProgressBar
                          value={assessment.requirementsQuality ?? null}
                        />
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-24 text-xs text-gray-600 dark:text-gray-300">
                          Compensation
                        </span>
                        <ProgressBar
                          value={assessment.compensationQuality ?? null}
                        />
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Job Posting Text Card */}
                <div className="bg-background rounded-lg border border-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
                    <FileText className="text-primary h-5 w-5" />
                    <span className="text-base font-semibold dark:text-white">
                      Job Posting Text
                    </span>
                  </div>
                  <JobPostingTextCard text={assessment.jobPostingText} />
                </div>
              </div>

              {/* Analysis Cards in 2-column grid */}
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Compensation Analysis Card */}
                <div className="bg-background rounded-lg border border-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
                    <Info className="text-primary h-5 w-5" />
                    <span className="text-base font-semibold dark:text-white">
                      Compensation Analysis
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {assessment.compensationAnalysis}
                  </div>
                </div>

                {/* Job Description Quality Card */}
                <div className="bg-background rounded-lg border border-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
                    <Info className="text-primary h-5 w-5" />
                    <span className="text-base font-semibold dark:text-white">
                      Job Description Quality
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {assessment.jobDescriptionQuality}
                  </div>
                </div>

                {/* Requirements Clarity Card */}
                <div className="bg-background rounded-lg border border-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
                    <Info className="text-primary h-5 w-5" />
                    <span className="text-base font-semibold dark:text-white">
                      Requirements Clarity
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {assessment.requirementsClarity}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
