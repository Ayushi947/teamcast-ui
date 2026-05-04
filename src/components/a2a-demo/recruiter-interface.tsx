'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MapPin,
  Briefcase,
  X,
  CheckCircle,
  AlertCircle,
  Network,
  Play,
  Loader2,
  Activity,
  List,
  Ban,
  BarChart,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchService, a2aInterviewService } from '@/lib/services/services';
import { logger } from '@/lib/logger';
import {
  type IA2ATask,
  A2APartType,
  A2ATaskState,
  A2AMessageRole,
  type IPartnerCandidateDetailed,
} from '@/lib/shared';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Candidate {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  openToWork: boolean;
  activeTalent: boolean;
  imageUrl?: string;
  email?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

type A2ASkillId =
  | 'interview.request'
  | 'interview.status'
  | 'interview.results'
  | 'interview.list'
  | 'interview.cancel';

interface A2ASkillCard {
  id: A2ASkillId;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const A2A_SKILLS: A2ASkillCard[] = [
  {
    id: 'interview.request',
    name: 'Request Interview',
    description:
      'Request a technical interview assessment with auto-populated candidate data from external ATS system',
    icon: <Network className="h-5 w-5" />,
    color: 'blue',
  },
  {
    id: 'interview.status',
    name: 'Get Interview Status',
    description:
      'Check the current status of an interview and whether results are ready',
    icon: <Activity className="h-5 w-5" />,
    color: 'green',
  },
  {
    id: 'interview.results',
    name: 'Get Interview Results',
    description:
      'Retrieve detailed interview results including scores and recommendations',
    icon: <BarChart className="h-5 w-5" />,
    color: 'purple',
  },
  {
    id: 'interview.list',
    name: 'List Interviews',
    description:
      'List all interviews with optional filtering by status or date range',
    icon: <List className="h-5 w-5" />,
    color: 'orange',
  },
  {
    id: 'interview.cancel',
    name: 'Cancel Interview',
    description: 'Cancel a pending interview that has not started yet',
    icon: <Ban className="h-5 w-5" />,
    color: 'red',
  },
];

export function RecruiterInterface() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('Software Engineer');
  const [apiKey, setApiKey] = useState('');
  const [apiKeySet, setApiKeySet] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<A2ASkillId | null>(null);
  const [a2aTask, setA2aTask] = useState<IA2ATask | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);

  // Full candidate data from API
  const [fullCandidateData, setFullCandidateData] =
    useState<IPartnerCandidateDetailed | null>(null);
  const [loadingCandidateData, setLoadingCandidateData] = useState(false);

  // Interview Request Form State - Pre-populated from External ATS
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [assessmentLevel, setAssessmentLevel] = useState('INTERMEDIATE');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [externalReferenceId, setExternalReferenceId] = useState('');
  const [expectedDurationMinutes, setExpectedDurationMinutes] = useState('30');
  const [maxSections, setMaxSections] = useState('3');
  const [resumeBase64, setResumeBase64] = useState<string>('');
  const [resumeFileName, setResumeFileName] = useState<string>('');

  // Interview Status Form State
  const [statusInterviewId, setStatusInterviewId] = useState('');
  const [statusExternalReferenceId, setStatusExternalReferenceId] =
    useState('');
  const [statusCandidateEmail, setStatusCandidateEmail] = useState('');

  // Interview Results Form State
  const [resultsInterviewId, setResultsInterviewId] = useState('');
  const [resultsExternalReferenceId, setResultsExternalReferenceId] =
    useState('');

  // Interview List Form State
  const [listStatus, setListStatus] = useState<string[]>([]);
  const [listExternalReferenceId, setListExternalReferenceId] = useState('');
  const [listCandidateEmail, setListCandidateEmail] = useState('');
  const [listFromDate, setListFromDate] = useState('');
  const [listToDate, setListToDate] = useState('');
  const [listLimit, setListLimit] = useState('20');
  const [listOffset, setListOffset] = useState('0');

  // Interview Cancel Form State
  const [cancelInterviewId, setCancelInterviewId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCandidates = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const response = await SearchService.searchCandidates({
        query: query.trim(),
        limit: 20,
        page: 1,
      });

      const transformedCandidates: Candidate[] = response.results.map(
        (result) => {
          const metadata = result.metadata || {};

          return {
            id: result.id,
            name: result.name || 'Unknown',
            title: result.jobTitle || metadata.currentTitle || 'Professional',
            company:
              metadata.currentCompany || metadata.company || 'Not specified',
            location:
              metadata.location || metadata.city || 'Location not specified',
            experience:
              metadata.totalExperience ||
              metadata.yearsOfExperience ||
              'Not specified',
            education: metadata.education || metadata.degree || 'Not specified',
            skills: metadata.skills || metadata.topSkills || [],
            openToWork:
              metadata.openToWork === true || metadata.availableToWork === true,
            activeTalent:
              metadata.recentActivity === true || metadata.active === true,
            email: result.email || undefined,
            description: result.description || metadata.summary || '',
            imageUrl: result.image || undefined,
            metadata: metadata,
          };
        }
      );

      setCandidates(transformedCandidates);
    } catch (error) {
      logger.error('Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (searchQuery.trim()) {
      fetchCandidates(searchQuery);
    }
  }, []); // Only run on mount

  // Debounced search when searchQuery changes
  useEffect(() => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if query is empty
    if (!searchQuery.trim()) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      fetchCandidates(searchQuery);
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, fetchCandidates]);

  // Populate candidate data when selected (using search results data)
  const handleCandidateSelect = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setLoadingCandidateData(true);
    setFullCandidateData(null);

    try {
      // Use data from search results (no additional API call needed)
      // This avoids 403 permission errors from partner-only endpoints
      const detailedCandidate: IPartnerCandidateDetailed = {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email || '',
        phone: (candidate.metadata?.phone as string) || '',
        jobTitle: candidate.title,
        currentCompany: candidate.company,
        location: candidate.location,
        totalExperience: candidate.metadata?.totalExperience as number,
        skills: candidate.skills,
        resume: {
          resumeFileUrl: candidate.metadata?.resumeUrl as string,
          phone: (candidate.metadata?.phone as string) || '',
          currentJobTitle: candidate.title,
          currentCompany: candidate.company,
          location: candidate.location,
          totalExperience: candidate.metadata?.totalExperience as number,
          resumeSkills: candidate.skills,
          social: {
            linkedin: candidate.metadata?.linkedin as string,
            github: candidate.metadata?.github as string,
          },
        },
      } as IPartnerCandidateDetailed;

      setFullCandidateData(detailedCandidate);

      // Auto-populate all fields from external ATS data
      populateFieldsFromCandidate(detailedCandidate);

      toast.success('Candidate Data Loaded', {
        description: 'All fields populated from external ATS system',
      });
    } catch (error) {
      logger.error('Error populating candidate details:', error);
      toast.error('Failed to Load Candidate Data', {
        description: 'Could not populate candidate information',
      });
    } finally {
      setLoadingCandidateData(false);
    }
  };

  // Helper function to randomly select 5-8 skills
  const selectRandomSkills = (skills: string[]): string[] => {
    if (!skills || skills.length === 0) return [];

    const count = Math.min(
      skills.length,
      Math.floor(Math.random() * 4) + 5 // Random between 5-8
    );

    const shuffled = [...skills].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Populate all form fields from candidate data
  const populateFieldsFromCandidate = (
    candidate: IPartnerCandidateDetailed
  ) => {
    // Basic info
    setCandidateEmail(candidate.email || '');
    setCandidateName(candidate.name || '');
    setPhone(candidate.phone || candidate.resume?.phone || '');
    setCurrentTitle(
      candidate.jobTitle ||
        candidate.resume?.currentJobTitle ||
        candidate.currentCompany ||
        ''
    );
    setCurrentCompany(
      candidate.currentCompany || candidate.resume?.currentCompany || ''
    );
    setYearsOfExperience(
      candidate.totalExperience?.toString() ||
        candidate.resume?.totalExperience?.toString() ||
        ''
    );

    // Social links
    setLinkedInUrl(candidate.resume?.social?.linkedin || '');
    setGithubUrl(candidate.resume?.social?.github || '');

    // Skills - randomly select 5-8 from candidate's skills
    const candidateSkills =
      candidate.skills || candidate.resume?.resumeSkills || [];
    const randomSkills = selectRandomSkills(candidateSkills);
    setSelectedSkills(randomSkills);

    // Job context (can be customized)
    setJobLocation(candidate.location || candidate.resume?.location || '');

    // External IDs
    setExternalReferenceId(`ats-ref-${Date.now()}`);

    // Resume file
    if (candidate.resume?.resumeFileUrl) {
      fetchAndConvertResume(candidate.resume.resumeFileUrl);
    } else {
      setResumeBase64('');
      setResumeFileName('');
    }

    logger.info('Candidate data populated', {
      candidateId: candidate.id,
      skillsCount: randomSkills.length,
      hasResume: !!candidate.resume?.resumeFileUrl,
    });
  };

  // Fetch resume file and convert to base64
  const fetchAndConvertResume = async (resumeUrl: string) => {
    try {
      // For now, we'll just set the filename
      // In production, you'd fetch the file from cloud storage via pre-signed URL
      const fileName = resumeUrl.split('/').pop() || 'resume.pdf';
      setResumeFileName(fileName);

      // Note: Actual file fetching would require a backend endpoint
      // that generates pre-signed URL and returns file data
      logger.info('Resume file reference set', { fileName });

      toast.info('Resume Available', {
        description: `Resume file: ${fileName}`,
      });
    } catch (error) {
      logger.error('Error fetching resume:', error);
    }
  };

  const handleSearch = () => {
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // Immediately fetch with current query
    if (searchQuery.trim()) {
      fetchCandidates(searchQuery);
    }
  };

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      a2aInterviewService.setApiKey(apiKey.trim());
      setApiKeySet(true);
      logger.info('A2A API key configured');
      toast.success('API Key Set', {
        description: 'A2A API key has been configured successfully',
      });
    }
  };

  const handleClearApiKey = () => {
    a2aInterviewService.clearApiKey();
    setApiKey('');
    setApiKeySet(false);
    logger.info('A2A API key cleared');
  };

  const toggleSkillCard = (skillId: A2ASkillId) => {
    setExpandedSkill(expandedSkill === skillId ? null : skillId);
    setA2aTask(null);
  };

  const handleRequestInterview = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Skills Required', {
        description: 'No skills selected for assessment',
      });
      return;
    }

    if (!candidateEmail || !candidateName) {
      toast.error('Required Fields Missing', {
        description: 'Candidate email and name are required',
      });
      return;
    }

    setTaskLoading(true);
    setA2aTask(null);

    try {
      // Build custom instructions - if no resume, focus only on skills
      let finalCustomInstructions = '';
      if (!resumeBase64 && !resumeFileName) {
        finalCustomInstructions =
          `No resume provided. Focus the assessment strictly on evaluating the following skills: ${selectedSkills.join(', ')}. ` +
          'Base questions and evaluation only on these specific skills.';

        logger.info(
          'No resume file available - adding skills-only focus instruction',
          {
            skills: selectedSkills,
          }
        );
      }

      const task = await a2aInterviewService.requestInterview({
        candidateEmail,
        candidateName,
        phone: phone || undefined,
        currentTitle: currentTitle || undefined,
        currentCompany: currentCompany || undefined,
        yearsOfExperience: yearsOfExperience
          ? parseInt(yearsOfExperience)
          : undefined,
        linkedInUrl: linkedInUrl || undefined,
        githubUrl: githubUrl || undefined,
        skillsToAssess: selectedSkills,
        assessmentLevel: assessmentLevel as never,
        jobTitle: jobTitle || undefined,
        jobDescription: jobDescription || undefined,
        jobLocation: jobLocation || undefined,
        companyName: companyName || undefined,
        customInstructions: finalCustomInstructions || undefined,
        externalReferenceId: externalReferenceId || undefined,
        expectedDurationMinutes: parseInt(expectedDurationMinutes) || 30,
        maxSections: parseInt(maxSections) || 3,
        resumeFile: resumeBase64 || undefined,
        resumeFileName: resumeFileName || undefined,
      });

      setA2aTask(task);

      // Parse the response to determine success or failure
      const agentMessages =
        task.messages?.filter((msg) => msg.role === A2AMessageRole.AGENT) || [];

      // Check for interviewId in data parts (success indicator)
      let interviewId: string | null = null;
      let errorMessage: string | null = null;
      let hasErrorCode = false;

      // First, check if state is completed (definite success)
      const isStateCompleted = task.state === A2ATaskState.COMPLETED;
      const isStateFailed = task.state === A2ATaskState.FAILED;

      // Parse agent messages for success/error indicators
      for (const msg of agentMessages) {
        for (const part of msg.parts || []) {
          if (part.type === A2APartType.DATA && part.data) {
            // Check for interviewId (success)
            if (
              part.data.interviewId &&
              typeof part.data.interviewId === 'string'
            ) {
              interviewId = part.data.interviewId;
            }
            // Check for errorCode (failure indicator)
            if (part.data.errorCode) {
              hasErrorCode = true;
            }
          }
          if (part.type === A2APartType.TEXT && part.text) {
            // Try to extract interviewId from error messages (e.g., "Interview ID: xxx")
            const interviewIdMatch = part.text.match(
              /interview\s+id:\s*([a-f0-9-]+)/i
            );
            if (interviewIdMatch && interviewIdMatch[1]) {
              interviewId = interviewIdMatch[1];
            }

            // Check for error messages in text
            const text = part.text.toLowerCase();
            if (
              text.includes('failed') ||
              text.includes('error') ||
              text.includes('already pending') ||
              text.includes('not found') ||
              text.includes('invalid') ||
              text.includes('cannot')
            ) {
              // Store error message but don't override if we found interviewId
              if (!errorMessage) {
                errorMessage = part.text;
              }
            }
          }
        }
      }

      // Determine success strictly from task state (not from interviewId in error text).
      // We only treat the request as successful when the task completed without error codes.
      const isSuccess = isStateCompleted && !hasErrorCode;

      // Show appropriate toast message
      if (isSuccess && interviewId) {
        toast.success('Interview Invite Sent Successfully', {
          description: `Invite sent successfully to ${candidateName}`,
        });
      } else if (isSuccess && isStateCompleted) {
        toast.success('Interview Invite Sent Successfully', {
          description: `Invite sent successfully to ${candidateName}`,
        });
      } else if (errorMessage) {
        // Extract a clean error message
        const cleanError = errorMessage.replace(
          /^Failed to request interview:\s*/i,
          ''
        );
        toast.error('Interview Request Failed', {
          description: cleanError || 'Unable to send interview invite',
        });
      } else if (isStateFailed || hasErrorCode) {
        // If state is failed or has errorCode, show generic error
        toast.error('Interview Request Failed', {
          description: 'Unable to send interview invite. Please try again.',
        });
      } else {
        // Default success message if state is not failed
        toast.success('Interview Request Sent', {
          description: `Task ${task.taskId} created successfully`,
        });
      }

      logger.info('Interview request sent:', task);
    } catch (error) {
      logger.error('Error requesting interview:', error);
      toast.error('Request Failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setTaskLoading(false);
    }
  };

  const handleGetStatus = async () => {
    if (
      !statusInterviewId &&
      !statusExternalReferenceId &&
      !statusCandidateEmail
    ) {
      toast.error('Required Fields Missing', {
        description: 'Please provide at least one identifier',
      });
      return;
    }

    setTaskLoading(true);
    setA2aTask(null);

    try {
      const task = await a2aInterviewService.getInterviewStatus({
        interviewId: statusInterviewId || undefined,
        externalReferenceId: statusExternalReferenceId || undefined,
        candidateEmail: statusCandidateEmail || undefined,
      });

      setA2aTask(task);
      toast.success('Status Retrieved', {
        description: `Task ${task.taskId} created successfully`,
      });
    } catch (error) {
      logger.error('Error getting status:', error);
      toast.error('Request Failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setTaskLoading(false);
    }
  };

  const handleGetResults = async () => {
    if (!resultsInterviewId && !resultsExternalReferenceId) {
      toast.error('Required Fields Missing', {
        description: 'Please provide interview ID or external reference ID',
      });
      return;
    }

    setTaskLoading(true);
    setA2aTask(null);

    try {
      const task = await a2aInterviewService.getInterviewResults({
        interviewId: resultsInterviewId || undefined,
        externalReferenceId: resultsExternalReferenceId || undefined,
      });

      setA2aTask(task);
      toast.success('Results Retrieved', {
        description: `Task ${task.taskId} created successfully`,
      });
    } catch (error) {
      logger.error('Error getting results:', error);
      toast.error('Request Failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setTaskLoading(false);
    }
  };

  const handleListInterviews = async () => {
    setTaskLoading(true);
    setA2aTask(null);

    try {
      const result = await a2aInterviewService.listTasks({
        state: listStatus.length > 0 ? (listStatus as never) : undefined,
        limit: parseInt(listLimit) || 20,
        offset: parseInt(listOffset) || 0,
      });

      // Create a mock task to display the results
      const mockTask: IA2ATask = {
        taskId: `list-${Date.now()}`,
        state: A2ATaskState.COMPLETED,
        messages: [
          {
            messageId: '1',
            role: A2AMessageRole.AGENT,
            parts: [
              {
                type: A2APartType.TEXT,
                text: `Found ${result.total} interviews`,
              },
              {
                type: A2APartType.DATA,
                data: result as unknown as Record<string, unknown>,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setA2aTask(mockTask);
      toast.success('Interviews Listed', {
        description: `Found ${result.total} interviews`,
      });
    } catch (error) {
      logger.error('Error listing interviews:', error);
      toast.error('Request Failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setTaskLoading(false);
    }
  };

  const handleCancelInterview = async () => {
    if (!cancelInterviewId) {
      toast.error('Required Fields Missing', {
        description: 'Please provide interview ID',
      });
      return;
    }

    setTaskLoading(true);
    setA2aTask(null);

    try {
      const task = await a2aInterviewService.cancelTask(
        cancelInterviewId,
        cancelReason || undefined
      );

      if (task) {
        setA2aTask(task);
        toast.success('Interview Cancelled', {
          description: `Interview ${cancelInterviewId} has been cancelled`,
        });
      }
    } catch (error) {
      logger.error('Error cancelling interview:', error);
      toast.error('Request Failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setTaskLoading(false);
    }
  };

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* Left Sidebar - Candidate Search Results */}
      <div className="border-border flex w-96 flex-col border-r bg-white dark:bg-gray-950">
        {/* A2A API Key Configuration */}
        {!apiKeySet && (
          <div className="border-border shrink-0 border-b bg-yellow-50 px-4 py-3 dark:bg-yellow-900/10">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <Label className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                  A2A API Key Required
                </Label>
              </div>
              <ThemeToggle className="shrink-0" />
            </div>
            <p className="mb-3 text-xs text-yellow-800 dark:text-yellow-200">
              Enter your A2A API key to send requests via A2A protocol
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="mcp_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                onClick={handleSetApiKey}
                disabled={!apiKey.trim()}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                Set Key
              </Button>
            </div>
          </div>
        )}

        {apiKeySet && (
          <div className="border-border shrink-0 border-b bg-green-50 px-4 py-2 dark:bg-green-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-900 dark:text-green-100">
                  API Key Configured
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle className="shrink-0" />
                <Button
                  onClick={handleClearApiKey}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search Header */}
        <div className="border-border shrink-0 border-b bg-white px-4 py-4 dark:bg-gray-950">
          <div className="mb-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="h-10 pr-4 pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              size="sm"
              className="h-10 px-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              {loading ? 'Searching...' : `${candidates.length} results`}
            </span>
            {!loading && candidates.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary text-xs"
              >
                Public profiles
              </Badge>
            )}
          </div>
        </div>

        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center px-8 text-center">
              <Search className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-base font-semibold">
                No candidates found
              </h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            candidates.map((candidate) => (
              <motion.div
                key={candidate.id}
                className={`border-border cursor-pointer border-b px-4 py-4 transition-all ${
                  selectedCandidate?.id === candidate.id
                    ? 'bg-primary/5 border-l-primary dark:bg-primary/10 dark:border-l-primary border-l-4'
                    : 'border-l-4 border-l-transparent bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleCandidateSelect(candidate)}
              >
                <div className="flex gap-3">
                  <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold">
                    {candidate.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground mb-0.5 truncate text-sm font-semibold">
                      {candidate.name}
                    </h3>
                    <p className="text-muted-foreground mb-0.5 truncate text-xs">
                      {candidate.title}
                    </p>
                    <p className="text-muted-foreground mb-2 truncate text-xs">
                      {candidate.company}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {candidate.openToWork && (
                        <Badge
                          variant="secondary"
                          className="h-5 bg-green-50 px-2 text-[10px] text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        >
                          Open to work
                        </Badge>
                      )}
                      {candidate.activeTalent && (
                        <Badge
                          variant="secondary"
                          className="h-5 bg-blue-50 px-2 text-[10px] text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          Active talent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - A2A Skills Interface */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {selectedCandidate ? (
          <>
            {/* Profile Header - Fixed */}
            <div className="border-border shrink-0 border-b bg-white px-6 py-5 dark:bg-gray-950">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold">
                    {selectedCandidate.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-foreground mb-1 text-xl leading-tight font-bold">
                      {selectedCandidate.name}
                    </h1>
                    <p className="text-muted-foreground mb-2 text-base">
                      {selectedCandidate.title}
                    </p>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        {selectedCandidate.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedCandidate.location}
                      </span>
                    </div>
                  </div>
                </div>
                {loadingCandidateData && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading data...
                  </div>
                )}
                {fullCandidateData && !loadingCandidateData && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileCheck className="h-4 w-4" />
                    Data loaded
                  </div>
                )}
              </div>
            </div>

            {/* A2A Skills Cards - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto max-w-5xl space-y-4">
                <div className="mb-6">
                  <h2 className="text-foreground mb-2 text-2xl font-bold">
                    A2A Interview Skills
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    All candidate data auto-populated from external ATS system.
                    Select a skill to execute A2A protocol actions.
                  </p>
                </div>

                {A2A_SKILLS.map((skill) => (
                  <Card
                    key={skill.id}
                    className={`border-2 transition-all ${
                      expandedSkill === skill.id
                        ? 'border-primary shadow-lg'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <button
                      onClick={() => toggleSkillCard(skill.id)}
                      className="flex w-full items-center justify-between p-5 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${skill.color}-100 text-${skill.color}-600`}
                        >
                          {skill.icon}
                        </div>
                        <div>
                          <h3 className="text-foreground mb-1 text-lg font-bold">
                            {skill.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {skill.description}
                          </p>
                        </div>
                      </div>
                      {expandedSkill === skill.id ? (
                        <ChevronUp className="text-muted-foreground h-5 w-5" />
                      ) : (
                        <ChevronDown className="text-muted-foreground h-5 w-5" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSkill === skill.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-border border-t p-5">
                            {skill.id === 'interview.request' && (
                              <RequestInterviewForm
                                candidateEmail={candidateEmail}
                                setCandidateEmail={setCandidateEmail}
                                candidateName={candidateName}
                                phone={phone}
                                currentTitle={currentTitle}
                                currentCompany={currentCompany}
                                yearsOfExperience={yearsOfExperience}
                                linkedInUrl={linkedInUrl}
                                githubUrl={githubUrl}
                                selectedSkills={selectedSkills}
                                setSelectedSkills={setSelectedSkills}
                                assessmentLevel={assessmentLevel}
                                setAssessmentLevel={setAssessmentLevel}
                                jobTitle={jobTitle}
                                setJobTitle={setJobTitle}
                                jobDescription={jobDescription}
                                setJobDescription={setJobDescription}
                                jobLocation={jobLocation}
                                setJobLocation={setJobLocation}
                                companyName={companyName}
                                setCompanyName={setCompanyName}
                                externalReferenceId={externalReferenceId}
                                expectedDurationMinutes={
                                  expectedDurationMinutes
                                }
                                setExpectedDurationMinutes={
                                  setExpectedDurationMinutes
                                }
                                maxSections={maxSections}
                                setMaxSections={setMaxSections}
                                resumeBase64={resumeBase64}
                                setResumeBase64={setResumeBase64}
                                resumeFileName={resumeFileName}
                                setResumeFileName={setResumeFileName}
                                onSubmit={handleRequestInterview}
                                loading={taskLoading}
                                apiKeySet={apiKeySet}
                              />
                            )}

                            {skill.id === 'interview.status' && (
                              <InterviewStatusForm
                                interviewId={statusInterviewId}
                                setInterviewId={setStatusInterviewId}
                                externalReferenceId={statusExternalReferenceId}
                                setExternalReferenceId={
                                  setStatusExternalReferenceId
                                }
                                candidateEmail={statusCandidateEmail}
                                setCandidateEmail={setStatusCandidateEmail}
                                onSubmit={handleGetStatus}
                                loading={taskLoading}
                                apiKeySet={apiKeySet}
                              />
                            )}

                            {skill.id === 'interview.results' && (
                              <InterviewResultsForm
                                interviewId={resultsInterviewId}
                                setInterviewId={setResultsInterviewId}
                                externalReferenceId={resultsExternalReferenceId}
                                setExternalReferenceId={
                                  setResultsExternalReferenceId
                                }
                                onSubmit={handleGetResults}
                                loading={taskLoading}
                                apiKeySet={apiKeySet}
                              />
                            )}

                            {skill.id === 'interview.list' && (
                              <InterviewListForm
                                status={listStatus}
                                setStatus={setListStatus}
                                externalReferenceId={listExternalReferenceId}
                                setExternalReferenceId={
                                  setListExternalReferenceId
                                }
                                candidateEmail={listCandidateEmail}
                                setCandidateEmail={setListCandidateEmail}
                                fromDate={listFromDate}
                                setFromDate={setListFromDate}
                                toDate={listToDate}
                                setToDate={setListToDate}
                                limit={listLimit}
                                setLimit={setListLimit}
                                offset={listOffset}
                                setOffset={setListOffset}
                                onSubmit={handleListInterviews}
                                loading={taskLoading}
                                apiKeySet={apiKeySet}
                              />
                            )}

                            {skill.id === 'interview.cancel' && (
                              <InterviewCancelForm
                                interviewId={cancelInterviewId}
                                setInterviewId={setCancelInterviewId}
                                reason={cancelReason}
                                setReason={setCancelReason}
                                onSubmit={handleCancelInterview}
                                loading={taskLoading}
                                apiKeySet={apiKeySet}
                              />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}

                {/* A2A Task Response */}
                <AnimatePresence>
                  {a2aTask && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-2 border-blue-500/30 bg-blue-50 dark:bg-blue-900/10">
                        <div className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                              <Activity className="h-5 w-5 text-blue-600" />
                              A2A Task Response
                            </h3>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                a2aTask.state === A2ATaskState.COMPLETED
                                  ? 'bg-green-100 text-green-700'
                                  : a2aTask.state === A2ATaskState.WORKING
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : a2aTask.state === A2ATaskState.FAILED
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {a2aTask.state.toUpperCase()}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-muted-foreground text-sm">
                                Task ID
                              </p>
                              <p className="font-mono text-xs">
                                {a2aTask.taskId}
                              </p>
                            </div>

                            {a2aTask.messages &&
                              a2aTask.messages.length > 0 && (
                                <div>
                                  <p className="text-muted-foreground mb-2 text-sm">
                                    Response Data
                                  </p>
                                  <div className="max-h-96 space-y-2 overflow-y-auto rounded bg-white p-3 dark:bg-gray-800">
                                    {a2aTask.messages.map((msg, idx) => (
                                      <div key={idx} className="space-y-2">
                                        {msg.parts.map((part, partIdx) => (
                                          <div key={partIdx}>
                                            {part.type === A2APartType.TEXT && (
                                              <p className="text-sm">
                                                {part.text}
                                              </p>
                                            )}
                                            {part.type === A2APartType.DATA && (
                                              <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs dark:bg-gray-900">
                                                {JSON.stringify(
                                                  // Filter out sections from MCP interview results for UI display
                                                  (() => {
                                                    if (
                                                      part.data &&
                                                      typeof part.data ===
                                                        'object' &&
                                                      !Array.isArray(
                                                        part.data
                                                      ) &&
                                                      'sections' in part.data
                                                    ) {
                                                      const {
                                                        sections,
                                                        ...rest
                                                      } = part.data as Record<
                                                        string,
                                                        unknown
                                                      >;
                                                      return rest;
                                                    }
                                                    return part.data;
                                                  })(),
                                                  null,
                                                  2
                                                )}
                                              </pre>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="bg-muted mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full">
                <Search className="text-muted-foreground h-10 w-10" />
              </div>
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Select a candidate
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Choose a candidate from the search results. All data will be
                automatically loaded from the external ATS system.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Request Interview Form Component
function RequestInterviewForm(props: {
  candidateEmail: string;
  setCandidateEmail: (value: string) => void;
  candidateName: string;
  phone: string;
  currentTitle: string;
  currentCompany: string;
  yearsOfExperience: string;
  linkedInUrl: string;
  githubUrl: string;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  assessmentLevel: string;
  setAssessmentLevel: (value: string) => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  jobLocation: string;
  setJobLocation: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  externalReferenceId: string;
  expectedDurationMinutes: string;
  setExpectedDurationMinutes: (value: string) => void;
  maxSections: string;
  setMaxSections: (value: string) => void;
  resumeBase64: string;
  setResumeBase64: (value: string) => void;
  resumeFileName: string;
  setResumeFileName: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  apiKeySet: boolean;
}) {
  const [skillInputValue, setSkillInputValue] = useState('');

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
              External ATS Data Loaded
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              All candidate information has been automatically populated from
              your ATS system. Review and customize the assessment parameters
              below before sending the interview request.
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Info - Read Only Display */}
      <div className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
        <h4 className="text-sm font-semibold">Candidate Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Name</p>
            <p className="font-medium">{props.candidateName || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Email</p>
            <Input
              type="email"
              value={props.candidateEmail}
              onChange={(e) => props.setCandidateEmail(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Phone</p>
            <p className="font-medium">{props.phone || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Current Title</p>
            <p className="font-medium">{props.currentTitle || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Current Company</p>
            <p className="font-medium">{props.currentCompany || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Years of Experience</p>
            <p className="font-medium">{props.yearsOfExperience || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">LinkedIn</p>
            <p className="truncate font-medium">{props.linkedInUrl || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">GitHub</p>
            <p className="truncate font-medium">{props.githubUrl || '-'}</p>
          </div>
        </div>
      </div>

      {/* Skills to Validate - Editable */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Skills to Validate ({props.selectedSkills.length} selected)
        </Label>

        {/* Display existing skills with remove button */}
        <div className="flex flex-wrap gap-2 rounded-lg border bg-white p-3 dark:bg-gray-900">
          {props.selectedSkills.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-primary/10 text-primary group flex items-center gap-1.5 px-3 py-1 text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => {
                  const newSkills = props.selectedSkills.filter(
                    (_, i) => i !== index
                  );
                  props.setSelectedSkills(newSkills);
                }}
                className="hover:bg-primary/20 ml-1 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {/* Add new skill input */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add additional skill..."
            value={skillInputValue}
            onChange={(e) => setSkillInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const newSkill = skillInputValue.trim();
                if (newSkill && !props.selectedSkills.includes(newSkill)) {
                  // Add new skill at the beginning of the list
                  props.setSelectedSkills([newSkill, ...props.selectedSkills]);
                  setSkillInputValue('');
                }
              }
            }}
            className="h-9 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newSkill = skillInputValue.trim();
              if (newSkill && !props.selectedSkills.includes(newSkill)) {
                // Add new skill at the beginning of the list
                props.setSelectedSkills([newSkill, ...props.selectedSkills]);
                setSkillInputValue('');
              }
            }}
            disabled={!skillInputValue.trim()}
          >
            Add
          </Button>
        </div>

        <p className="text-muted-foreground text-xs">
          {props.selectedSkills.length} skills randomly selected from
          candidate&apos;s profile. You can add or remove skills as needed.
        </p>
      </div>

      {/* Resume Upload Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Upload Resume</Label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  props.setResumeFileName(file.name);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const result = event.target?.result;
                    if (typeof result === 'string') {
                      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
                      const base64 = result.split(',')[1] || result;
                      props.setResumeBase64(base64);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="h-10 text-sm"
            />
          </div>
          {props.resumeFileName && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
              <FileCheck className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Resume Uploaded
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {props.resumeFileName}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  props.setResumeFileName('');
                  props.setResumeBase64('');
                }}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          Upload a resume file (PDF, DOC, or DOCX) to provide additional context
          for the assessment
        </p>
      </div>

      {/* Assessment Configuration */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Assessment Level</Label>
        <Select
          value={props.assessmentLevel}
          onValueChange={props.setAssessmentLevel}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="JUNIOR">Junior</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="SENIOR">Senior</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Duration (minutes)</Label>
          <Input
            type="number"
            value={props.expectedDurationMinutes}
            onChange={(e) => props.setExpectedDurationMinutes(e.target.value)}
            min="5"
            max="120"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Max Sections</Label>
          <Input
            type="number"
            value={props.maxSections}
            onChange={(e) => props.setMaxSections(e.target.value)}
            min="1"
            max="10"
            className="h-10"
          />
        </div>
      </div>

      {/* Job Context (Optional) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Job Title</Label>
          <Input
            type="text"
            value={props.jobTitle}
            onChange={(e) => props.setJobTitle(e.target.value)}
            placeholder="Software Engineer"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Job Location</Label>
          <Input
            type="text"
            value={props.jobLocation}
            onChange={(e) => props.setJobLocation(e.target.value)}
            placeholder="San Francisco, CA"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Company Name</Label>
          <Input
            type="text"
            value={props.companyName}
            onChange={(e) => props.setCompanyName(e.target.value)}
            placeholder="Acme Inc"
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Job Description</Label>
        <Textarea
          placeholder="Paste job description here..."
          value={props.jobDescription}
          onChange={(e) => props.setJobDescription(e.target.value)}
          rows={4}
          className="resize-none text-sm"
        />
      </div>

      {/* Tracking ID */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">External Reference ID</Label>
        <Input
          type="text"
          value={props.externalReferenceId}
          readOnly
          className="h-10 bg-gray-50"
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={props.onSubmit}
          disabled={props.loading || !props.apiKeySet}
          className="bg-primary h-10"
        >
          {props.loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Request...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Request Interview via A2A
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Interview Status Form Component
function InterviewStatusForm(props: {
  interviewId: string;
  setInterviewId: (value: string) => void;
  externalReferenceId: string;
  setExternalReferenceId: (value: string) => void;
  candidateEmail: string;
  setCandidateEmail: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  apiKeySet: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Provide at least one identifier to check interview status
      </p>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Interview ID</Label>
        <Input
          type="text"
          value={props.interviewId}
          onChange={(e) => props.setInterviewId(e.target.value)}
          placeholder="int_abc123"
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">External Reference ID</Label>
        <Input
          type="text"
          value={props.externalReferenceId}
          onChange={(e) => props.setExternalReferenceId(e.target.value)}
          placeholder="Your tracking reference"
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Candidate Email</Label>
        <Input
          type="email"
          value={props.candidateEmail}
          onChange={(e) => props.setCandidateEmail(e.target.value)}
          placeholder="john@example.com"
          className="h-10"
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button
          onClick={props.onSubmit}
          disabled={props.loading || !props.apiKeySet}
          className="bg-primary h-10"
        >
          {props.loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Status...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Get Status
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Interview Results Form Component
function InterviewResultsForm(props: {
  interviewId: string;
  setInterviewId: (value: string) => void;
  externalReferenceId: string;
  setExternalReferenceId: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  apiKeySet: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Provide interview ID or external reference to retrieve results
      </p>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Interview ID</Label>
        <Input
          type="text"
          value={props.interviewId}
          onChange={(e) => props.setInterviewId(e.target.value)}
          placeholder="int_abc123"
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">External Reference ID</Label>
        <Input
          type="text"
          value={props.externalReferenceId}
          onChange={(e) => props.setExternalReferenceId(e.target.value)}
          placeholder="Your tracking reference"
          className="h-10"
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button
          onClick={props.onSubmit}
          disabled={props.loading || !props.apiKeySet}
          className="bg-primary h-10"
        >
          {props.loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Results...
            </>
          ) : (
            <>
              <BarChart className="mr-2 h-4 w-4" />
              Get Results
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Interview List Form Component
function InterviewListForm(props: {
  status: string[];
  setStatus: (value: string[]) => void;
  externalReferenceId: string;
  setExternalReferenceId: (value: string) => void;
  candidateEmail: string;
  setCandidateEmail: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  limit: string;
  setLimit: (value: string) => void;
  offset: string;
  setOffset: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  apiKeySet: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Filter interviews by status, date range, or other criteria
      </p>
      <div className="space-y-2">
        <Label className="text-sm font-medium">External Reference ID</Label>
        <Input
          type="text"
          value={props.externalReferenceId}
          onChange={(e) => props.setExternalReferenceId(e.target.value)}
          placeholder="Filter by reference"
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Candidate Email</Label>
        <Input
          type="email"
          value={props.candidateEmail}
          onChange={(e) => props.setCandidateEmail(e.target.value)}
          placeholder="Filter by email"
          className="h-10"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">From Date</Label>
          <Input
            type="date"
            value={props.fromDate}
            onChange={(e) => props.setFromDate(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">To Date</Label>
          <Input
            type="date"
            value={props.toDate}
            onChange={(e) => props.setToDate(e.target.value)}
            className="h-10"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Limit</Label>
          <Input
            type="number"
            value={props.limit}
            onChange={(e) => props.setLimit(e.target.value)}
            placeholder="20"
            min="1"
            max="100"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Offset</Label>
          <Input
            type="number"
            value={props.offset}
            onChange={(e) => props.setOffset(e.target.value)}
            placeholder="0"
            min="0"
            className="h-10"
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button
          onClick={props.onSubmit}
          disabled={props.loading || !props.apiKeySet}
          className="bg-primary h-10"
        >
          {props.loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Interviews...
            </>
          ) : (
            <>
              <List className="mr-2 h-4 w-4" />
              List Interviews
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Interview Cancel Form Component
function InterviewCancelForm(props: {
  interviewId: string;
  setInterviewId: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  apiKeySet: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Cancel a pending interview that has not started yet
      </p>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Interview ID <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          value={props.interviewId}
          onChange={(e) => props.setInterviewId(e.target.value)}
          placeholder="int_abc123"
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Cancellation Reason</Label>
        <Textarea
          placeholder="Optional reason for cancellation..."
          value={props.reason}
          onChange={(e) => props.setReason(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button
          onClick={props.onSubmit}
          disabled={props.loading || !props.apiKeySet}
          variant="destructive"
          className="h-10"
        >
          {props.loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            <>
              <Ban className="mr-2 h-4 w-4" />
              Cancel Interview
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
