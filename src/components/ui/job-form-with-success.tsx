'use client';

import { useState } from 'react';
import { ComprehensiveJobForm } from '@/app/(pages)/app/client/(layout)/recruiter/sourcing/components/comprehensive-job-form';
import { JobPostingSuccessDialog } from './job-posting-success-dialog';

interface JobFormWithSuccessProps {
  onClose: () => void;
  onSuccess: () => void;
  job?: any;
  isModal?: boolean;
}

export function JobFormWithSuccess({
  onClose,
  onSuccess,
  job,
  isModal = true,
}: JobFormWithSuccessProps) {
  const [showJobForm, setShowJobForm] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdJobData, setCreatedJobData] = useState<{
    jobId: string;
    jobTitle: string;
  } | null>(null);

  const handleJobCreated = (jobId: string, jobTitle: string) => {
    setCreatedJobData({ jobId, jobTitle });
    setShowSuccessDialog(true);
  };

  const handleEditJob = () => {
    setShowSuccessDialog(false);
    setShowJobForm(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    setCreatedJobData(null);
    onSuccess();
  };

  const handleCloseForm = () => {
    setShowJobForm(false);
    onClose();
  };

  return (
    <>
      {/* Job Form */}
      {showJobForm && (
        <ComprehensiveJobForm
          onClose={handleCloseForm}
          onSuccess={() => {
            // For editing jobs, call the success callback directly
            if (job) {
              onSuccess();
            }
            // For new jobs, the success dialog will be shown via onJobCreated
          }}
          job={job}
          isModal={isModal}
          onJobCreated={handleJobCreated}
        />
      )}

      {/* Success Dialog (only shown for new jobs) */}
      {showSuccessDialog && createdJobData && (
        <JobPostingSuccessDialog
          isOpen={showSuccessDialog}
          onClose={handleCloseSuccess}
          jobId={createdJobData.jobId}
          jobTitle={createdJobData.jobTitle}
          onEditJob={handleEditJob}
        />
      )}
    </>
  );
}
