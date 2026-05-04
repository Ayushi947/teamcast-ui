'use client';

import { Button } from '@/components/ui/button';
import { Award, GraduationCap, Plus } from 'lucide-react';
import { EducationCard } from './education-card';
import { EducationForm } from './education-form';
import { CertificationCard } from './certification-card';
import { CertificationForm } from './certification-form';
import { useState, useEffect } from 'react';
import {
  IResumeEducation,
  IResumeCertification,
  IResumeEducationCreate,
  IResumeEducationUpdate,
  IResumeCertificationCreate,
  IResumeCertificationUpdate,
  logger,
} from '@/lib/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidateResumeService } from '@/lib/services/services';
import { toast } from 'sonner';

export function Education() {
  const [isEducationFormOpen, setIsEducationFormOpen] = useState(false);
  const [isCertificationFormOpen, setIsCertificationFormOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<
    IResumeEducation | undefined
  >();
  const [selectedCertification, setSelectedCertification] = useState<
    IResumeCertification | undefined
  >();
  const [draftEducations, setDraftEducations] = useState<IResumeEducation[]>(
    []
  );
  const [draftCertifications, setDraftCertifications] = useState<
    IResumeCertification[]
  >([]);
  const [isDraftMode, setIsDraftMode] = useState(false);

  const queryClient = useQueryClient();

  const { data: educations, isLoading: isLoadingEducations } = useQuery({
    queryKey: ['educations'],
    queryFn: async () => {
      const response = await candidateResumeService.getEducationList();
      return Array.isArray(response) ? response : [response];
    },
    enabled: !isDraftMode,
  });

  const { data: certifications, isLoading: isLoadingCertifications } = useQuery(
    {
      queryKey: ['certifications'],
      queryFn: async () => {
        const response = await candidateResumeService.getCertifications();
        return Array.isArray(response) ? response : [response];
      },
      enabled: !isDraftMode,
    }
  );

  const createEducationMutation = useMutation({
    mutationFn: async (data: IResumeEducationCreate) => {
      const response = await candidateResumeService.createEducation(data);
      return response;
    },
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['educations'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-resume'] });

      // Force refetch to update UI immediately - wait for completion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['educations'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-resume'] }),
      ]);
      toast.success('Education added successfully');
      setIsEducationFormOpen(false);
    },
    onError: (error) => {
      logger.error('Error creating education:', error);
      const fullMessage = error?.message || '';
      const extractedMessage =
        fullMessage.split(':').pop()?.trim() || 'Failed to add education';
      toast.error(extractedMessage);
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: async (data: IResumeEducationUpdate) => {
      const response = await candidateResumeService.updateEducation(
        data.id,
        data
      );
      return response;
    },
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['educations'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-resume'] });

      // Force refetch to update UI immediately - wait for completion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['educations'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-resume'] }),
      ]);
      toast.success('Education updated successfully');
      setIsEducationFormOpen(false);
    },
    onError: (error) => {
      logger.error('Error updating education:', error);
      toast.error('Failed to update education');
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: string) => {
      await candidateResumeService.deleteEducation(id);
    },
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['educations'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-resume'] });

      // Force refetch to update UI immediately - wait for completion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['educations'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-resume'] }),
      ]);
      toast.success('Education deleted successfully');
    },
    onError: (error) => {
      logger.error('Error deleting education:', error);
      toast.error('Failed to delete education');
    },
  });

  const createCertificationMutation = useMutation({
    mutationFn: async (data: IResumeCertificationCreate) => {
      const response = await candidateResumeService.createCertification(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      toast.success('Certification added successfully');
      setIsCertificationFormOpen(false);
    },
    onError: (error) => {
      logger.error('Error creating certification:', error);
      toast.error('Failed to add certification');
    },
  });

  const updateCertificationMutation = useMutation({
    mutationFn: async (data: IResumeCertificationUpdate & { id: string }) => {
      const { id, ...updateData } = data;
      const response = await candidateResumeService.updateCertification(
        id,
        updateData
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      toast.success('Certification updated successfully');
      setIsCertificationFormOpen(false);
    },
    onError: (error) => {
      logger.error('Error updating certification:', error);
      toast.error('Failed to update certification');
    },
  });

  const deleteCertificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await candidateResumeService.deleteCertification(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      toast.success('Certification deleted successfully');
    },
    onError: (error) => {
      logger.error('Error deleting certification:', error);
      toast.error('Failed to delete certification');
    },
  });

  const handleEducationSubmit = async (data: IResumeEducationCreate) => {
    if (selectedEducation) {
      await updateEducationMutation.mutateAsync({
        ...data,
        id: selectedEducation.id,
      });
    } else {
      await createEducationMutation.mutateAsync(data);
    }
  };

  const handleCertificationSubmit = async (
    data: IResumeCertificationCreate
  ) => {
    if (selectedCertification) {
      const updateData: IResumeCertificationUpdate = {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      };
      await updateCertificationMutation.mutateAsync({
        ...updateData,
        id: selectedCertification.id,
      });
    } else {
      const createData: IResumeCertificationCreate = {
        name: data.name,
        issuer: data.issuer,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        credentialId: data.credentialId,
        credentialUrl: data.credentialUrl,
        level: data.level,
        category: data.category,
        description: data.description,
      };
      await createCertificationMutation.mutateAsync(createData);
    }
  };

  const handleEducationDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this education?')) {
      await deleteEducationMutation.mutateAsync(id);
    }
  };

  const handleCertificationDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      await deleteCertificationMutation.mutateAsync(id);
    }
  };

  const handleEducationEdit = (education: IResumeEducation) => {
    setSelectedEducation(education);
    setIsEducationFormOpen(true);
  };

  const handleCertificationEdit = (certification: IResumeCertification) => {
    setSelectedCertification(certification);
    setIsCertificationFormOpen(true);
  };

  const handleEducationFormClose = () => {
    setIsEducationFormOpen(false);
    setSelectedEducation(undefined);
  };

  const handleCertificationFormClose = () => {
    setIsCertificationFormOpen(false);
    setSelectedCertification(undefined);
  };

  useEffect(() => {
    const draft = localStorage.getItem('candidateResumeDraft');
    if (draft) {
      try {
        const resumeDraft = JSON.parse(draft);
        const parsedResume = resumeDraft.parsedResume || resumeDraft;
        if (
          Array.isArray(parsedResume.education) ||
          Array.isArray(parsedResume.certifications)
        ) {
          setDraftEducations(
            Array.isArray(parsedResume.education) ? parsedResume.education : []
          );
          setDraftCertifications(
            Array.isArray(parsedResume.certifications)
              ? parsedResume.certifications
              : []
          );
          setIsDraftMode(true);
          return;
        }
      } catch (_e) {
        /* ignore parse errors */
      }
    }
    setIsDraftMode(false);
  }, []);

  // Render
  const displayedEducations = isDraftMode ? draftEducations : educations || [];
  const displayedCertifications = isDraftMode
    ? draftCertifications
    : certifications || [];

  if (isLoadingEducations || isLoadingCertifications) {
    return (
      <div className="border-muted flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center justify-center">
          <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">
            Loading your education history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4" data-tour="education-section">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground sm:text2xl mb-2 flex items-center gap-2 text-2xl font-bold">
              <GraduationCap className="text-primary h-8 w-8 pr-2" />
              Education
            </h2>
            <p className="text-muted-foreground text-sm">
              Educational background and achievements.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {displayedEducations.length === 0 ? (
            <div className="border-muted flex h-[200px] items-center justify-center rounded-lg border border-dashed">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm">
                  No education history added yet
                </p>
                <p className="text-muted-foreground/70 mt-1 text-xs">
                  Click the button above to add your education
                </p>
              </div>
            </div>
          ) : (
            displayedEducations.map((education) => (
              <EducationCard
                key={education.id}
                education={education}
                onEdit={() => handleEducationEdit(education)}
                onDelete={() => handleEducationDelete(education.id)}
              />
            ))
          )}
        </div>
        <div className="mt-4 flex gap-4">
          <Button
            onClick={() => setIsEducationFormOpen(true)}
            variant="outline"
            className="h-10 px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        </div>
      </div>

      <div className="space-y-4" data-tour="certification-section">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground sm:text2xl mb-2 flex items-center gap-2 text-2xl font-bold">
              <Award className="text-primary h-8 w-8 pr-2" />
              Certifications
            </h2>
            <p className="text-muted-foreground text-sm">
              Certifications and achievements.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {displayedCertifications.length === 0 ? (
            <div className="border-muted flex h-[100px] items-center justify-center rounded-lg border border-dashed">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm">
                  No certifications added yet
                </p>
                <p className="text-muted-foreground/70 mt-1 text-xs">
                  Click the button above to add your certifications
                </p>
              </div>
            </div>
          ) : (
            displayedCertifications.map((certification) => (
              <CertificationCard
                key={certification.id}
                certification={certification}
                onEdit={() => handleCertificationEdit(certification)}
                onDelete={() => handleCertificationDelete(certification.id)}
              />
            ))
          )}
        </div>
        <div className="mt-4 flex gap-4">
          <Button
            onClick={() => setIsCertificationFormOpen(true)}
            variant="outline"
            className="h-10 px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Certification
          </Button>
        </div>
      </div>

      <EducationForm
        isOpen={isEducationFormOpen}
        onClose={handleEducationFormClose}
        onSubmit={handleEducationSubmit}
        education={selectedEducation}
      />

      <CertificationForm
        open={isCertificationFormOpen}
        onOpenChange={handleCertificationFormClose}
        onSubmit={handleCertificationSubmit}
        certification={selectedCertification}
      />
    </div>
  );
}
