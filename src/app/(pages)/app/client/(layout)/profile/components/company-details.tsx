import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { BasicProfileForm } from './forms/basic-profile-form';
import { AddressProfileForm } from './forms/address-profile-form';
import { SocialProfileForm } from './forms/social-profile-form';
import { CultureProfileForm } from './forms/culture-profile-form';
import { FinancialDataForm } from './forms/financial-data-form';
import { DocumentManagementForm } from './forms/document-management-form/document-management-form';
import { IClientProfile } from '@/lib/shared';

interface CompanyDetailsProps {
  onFormSuccess?: () => void;
  clientProfile: IClientProfile;
}

export const CompanyDetails = ({
  clientProfile,
  onFormSuccess,
}: CompanyDetailsProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const tabs = [
    { key: 'basic', label: 'Company Information' },
    { key: 'address', label: 'Locations' },
    { key: 'social', label: 'Social Profiles' },
    { key: 'culture', label: 'Company Culture' },
    { key: 'documents', label: 'Documents' },
  ];

  const handleTabChange = useCallback(
    (newTab: string) => {
      if (newTab !== activeTab) {
        setIsTransitioning(true);
        setActiveTab(newTab);
      }
    },
    [activeTab]
  );

  const tabVariants = {
    initial: {
      opacity: 0,
      x: 20,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1], // Custom ease for smoother feel
        opacity: { duration: 0.25 },
        scale: { duration: 0.35 },
      },
    },
    exit: {
      opacity: 0,
      x: -15,
      scale: 0.98,
      transition: {
        duration: 0.25,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicProfileForm onSuccess={onFormSuccess} />;
      case 'address':
        return <AddressProfileForm onSuccess={onFormSuccess} />;
      case 'social':
        return <SocialProfileForm onSuccess={onFormSuccess} />;
      case 'culture':
        return <CultureProfileForm onSuccess={onFormSuccess} />;
      case 'financial':
        return <FinancialDataForm onSuccess={onFormSuccess} />;
      case 'documents':
        return (
          <DocumentManagementForm
            clientProfile={clientProfile}
            onNavigateToLocation={() => handleTabChange('address')}
          />
        );
      default:
        return <BasicProfileForm onSuccess={onFormSuccess} />;
    }
  };

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-xl font-bold dark:text-white">
        Company Details
      </h2>
      <p className="text-muted-foreground mb-4 text-sm dark:text-gray-400">
        Manage your company details and settings to improve your profile
        completeness and attract top talent.
      </p>

      <CustomTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content with smooth transitions */}
      <div className="relative mt-4 min-h-[500px] overflow-hidden">
        <AnimatePresence
          mode="wait"
          onExitComplete={() => setIsTransitioning(false)}
        >
          <motion.div
            key={activeTab}
            variants={tabVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full will-change-transform"
            style={{
              backfaceVisibility: 'hidden',
              perspective: 1000,
            }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Optional: Subtle loading overlay during transitions */}
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="bg-background/20 pointer-events-none absolute inset-0 backdrop-blur-[1px]"
          />
        )}
      </div>
    </div>
  );
};
