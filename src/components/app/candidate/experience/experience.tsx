import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidateResumeService } from '@/lib/services/services';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IResumeExperience,
  IResumeExperienceCreate,
  IResumeExperienceUpdate,
  IResumeProjectCreate,
  IResumeProject,
  logger,
} from '@/lib/shared';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ExperienceForm } from './experience-form';
import { ProjectForm } from './project-form';
import { ExperienceCard } from './experience-card';
import { Plus, Briefcase, ChevronDown } from 'lucide-react';

export function Experience() {
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<
    IResumeExperience | undefined
  >();
  const [selectedProject, setSelectedProject] = useState<
    IResumeProject | undefined
  >();
  const [draftExperiences, setDraftExperiences] = useState<IResumeExperience[]>(
    []
  );
  const [isDraftMode, setIsDraftMode] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: experiences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const result = await candidateResumeService.getExperienceList();
      return result;
    },
    enabled: true, // Always enabled, we'll handle draft mode in the display logic
  });

  const createExperienceMutation = useMutation({
    mutationFn: async (data: IResumeExperienceCreate) => {
      const response = await candidateResumeService.createExperience(data);
      return response;
    },
    onSuccess: async () => {
      // Invalidate all experience-related queries
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-resume'] });

      // Force refetch to update UI immediately - wait for completion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['experiences'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-resume'] }),
      ]);

      // Exit draft mode after successful creation
      setIsDraftMode(false);
      setDraftExperiences([]);
      toast.success('Experience added successfully');
      setIsExperienceModalOpen(false);
    },
    onError: (error) => {
      logger.error('Error creating experience:', error);
      const fullMessage = error?.message || '';
      const extractedMessage =
        fullMessage.split(':').pop()?.trim() || 'Failed to add experience';
      toast.error(extractedMessage);
    },
  });

  const updateExperienceMutation = useMutation({
    mutationFn: async (data: IResumeExperienceUpdate) => {
      const response = await candidateResumeService.updateExperience(
        data.id,
        data
      );
      return response;
    },
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-resume'] });

      // Force refetch to update UI immediately - wait for completion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['experiences'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-resume'] }),
      ]);
      toast.success('Experience updated successfully');
      setIsExperienceModalOpen(false);
    },
    onError: (error) => {
      logger.error('Error updating experience:', error);
      toast.error('Failed to update experience');
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: string) => {
      await candidateResumeService.deleteExperience(id);
    },
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-resume'] });

      // Force refetch to update UI immediately - wait for completion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['experiences'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-resume'] }),
      ]);
      toast.success('Experience deleted successfully');
    },
    onError: (error) => {
      logger.error('Error deleting experience:', error);
      toast.error('Failed to delete experience');
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (
      data: IResumeProjectCreate & { experienceId: string }
    ) => {
      const { experienceId, ...projectData } = data;
      const response = await candidateResumeService.createProject(
        experienceId,
        projectData
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Project added successfully');
      setIsProjectModalOpen(false);
    },
    onError: (error) => {
      logger.error('Error creating project:', error);
      toast.error('Failed to add project');
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (
      data: IResumeProjectCreate & { id: string; experienceId: string }
    ) => {
      const { id, experienceId, ...projectData } = data;
      const response = await candidateResumeService.updateProject(
        experienceId,
        id,
        projectData
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Project updated successfully');
      setIsProjectModalOpen(false);
    },
    onError: (error) => {
      logger.error('Error updating project:', error);
      toast.error('Failed to update project');
    },
  });

  useEffect(() => {
    const draft = localStorage.getItem('candidateResumeDraft');
    if (draft) {
      try {
        const resumeDraft = JSON.parse(draft);
        const parsedResume = resumeDraft.parsedResume || resumeDraft;
        if (Array.isArray(parsedResume.experience)) {
          setDraftExperiences(parsedResume.experience);
          setIsDraftMode(true);
          return;
        }
      } catch (_e) {
        /* ignore parse errors */
      }
    }
    setIsDraftMode(false);
  }, []);

  const handleAddExperience = (exp?: IResumeExperience) => {
    if (isDraftMode && exp) {
      const updated = [...draftExperiences, exp];
      setDraftExperiences(updated);
      // Also update localStorage
      const draft = localStorage.getItem('candidateResumeDraft');
      if (draft) {
        const resumeDraft = JSON.parse(draft);
        const parsedResume = resumeDraft.parsedResume || resumeDraft;
        parsedResume.experience = updated;
        localStorage.setItem(
          'candidateResumeDraft',
          JSON.stringify(resumeDraft)
        );
      }
    } else {
      setSelectedExperience(undefined);
      setIsExperienceModalOpen(true);
    }
  };

  const handleEditExperience = (experience: IResumeExperience) => {
    setSelectedExperience(experience);
    setIsExperienceModalOpen(true);
  };

  const handleDeleteExperience = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      await deleteExperienceMutation.mutateAsync(id);
    }
  };

  const handleAddProject = (experienceId: string) => {
    setSelectedProject(undefined);
    const foundExperience = experiences?.find(
      (exp: IResumeExperience) => exp?.id === experienceId
    );
    setSelectedExperience(foundExperience || undefined);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: IResumeProject) => {
    setSelectedProject(project);
    const experience = experiences?.find((exp: IResumeExperience) =>
      exp?.projects?.some((p) => p?.id === project?.id)
    );
    if (experience) {
      setSelectedExperience(experience);
    }
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const experience = experiences?.find((exp: IResumeExperience) =>
        exp?.projects?.some((p) => p?.id === id)
      );
      if (!experience) {
        toast.error('Could not find the experience containing this project');
        return;
      }
      await candidateResumeService.deleteProject(experience.id, id);
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Project deleted successfully');
    }
  };

  const displayedExperiences = isDraftMode
    ? draftExperiences.filter((exp) => exp != null)
    : (experiences || []).filter((exp) => exp != null);

  if (isLoading) {
    return (
      <div className="border-muted flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center justify-center">
          <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">
            Loading your experiences...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-muted flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center justify-center">
          <p className="text-destructive text-sm">
            Error loading experiences: {error?.message || 'Unknown error'}
          </p>
          <Button
            onClick={() =>
              queryClient.refetchQueries({ queryKey: ['experiences'] })
            }
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6" data-tour="experience-card-details-section">
        {displayedExperiences.map((experience: IResumeExperience) => (
          <ExperienceCard
            key={experience?.id || Math.random()}
            experience={experience}
            onEdit={() => handleEditExperience(experience)}
            onDelete={() => handleDeleteExperience(experience?.id || '')}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        ))}

        {(!displayedExperiences || displayedExperiences.length === 0) && (
          <div className="border-muted flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="bg-muted rounded-full p-3">
              <Briefcase className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No experiences yet</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Start by adding your first work experience to showcase your
              professional journey.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <div data-tour="add-experience-button">
          <Button
            onClick={() => handleAddExperience(undefined)}
            variant="outline"
            className="h-10 px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {!displayedExperiences || displayedExperiences.length === 0 ? (
                // Disabled + Tooltip
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="outline"
                          className="h-10 px-6"
                          disabled
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Project
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You need to add experiences before adding a project</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                // Active button (no tooltip)
                <Button variant="outline" className="h-10 px-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Project
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {displayedExperiences && displayedExperiences.length > 0 ? (
                displayedExperiences.map((experience) => (
                  <DropdownMenuItem
                    key={experience?.id}
                    onClick={() => handleAddProject(experience?.id || '')}
                    className="cursor-pointer"
                  >
                    <div className="dark:bg-accent flex w-full transform flex-col rounded-md bg-white p-1 pl-2 transition-transform duration-300 hover:scale-103">
                      <span className="font-medium">
                        {experience?.position}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        at {experience?.company}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No experiences available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ExperienceForm
        isOpen={isExperienceModalOpen}
        onClose={() => {
          setIsExperienceModalOpen(false);
          setSelectedExperience(undefined); // Clear selected experience when closing
        }}
        onSubmit={async (data) => {
          if (selectedExperience) {
            await updateExperienceMutation.mutateAsync({
              ...data,
              id: selectedExperience.id,
            });
          } else {
            await createExperienceMutation.mutateAsync(data);
          }
        }}
        experience={selectedExperience}
        existingExperiences={displayedExperiences}
      />

      <ProjectForm
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProject(undefined); // Clear selected project when closing
        }}
        onSubmit={async (data) => {
          if (selectedProject && selectedExperience) {
            await updateProjectMutation.mutateAsync({
              ...data,
              id: selectedProject.id,
              experienceId: selectedExperience.id,
            });
          } else if (selectedExperience) {
            await createProjectMutation.mutateAsync({
              ...data,
              experienceId: selectedExperience.id,
            });
          }
        }}
        project={selectedProject}
        experience={selectedExperience}
      />
    </>
  );
}
