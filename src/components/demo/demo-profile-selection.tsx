'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  ArrowRight,
  Code,
  Users,
  Briefcase,
  Star,
  Clock,
  CheckCircle2,
  Search,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoService } from '@/lib/services/services';
import { logger } from '@/lib/logger';

interface DemoProfileSelectionProps {
  onProfileSelected: (profile: any) => void;
  onBack: () => void;
}

interface DemoProfile {
  id: string;
  title: string;
  category: 'technical' | 'non-technical';
  experienceLevel: string;
  description: string;
  skills: string[];
  industries: string[];
  questions: any[];
  assessmentCriteria: any;
}

export function DemoProfileSelection({
  onProfileSelected,
  onBack,
}: DemoProfileSelectionProps) {
  const [profiles, setProfiles] = useState<DemoProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<DemoProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'technical' | 'non-technical'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<DemoProfile | null>(
    null
  );
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock profiles data (in real app, this would come from API)
  const mockProfiles: DemoProfile[] = [
    {
      id: 'senior-software-engineer',
      title: 'Senior Software Engineer',
      category: 'technical',
      experienceLevel: '5+ years',
      description:
        'Full-stack development with focus on scalable systems and team leadership',
      skills: [
        'React',
        'Node.js',
        'AWS',
        'System Design',
        'TypeScript',
        'Docker',
      ],
      industries: ['Technology', 'Fintech', 'E-commerce'],
      questions: [],
      assessmentCriteria: {},
    },
    {
      id: 'data-scientist',
      title: 'Data Scientist',
      category: 'technical',
      experienceLevel: '3+ years',
      description:
        'Machine learning and data analysis for business insights and decision making',
      skills: [
        'Python',
        'Machine Learning',
        'SQL',
        'Statistics',
        'TensorFlow',
        'Pandas',
      ],
      industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce'],
      questions: [],
      assessmentCriteria: {},
    },
    {
      id: 'devops-engineer',
      title: 'DevOps Engineer',
      category: 'technical',
      experienceLevel: '4+ years',
      description:
        'Infrastructure automation and deployment pipelines for scalable applications',
      skills: [
        'Kubernetes',
        'Docker',
        'CI/CD',
        'AWS',
        'Monitoring',
        'Terraform',
      ],
      industries: ['Technology', 'Fintech', 'Healthcare'],
      questions: [],
      assessmentCriteria: {},
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      category: 'technical',
      experienceLevel: '6+ years',
      description:
        'Product strategy and roadmap development with cross-functional team leadership',
      skills: [
        'Product Strategy',
        'Analytics',
        'User Research',
        'Roadmapping',
        'Stakeholder Management',
      ],
      industries: ['Technology', 'Fintech', 'E-commerce', 'SaaS'],
      questions: [],
      assessmentCriteria: {},
    },
    {
      id: 'sales-manager',
      title: 'Sales Manager',
      category: 'non-technical',
      experienceLevel: '5+ years',
      description:
        'Sales strategy and team leadership with focus on revenue growth',
      skills: [
        'CRM',
        'Lead Generation',
        'Team Management',
        'Sales Strategy',
        'Negotiation',
      ],
      industries: ['Technology', 'Finance', 'Healthcare', 'Manufacturing'],
      questions: [],
      assessmentCriteria: {},
    },
    {
      id: 'marketing-specialist',
      title: 'Marketing Specialist',
      category: 'non-technical',
      experienceLevel: '3+ years',
      description:
        'Digital marketing and brand strategy with data-driven campaign optimization',
      skills: [
        'Digital Marketing',
        'Analytics',
        'Content Strategy',
        'SEO',
        'Social Media',
      ],
      industries: ['Technology', 'E-commerce', 'Retail', 'SaaS'],
      questions: [],
      assessmentCriteria: {},
    },
    {
      id: 'hr-business-partner',
      title: 'HR Business Partner',
      category: 'non-technical',
      experienceLevel: '4+ years',
      description:
        'Human resources strategy and employee relations with talent development focus',
      skills: [
        'Recruitment',
        'Employee Relations',
        'Policy Development',
        'Talent Management',
      ],
      industries: ['Technology', 'Finance', 'Healthcare', 'Manufacturing'],
      questions: [],
      assessmentCriteria: {},
    },
    {
      id: 'customer-success-manager',
      title: 'Customer Success Manager',
      category: 'non-technical',
      experienceLevel: '3+ years',
      description:
        'Customer retention and account management with growth strategy expertise',
      skills: [
        'Account Management',
        'Customer Retention',
        'Analytics',
        'Relationship Building',
      ],
      industries: ['Technology', 'SaaS', 'E-commerce', 'Finance'],
      questions: [],
      assessmentCriteria: {},
    },
  ];

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const fetchedProfiles = await demoService.getDemoProfiles();
        setProfiles(fetchedProfiles);
        setFilteredProfiles(fetchedProfiles);
      } catch (error) {
        logger.error('Error loading profiles:', error);
        setProfiles(mockProfiles);
        setFilteredProfiles(mockProfiles);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, []);

  useEffect(() => {
    let filtered = profiles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (profile) => profile.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (profile) =>
          profile.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          profile.industries.some((industry) =>
            industry.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredProfiles(filtered);
  }, [profiles, selectedCategory, searchTerm]);

  const handleProfileSelect = (profile: DemoProfile) => {
    setSelectedProfile(profile);
  };

  const handleStartAssessment = async () => {
    if (selectedProfile) {
      try {
        const session = await demoService.startDemoAssessment({
          profileId: selectedProfile.id,
          candidateName: candidateName || 'Demo Candidate',
          candidateEmail: candidateEmail || 'demo@example.com',
        });

        onProfileSelected({
          ...selectedProfile,
          sessionId: session.sessionId,
          candidateName: session.candidateName,
          candidateEmail: session.candidateEmail,
        });
      } catch (error) {
        logger.error('Error starting assessment:', error);
        onProfileSelected({
          ...selectedProfile,
          candidateName: candidateName || 'Demo Candidate',
          candidateEmail: candidateEmail || 'demo@example.com',
        });
      }
    }
  };

  const categories = [
    { id: 'all', label: 'All Roles', icon: Briefcase, count: profiles.length },
    {
      id: 'technical',
      label: 'Technical',
      icon: Code,
      count: profiles.filter((p) => p.category === 'technical').length,
    },
    {
      id: 'non-technical',
      label: 'Non-Technical',
      icon: Users,
      count: profiles.filter((p) => p.category === 'non-technical').length,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading demo profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Demo</span>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              Teamcast AI
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Choose Your Demo Role
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Select a role to experience our AI interviewer. Each role has
            tailored questions and assessment criteria designed for that
            specific position.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search roles, skills, or industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id as any)}
                  className="flex items-center space-x-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Profile Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-300 hover:shadow-lg',
                  selectedProfile?.id === profile.id
                    ? 'shadow-lg ring-2 ring-blue-500'
                    : 'hover:shadow-md'
                )}
                onClick={() => handleProfileSelect(profile)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {profile.category === 'technical' ? (
                        <Code className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Users className="h-5 w-5 text-green-600" />
                      )}
                      <Badge
                        variant={
                          profile.category === 'technical'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {profile.category === 'technical'
                          ? 'Technical'
                          : 'Non-Technical'}
                      </Badge>
                    </div>
                    {selectedProfile?.id === profile.id && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{profile.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {profile.experienceLevel} •{' '}
                    {profile.industries.slice(0, 2).join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                    {profile.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-500">
                        Key Skills
                      </Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {profile.skills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Selected Profile Details */}
        {selectedProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span>Selected: {selectedProfile.title}</span>
                </CardTitle>
                <CardDescription>{selectedProfile.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Assessment Details
                    </Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Duration: ~5 minutes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Star className="h-4 w-4 text-gray-500" />
                        <span>3 tailored questions</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-gray-500" />
                        <span>Real-time AI analysis</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Candidate Information (Optional)
                    </Label>
                    <div className="mt-2 space-y-3">
                      <Input
                        placeholder="Your name (optional)"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                      />
                      <Input
                        placeholder="Your email (optional)"
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            onClick={handleStartAssessment}
            disabled={!selectedProfile}
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg text-white hover:from-blue-700 hover:to-purple-700"
          >
            Start AI Interview Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
