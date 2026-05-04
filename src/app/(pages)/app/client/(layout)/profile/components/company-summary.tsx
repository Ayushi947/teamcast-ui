import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { IClientProfile } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';

interface CompanySummaryProps {
  profile?: IClientProfile;
  onEditClick: () => void;
}

export const CompanySummary = ({
  profile,
  onEditClick,
}: CompanySummaryProps) => {
  return (
    <Card className="flex h-full flex-1 flex-col bg-white p-6 dark:bg-gray-800">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold dark:text-white">
              Company Overview
            </p>
            <Button variant="ghost" size="icon" onClick={onEditClick}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {profile?.basic?.description
              ? profile.basic.description.length > 1000
                ? profile.basic.description.slice(0, 1000) + '......'
                : profile.basic.description
              : 'No company description available. Add a description to improve your profile.'}
          </p>
        </div>
        <div>
          {profile?.basic?.benefits && profile.basic.benefits.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 font-semibold dark:text-white">Benefits</p>
              <div className="flex flex-wrap gap-2">
                {profile.basic.benefits.slice(0, 8).map((benefit, index) => (
                  <div
                    key={index}
                    className="text-muted-foreground rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300"
                  >
                    {formatEnumValue(benefit)}
                  </div>
                ))}
                {profile.basic.benefits.length > 8 && (
                  <div className="rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300">
                    +{profile.basic.benefits.length - 8} more
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profile?.basic?.industry && (
              <div>
                <p className="mb-2 font-semibold dark:text-white">Industry</p>
                <div className="flex flex-wrap gap-2">
                  <div className="text-muted-foreground rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300">
                    {formatEnumValue(profile.basic.industry)}
                  </div>
                </div>
              </div>
            )}

            {(profile?.basic?.companyType || profile?.basic?.stage) && (
              <div>
                <p className="mb-2 font-semibold dark:text-white">
                  Type & Stage
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile?.basic?.companyType && (
                    <div className="text-muted-foreground rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300">
                      {formatEnumValue(profile.basic.companyType)}
                    </div>
                  )}
                  {profile?.basic?.stage && (
                    <div className="text-muted-foreground rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-600 dark:text-gray-300">
                      {formatEnumValue(profile.basic.stage)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
