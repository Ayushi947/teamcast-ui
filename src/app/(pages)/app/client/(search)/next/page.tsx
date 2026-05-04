'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  GraduationCap,
  MapPin,
  Plus,
  Save,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Mock data for shortlisted candidates
const mockShortlistedCandidates = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Frontend Developer',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    matchScore: 95,
    experience: '5+ years',
    location: 'Remote',
    availability: 'Available immediately',
    description:
      'Experienced frontend developer with a strong focus on React and TypeScript. Passionate about creating responsive, accessible, and performant web applications.',
    skills: [
      'React',
      'TypeScript',
      'Next.js',
      'Redux',
      'CSS/SASS',
      'Jest',
      'Webpack',
    ],
    education: 'BS Computer Science, Stanford University',
    languages: ['English', 'Spanish'],
    certifications: [
      'AWS Certified Developer',
      'Google Professional Web Developer',
    ],
    previousCompanies: ['Google', 'Microsoft', 'StartupX'],
    status: 'pending', // pending, ai_interview_sent, direct_interview_scheduled
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Full Stack Engineer',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    matchScore: 92,
    experience: '7+ years',
    location: 'San Francisco, CA',
    availability: 'Available in 2 weeks',
    description:
      'Full stack developer with expertise in both frontend and backend technologies. Strong problem-solving skills and experience with cloud infrastructure.',
    skills: [
      'JavaScript',
      'Node.js',
      'Express',
      'MongoDB',
      'React',
      'AWS',
      'Docker',
    ],
    education: 'MS Software Engineering, MIT',
    languages: ['English', 'Mandarin'],
    certifications: ['AWS Solutions Architect', 'MongoDB Certified Developer'],
    previousCompanies: ['Amazon', 'Uber', 'TechStart'],
    status: 'pending',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    title: 'UI/UX Designer',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    matchScore: 88,
    experience: '4+ years',
    location: 'New York, NY',
    availability: 'Available immediately',
    description:
      'Creative UI/UX designer with a background in psychology. Focuses on user-centered design principles and creating intuitive interfaces.',
    skills: [
      'Figma',
      'Adobe XD',
      'Sketch',
      'Prototyping',
      'User Research',
      'Wireframing',
      'Design Systems',
    ],
    education: 'BA Psychology, Columbia University',
    languages: ['English', 'Spanish', 'French'],
    certifications: [
      'Google UX Design Certificate',
      'Interaction Design Foundation',
    ],
    previousCompanies: ['Apple', 'Facebook', 'DesignCo'],
    status: 'ai_interview_sent',
  },
  {
    id: 4,
    name: 'David Kim',
    title: 'Backend Developer',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    matchScore: 85,
    experience: '6+ years',
    location: 'Seattle, WA',
    availability: 'Available in 1 month',
    description:
      'Backend specialist with deep knowledge of scalable architecture and database optimization. Experienced in microservices and API design.',
    skills: [
      'Java',
      'Spring Boot',
      'PostgreSQL',
      'Redis',
      'Kubernetes',
      'GraphQL',
      'gRPC',
    ],
    education: 'BS Computer Engineering, University of Washington',
    languages: ['English', 'Korean'],
    certifications: [
      'Oracle Certified Professional',
      'Kubernetes Administrator',
    ],
    previousCompanies: ['Microsoft', 'Amazon', 'CloudTech'],
    status: 'direct_interview_scheduled',
  },
  {
    id: 5,
    name: 'Jessica Williams',
    title: 'DevOps Engineer',
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    matchScore: 82,
    experience: '5+ years',
    location: 'Austin, TX',
    availability: 'Available immediately',
    description:
      'DevOps engineer with a focus on CI/CD pipelines and infrastructure as code. Strong background in cloud platforms and automation.',
    skills: [
      'AWS',
      'Terraform',
      'Jenkins',
      'GitLab CI',
      'Ansible',
      'Prometheus',
      'Grafana',
    ],
    education: 'BS Information Technology, Texas A&M',
    languages: ['English'],
    certifications: ['AWS DevOps Engineer', 'HashiCorp Certified'],
    previousCompanies: ['IBM', 'Dell', 'StartupY'],
    status: 'pending',
  },
];

// Default job description
const defaultJobDescription = {
  title: 'Senior Frontend Developer',
  requirements: [
    '5+ years of experience with modern JavaScript frameworks',
    'Strong proficiency in React and TypeScript',
    'Experience with responsive design and cross-browser compatibility',
    'Knowledge of state management solutions (Redux, Context API)',
    'Understanding of web accessibility standards',
  ],
  responsibilities: [
    'Develop and maintain high-quality, responsive web applications',
    'Collaborate with designers to implement UI/UX designs',
    'Optimize application performance and loading times',
    'Mentor junior developers and conduct code reviews',
    'Participate in agile development processes',
  ],
};

// AI Interview settings
const defaultInterviewSettings = {
  duration: 30, // minutes
  questionCount: 10,
  difficulty: 'medium',
  focusAreas: ['domain', 'problem-solving', 'communication'] as string[],
  customQuestions: [] as string[],
};

const NextStepsPage = () => {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState(defaultJobDescription);
  const [interviewSettings, setInterviewSettings] = useState(
    defaultInterviewSettings
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showInterviewSettings, setShowInterviewSettings] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [availableCredits, setAvailableCredits] = useState(10); // Mock available credits
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] =
    useState(false);
  const [expandedCandidateId, setExpandedCandidateId] = useState<number | null>(
    null
  );
  const [candidates, setCandidates] = useState(mockShortlistedCandidates);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCandidateForDirect, setSelectedCandidateForDirect] = useState<
    number | null
  >(null);

  const [panelEmails, setPanelEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');

  const handleSaveJobDescription = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
  };

  const handleAddCustomQuestion = () => {
    if (customQuestion.trim()) {
      setInterviewSettings({
        ...interviewSettings,
        customQuestions: [...interviewSettings.customQuestions, customQuestion],
      });
      setCustomQuestion('');
    }
  };

  const handleRemoveCustomQuestion = (index: number) => {
    const newCustomQuestions = [...interviewSettings.customQuestions];
    newCustomQuestions.splice(index, 1);
    setInterviewSettings({
      ...interviewSettings,
      customQuestions: newCustomQuestions,
    });
  };

  const handleBackToCandidate = () => {
    router.push('/app/client/candidate');
  };

  const handleSendAIInterview = (candidateId: number) => {
    if (availableCredits > 0) {
      // Update candidate status
      setCandidates(
        candidates.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, status: 'ai_interview_sent' }
            : candidate
        )
      );

      // Deduct credit
      setAvailableCredits(availableCredits - 1);
    }
  };

  const handleScheduleDirectInterview = (candidateId: number) => {
    setSelectedCandidateForDirect(candidateId);
    setShowScheduleModal(true);
  };

  const handleConfirmDirectInterview = () => {
    if (selectedCandidateForDirect) {
      // Update candidate status
      setCandidates(
        candidates.map((candidate) =>
          candidate.id === selectedCandidateForDirect
            ? { ...candidate, status: 'direct_interview_scheduled' }
            : candidate
        )
      );

      // Close modal
      setShowScheduleModal(false);
      setSelectedCandidateForDirect(null);
    }
  };

  const handleGoToDashboard = () => {
    // Check if any actions have been taken
    const hasActions = candidates.some(
      (candidate) => candidate.status !== 'pending'
    );

    if (hasActions) {
      // If actions have been taken, go directly to dashboard
      router.push('/app/client/dashboard');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ai_interview_sent':
        return (
          <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Bot className="h-3 w-3" />
            AI Interview Sent
          </div>
        );
      case 'direct_interview_scheduled':
        return (
          <div className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            <Calendar className="h-3 w-3" />
            Live Interview Scheduled
          </div>
        );
      default:
        return null;
    }
  };

  const toggleCandidateExpansion = (candidateId: number) => {
    if (expandedCandidateId === candidateId) {
      setExpandedCandidateId(null);
    } else {
      setExpandedCandidateId(candidateId);
    }
  };

  const handleAddEmail = () => {
    if (currentEmail.trim() && isValidEmail(currentEmail.trim())) {
      setPanelEmails([...panelEmails, currentEmail.trim()]);
      setCurrentEmail('');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setPanelEmails(panelEmails.filter((email) => email !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (currentEmail.trim() && isValidEmail(currentEmail.trim())) {
        setPanelEmails([...panelEmails, currentEmail.trim()]);
        setCurrentEmail('');
      }
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBackToCandidate}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Candidate
      </Button>
      <div className="mb-6 flex items-center justify-between pt-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
              Next Steps
            </h1>
            <p className="text-muted-foreground text-sm">
              Select candidates for AI interviews
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Available Credits:</span>{' '}
            {availableCredits}
          </div>
          <Button
            onClick={() => setShowInterviewSettings(true)}
            className="flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            Configure AI Interviews
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() =>
              setIsJobDescriptionExpanded(!isJobDescriptionExpanded)
            }
          >
            <div className="flex items-center gap-3">
              <Briefcase className="text-primary h-5 w-5" />
              <div>
                <h2 className="text-lg font-semibold">
                  {jobDescription.title}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {jobDescription.requirements.length} requirements •{' '}
                  {jobDescription.responsibilities.length} responsibilities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isJobDescriptionExpanded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(!isEditing);
                  }}
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              )}
              {isJobDescriptionExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>

          {isJobDescriptionExpanded && (
            <div className="mt-4 border-t pt-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Job Title
                    </label>
                    <Input
                      value={jobDescription.title}
                      onChange={(e) =>
                        setJobDescription({
                          ...jobDescription,
                          title: e.target.value,
                        })
                      }
                      className="mb-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Requirements
                    </label>
                    {jobDescription.requirements.map((req, index) => (
                      <div key={index} className="mb-2 flex gap-2">
                        <Input
                          value={req}
                          onChange={(e) => {
                            const newReqs = [...jobDescription.requirements];
                            newReqs[index] = e.target.value;
                            setJobDescription({
                              ...jobDescription,
                              requirements: newReqs,
                            });
                          }}
                        />
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => {
                            const newReqs = jobDescription.requirements.filter(
                              (_, i) => i !== index
                            );
                            setJobDescription({
                              ...jobDescription,
                              requirements: newReqs,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setJobDescription({
                          ...jobDescription,
                          requirements: [...jobDescription.requirements, ''],
                        });
                      }}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add Requirement
                    </Button>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Responsibilities
                    </label>
                    {jobDescription.responsibilities.map((resp, index) => (
                      <div key={index} className="mb-2 flex gap-2">
                        <Input
                          value={resp}
                          onChange={(e) => {
                            const newResps = [
                              ...jobDescription.responsibilities,
                            ];
                            newResps[index] = e.target.value;
                            setJobDescription({
                              ...jobDescription,
                              responsibilities: newResps,
                            });
                          }}
                        />
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => {
                            const newResps =
                              jobDescription.responsibilities.filter(
                                (_, i) => i !== index
                              );
                            setJobDescription({
                              ...jobDescription,
                              responsibilities: newResps,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setJobDescription({
                          ...jobDescription,
                          responsibilities: [
                            ...jobDescription.responsibilities,
                            '',
                          ],
                        });
                      }}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add Responsibility
                    </Button>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveJobDescription}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Requirements</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {jobDescription.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Responsibilities</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {jobDescription.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold">Shortlisted Candidates</h2>
        <div className="space-y-4">
          {candidates.map((candidate) => {
            const isExpanded = expandedCandidateId === candidate.id;
            const isPending = candidate.status === 'pending';

            return (
              <div
                key={candidate.id}
                className={`relative flex w-full flex-col rounded-lg border p-4 transition-all ${'border-border hover:border-primary/50'} ${
                  !isPending ? 'opacity-80' : ''
                }`}
              >
                <div
                  className="flex cursor-pointer items-start justify-between"
                  onClick={() => toggleCandidateExpansion(candidate.id)}
                >
                  <div className="flex items-start gap-4">
                    <Image
                      src={candidate.image}
                      alt={candidate.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">
                          {candidate.name}
                        </h3>
                        <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          {candidate.matchScore}% Match
                        </div>
                        {getStatusBadge(candidate.status)}
                      </div>
                      <p className="text-muted-foreground mb-1 text-sm">
                        {candidate.title}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>{candidate.experience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{candidate.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScheduleDirectInterview(candidate.id);
                          }}
                          className="min-w-[140px]"
                        >
                          <Calendar className="mr-1 h-4 w-4" />
                          Schedule Direct
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendAIInterview(candidate.id);
                          }}
                          disabled={availableCredits <= 0}
                          className="min-w-[100px]"
                        >
                          <Bot className="mr-1 h-4 w-4" />
                          Send AI Interview
                        </Button>
                      </>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-medium">About</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {candidate.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-medium">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-sm font-medium">Education</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {candidate.education}
                        </p>
                      </div>

                      <div>
                        <h4 className="mb-2 text-sm font-medium">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.languages.map((language, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-sm font-medium">
                          Certifications
                        </h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          {candidate.certifications.map((cert, index) => (
                            <li key={index}>{cert}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-2 text-sm font-medium">
                          Previous Companies
                        </h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          {candidate.previousCompanies.map((company, index) => (
                            <li key={index}>{company}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Interview Settings Modal */}
      {showInterviewSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">AI Interview Settings</h2>
              <Button
                variant="ghost"
                size="default"
                onClick={() => setShowInterviewSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Interview Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={interviewSettings.duration}
                  onChange={(e) =>
                    setInterviewSettings({
                      ...interviewSettings,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  min={15}
                  max={120}
                  step={15}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Number of Questions
                </label>
                <Input
                  type="number"
                  value={interviewSettings.questionCount}
                  onChange={(e) =>
                    setInterviewSettings({
                      ...interviewSettings,
                      questionCount: parseInt(e.target.value) || 0,
                    })
                  }
                  min={5}
                  max={30}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Difficulty Level
                </label>
                <select
                  className="border-input bg-background w-full rounded-md border p-2 text-sm"
                  value={interviewSettings.difficulty}
                  onChange={(e) =>
                    setInterviewSettings({
                      ...interviewSettings,
                      difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                    })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Focus Areas
                </label>
                <div className="space-y-2">
                  {[
                    'domain',
                    'problem-solving',
                    'communication',
                    'cultural-fit',
                  ].map((area) => (
                    <div key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`area-${area}`}
                        checked={interviewSettings.focusAreas.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInterviewSettings({
                              ...interviewSettings,
                              focusAreas: [
                                ...interviewSettings.focusAreas,
                                area,
                              ],
                            });
                          } else {
                            setInterviewSettings({
                              ...interviewSettings,
                              focusAreas: interviewSettings.focusAreas.filter(
                                (a) => a !== area
                              ),
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`area-${area}`}
                        className="text-sm capitalize"
                      >
                        {area.replace('-', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Custom Questions
                </label>
                <div className="mb-2 flex gap-2">
                  <Input
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Add a custom question..."
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddCustomQuestion}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {interviewSettings.customQuestions.length > 0 && (
                  <div className="space-y-2">
                    {interviewSettings.customQuestions.map(
                      (question, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <span className="text-sm">{question}</span>
                          <Button
                            variant="ghost"
                            size="default"
                            onClick={() => handleRemoveCustomQuestion(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t p-4">
              <Button
                variant="outline"
                onClick={() => setShowInterviewSettings(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowInterviewSettings(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Interview Scheduling Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card w-full max-w-md rounded-lg border shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Schedule Live Interview</h2>
              <Button
                variant="ghost"
                size="default"
                onClick={() => setShowScheduleModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Interview Date
                </label>
                <Input type="date" className="mb-2" />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Interview Time
                </label>
                <Input type="time" className="mb-2" />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Interview Duration
                </label>
                <select className="border-input bg-background w-full rounded-md border p-2 text-sm">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Interview Type
                </label>
                <select className="border-input bg-background w-full rounded-md border p-2 text-sm">
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Interview Panel Emails
                </label>
                <div className="rounded-md border p-3">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {panelEmails.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        <span>{email}</span>
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      value={currentEmail}
                      onChange={(e) => setCurrentEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter email and press Enter or comma"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddEmail}
                      disabled={
                        !currentEmail.trim() ||
                        !isValidEmail(currentEmail.trim())
                      }
                    >
                      Add
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Enter email addresses separated by commas or press Enter
                    after each email
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <textarea
                  className="border-input bg-background w-full rounded-md border p-2 text-sm"
                  rows={3}
                  placeholder="Add any notes for the interview..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t p-4">
              <Button
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmDirectInterview}>
                Schedule Interview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Go to Dashboard Button */}
      <div className="mt-8 flex">
        <Button
          onClick={handleGoToDashboard}
          className="flex items-center gap-2 px-6 py-2 text-white"
        >
          <ArrowRight className="h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NextStepsPage;
