import { useState } from 'react';
import { Profile } from '@/components/app/candidate/profile/profile';
import { Experience } from '@/components/app/candidate/experience/experience';
import { Education } from '@/components/app/candidate/education/education';
import { Preferences } from '@/components/app/candidate/preferences/preferences';
import { CustomTabs } from '@/components/ui/custom-tabs';

export const ProfessionalDetails = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { key: 'profile', label: 'Basic Information' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
    { key: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="mt-6" data-tour="professional-details-section">
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
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'experience' && <Experience />}
        {activeTab === 'education' && <Education />}
        {activeTab === 'preferences' && <Preferences />}
      </div>
    </div>
  );
};
