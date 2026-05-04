import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog';
import { IResumeAssessment } from '@/lib/shared';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CommonTags } from '@/components/ui/common-tags';
import StrengthsCard from '@/components/ui/strengths-card';
import AreasOfImprovementsCard from '@/components/ui/areas-of-improvements-card';
import { RecommendationBadge } from '@/components/ui/recommendation-badge';

interface ResumeAssessmentDialogProps {
  resumeAssessment: IResumeAssessment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResumeAssessmentDialog({
  resumeAssessment,
  open,
  onOpenChange,
}: ResumeAssessmentDialogProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'key-assessment-areas'
  >('overview');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto bg-white dark:bg-gray-900 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700">
        <DialogHeader>
          <DialogTitle className="mb-4 flex justify-between text-2xl font-bold dark:text-white">
            <p>Resume Assessment</p>
            <div className="flex items-center justify-end">
              <RecommendationBadge
                recommendation={resumeAssessment?.recommendation}
              />
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Overall Feedback */}
        <div className="bg-background mb-6 rounded-lg p-4 dark:bg-gray-800">
          <h2 className="mb-2 text-lg font-semibold dark:text-white">
            Overall Feedback
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {resumeAssessment?.overallFeedback}
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
              onClick={() => setActiveTab('key-assessment-areas')}
              className={cn(
                'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'key-assessment-areas'
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
              <div className="bg-background mb-6 rounded-lg p-4 dark:bg-gray-800">
                <h2 className="mb-2 text-lg font-semibold dark:text-white">
                  Experience Summary
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {resumeAssessment?.experienceSummary}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Key Strengths */}
                <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                  <h3 className="mb-3 text-base font-medium dark:text-white">
                    Key Strengths
                  </h3>
                  <StrengthsCard
                    className="grid grid-cols-1 gap-2 md:grid-cols-1"
                    values={resumeAssessment?.strengths}
                  />
                </div>

                {/* Areas for Improvement */}
                <div className="bg-background rounded-lg p-4 dark:bg-gray-800">
                  <h3 className="mb-3 text-base font-medium dark:text-white">
                    Areas for Improvement
                  </h3>
                  <AreasOfImprovementsCard
                    className="grid grid-cols-1 gap-2 md:grid-cols-1"
                    values={resumeAssessment?.areasForImprovement}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'key-assessment-areas' && (
            <div>
              {/* Technical Skills */}
              <div className="mb-4">
                <div className="bg-background mb-6 rounded-lg p-4 dark:bg-gray-800">
                  <h2 className="mb-2 text-lg font-semibold dark:text-white">
                    Education Summary
                  </h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {resumeAssessment?.educationSummary}
                  </p>
                </div>
                <h3 className="text-md mb-3 font-semibold dark:text-white">
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeAssessment?.technicalSkills.length > 0 ? (
                    <CommonTags
                      values={resumeAssessment?.technicalSkills}
                      maxVisible={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No technical skills identified
                    </p>
                  )}
                </div>
              </div>

              {/* Soft Skills */}
              <div className="mb-6">
                <h3 className="text-md mb-3 font-semibold dark:text-white">
                  Soft Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeAssessment?.softSkills.length > 0 ? (
                    <CommonTags
                      values={resumeAssessment?.softSkills}
                      maxVisible={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No soft skills identified
                    </p>
                  )}
                </div>
              </div>

              {/* Industry Fit */}
              <div className="mb-6">
                <h3 className="text-md mb-3 font-semibold dark:text-white">
                  Industry Fit
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeAssessment?.industriesFit.length > 0 ? (
                    <CommonTags
                      values={resumeAssessment?.industriesFit}
                      maxVisible={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No industry fit identified
                    </p>
                  )}
                </div>
              </div>

              {/* Role Fit */}
              <div>
                <h3 className="text-md mb-3 font-semibold dark:text-white">
                  Role Fit
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeAssessment?.jobRolesFit.length > 0 ? (
                    <CommonTags
                      values={resumeAssessment?.jobRolesFit}
                      maxVisible={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No role fit identified
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
