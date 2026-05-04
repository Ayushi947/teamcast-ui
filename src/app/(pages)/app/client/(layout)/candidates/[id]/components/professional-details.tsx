import { useState } from 'react';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { ProfileContainer } from './cards/profile-card';
import { ExperienceContainer } from './cards/experience-card';
import { EducationContainer } from './cards/education-card';
import { ICandidateProfile, IResume } from '@/lib/shared';

interface ProfessionalDetailsProps {
  profile: ICandidateProfile;
  resume: IResume;
}

export const ProfessionalDetails = ({
  profile,
  resume,
}: ProfessionalDetailsProps) => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { key: 'profile', label: 'Basic Information' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
  ];

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-xl font-bold dark:text-white">
        Professional Details
      </h2>
      <p className="text-muted-foreground mb-4 text-sm dark:text-gray-400">
        Manage your professional details and preferences to improve your profile
        completeness.
      </p>

      <CustomTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <div className="mt-4">
        {activeTab === 'profile' && (
          <ProfileContainer profile={profile} resume={resume} />
        )}
        {activeTab === 'experience' && <ExperienceContainer />}
        {activeTab === 'education' && <EducationContainer />}
      </div>
    </div>
  );
};
