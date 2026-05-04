import { Card } from '@/components/ui/card';
import { CommonTags } from '@/components/ui/common-tags';
import { ICandidateProfile, IResume } from '@/lib/shared';

interface ProfessionalSummaryProps {
  profile?: ICandidateProfile;
  resume?: IResume;
}

export const ProfessionalSummary = ({ resume }: ProfessionalSummaryProps) => {
  return (
    <Card className="flex h-full flex-1 flex-col bg-white p-4 dark:bg-gray-800">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold dark:text-white">
              Professional Summary
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {resume?.summary ||
              'No professional summary available. Add a summary to improve your profile.'}
          </p>
        </div>
        <div>
          {resume?.resumeSkills && resume.resumeSkills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 font-semibold dark:text-white">Skills</p>
              <div className="flex flex-wrap gap-2">
                <CommonTags values={resume.resumeSkills} maxVisible={4} />
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {resume?.industries && resume.industries.length > 0 && (
              <div>
                <p className="mb-2 font-semibold dark:text-white">Industries</p>
                <div className="flex flex-wrap gap-2">
                  <CommonTags values={resume.industries} maxVisible={4} />
                </div>
              </div>
            )}

            {resume?.languages && resume.languages.length > 0 && (
              <div>
                <p className="mb-2 font-semibold dark:text-white">Languages</p>
                <div className="flex flex-wrap gap-2">
                  <CommonTags values={resume.languages} maxVisible={4} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
