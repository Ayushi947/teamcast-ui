import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AnimatePresence, motion, easeIn, easeOut } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Job description type
interface JobDescription {
  title: string;
  location: string;
  compensation: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  mustHaveSkills: string[];
  goodToHaveSkills: string[];
  responsibilities: string[];
}

interface AIJobEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobDescription: JobDescription;
  setJobDescription: (jobDescription: JobDescription) => void;
}

export const AIJobEditor = ({
  open,
  onOpenChange,
  setJobDescription,
}: AIJobEditorProps) => {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiJobPrompt, setAiJobPrompt] = useState('');
  const [aiSkillLevel, setAiSkillLevel] = useState(3);
  const [aiJobType, setAiJobType] = useState('fulltime');
  const [aiModeSpecific, setAiModeSpecific] = useState(true);
  const [aiLocation, setAiLocation] = useState('San Francisco, CA');
  const [aiRemoteOption, setAiRemoteOption] = useState(true);
  const [aiCompensationRange, setAiCompensationRange] = useState<
    [number, number]
  >([120000, 160000]);
  const [aiGoodToHaveSkills, setAiGoodToHaveSkills] = useState<string[]>([]);
  const [aiSkillInput, setAiSkillInput] = useState('');
  const [aiMustHaveSkills, setAiMustHaveSkills] = useState<string[]>([]);
  const [previewJobDescription, setPreviewJobDescription] =
    useState<JobDescription | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    jobTitle?: string;
    location?: string;
  }>({});
  const [justGenerated, setJustGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState('guided');

  // Validation check
  useEffect(() => {
    const errors: {
      jobTitle?: string;
      location?: string;
    } = {};

    if (!aiJobPrompt.trim()) {
      errors.jobTitle = 'Job title is required';
    }

    if (!aiLocation.trim()) {
      errors.location = 'Location is required';
    }

    setValidationErrors(errors);
  }, [aiJobPrompt, aiLocation]);

  // Check if form is valid for generation
  const isFormValid = () => {
    return (
      Object.keys(validationErrors).length === 0 && aiJobPrompt.trim() !== ''
    );
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  const addSkill = (type: 'must' | 'good') => {
    if (!aiSkillInput.trim()) return;
    const skillToAdd = aiSkillInput.trim();

    if (type === 'must') {
      if (!aiMustHaveSkills.includes(skillToAdd)) {
        setAiMustHaveSkills([...aiMustHaveSkills, skillToAdd]);
      }
    } else {
      // type === 'good'
      if (!aiGoodToHaveSkills.includes(skillToAdd)) {
        setAiGoodToHaveSkills([...aiGoodToHaveSkills, skillToAdd]);
      }
    }
    setAiSkillInput(''); // Clear the single input field after adding
  };

  const removeSkill = (skill: string, type: 'must' | 'good') => {
    if (type === 'must') {
      setAiMustHaveSkills(aiMustHaveSkills.filter((s) => s !== skill));
    } else {
      setAiGoodToHaveSkills(aiGoodToHaveSkills.filter((s) => s !== skill));
    }
  };

  const generateJobWithAI = () => {
    if (!isFormValid()) return;

    setAiGenerating(true);
    setJustGenerated(false);

    // Simulate AI generation with a timeout
    setTimeout(() => {
      const locationText = aiRemoteOption
        ? `${aiLocation} (Remote Available)`
        : aiLocation;

      const newJobDescription = {
        title: aiModeSpecific ? `Senior ${aiJobPrompt} Developer` : aiJobPrompt,
        location: locationText,
        compensation: {
          min: aiCompensationRange[0],
          max: aiCompensationRange[1],
          currency: 'USD',
        },
        requirements: [
          `${aiSkillLevel}+ years of experience with modern frameworks`,
          `Strong proficiency in ${aiJobType === 'fulltime' ? 'full-stack development' : 'contract-based delivery'}`,
          'Experience with collaborative team environments',
          'Knowledge of industry best practices and standards',
          'Understanding of performance optimization techniques',
        ],
        mustHaveSkills:
          aiMustHaveSkills.length > 0
            ? aiMustHaveSkills
            : ['JavaScript', 'React', 'TypeScript'],
        goodToHaveSkills:
          aiGoodToHaveSkills.length > 0
            ? aiGoodToHaveSkills
            : ['Next.js', 'GraphQL', 'CSS-in-JS libraries'],
        responsibilities: [
          'Develop and maintain high-quality applications',
          'Collaborate with cross-functional teams',
          'Optimize application performance',
          'Mentor junior developers and conduct code reviews',
          'Participate in agile development processes',
        ],
      };

      setPreviewJobDescription(newJobDescription);
      setJobDescription(newJobDescription);
      setAiGenerating(false);
      setJustGenerated(true);

      // Switch to the preview tab
      setActiveTab('preview');

      toast.success('Your AI-generated job description is ready to view.');
    }, 1500);
  };

  const getTabIcon = (tabName: string) => {
    switch (tabName) {
      case 'guided':
        return <Settings className="mr-2 h-4 w-4" />;
      case 'advanced':
        return <Bot className="mr-2 h-4 w-4" />;
      case 'preview':
        return <FileText className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  // Tab transition animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: easeOut },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2, ease: easeIn },
    },
  };

  // Button animation variants
  const buttonVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: easeOut },
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.9,
      transition: { duration: 0.2, ease: easeIn },
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[700px] max-h-[85vh] flex-col p-0 sm:max-w-[700px]">
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bot className="h-5 w-5 text-blue-500" />
            AI-Powered Job Description
          </DialogTitle>
          <DialogDescription className="text-base">
            Let AI help you create the perfect job description for finding the
            right candidate.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="guided" className="flex items-center">
                {getTabIcon('guided')}
                Setup
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center">
                {getTabIcon('advanced')}
                Advanced
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="flex items-center"
                disabled={!previewJobDescription}
              >
                {getTabIcon('preview')}
                {justGenerated && (
                  <span className="relative mr-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                )}
                Preview
                {justGenerated && (
                  <Badge className="ml-1.5 h-5 bg-green-100 px-1.5 text-xs text-green-700">
                    New
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {activeTab === 'guided' && (
                <motion.div
                  key="guided-tab"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="guided" className="space-y-6" forceMount>
                    {/* Job Title */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="jobRole"
                        className="text-base font-medium"
                      >
                        Job Role / Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="jobRole"
                        placeholder="e.g., Senior Software Engineer, UI/UX Lead"
                        className={`text-base ${validationErrors.jobTitle ? 'border-red-500' : ''}`}
                        value={aiJobPrompt}
                        onChange={(e) => setAiJobPrompt(e.target.value)}
                      />
                      {validationErrors.jobTitle && (
                        <p className="text-xs text-red-500">
                          {validationErrors.jobTitle}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Be specific about the role.
                      </p>
                    </div>

                    <Separator />

                    {/* Experience and Experience Type - Side by Side */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">
                            Experience Level
                          </Label>
                          <span className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
                            {aiSkillLevel} yrs
                          </span>
                        </div>
                        <Slider
                          min={0}
                          max={15}
                          step={1}
                          value={[aiSkillLevel]}
                          onValueChange={(value: number[]) =>
                            setAiSkillLevel(value[0])
                          }
                          className="pt-2 pb-1"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Entry</span>
                          <span>Junior</span>
                          <span>Senior</span>
                          <span>Lead+</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          Experience Type
                        </Label>
                        <RadioGroup
                          value={aiJobType}
                          onValueChange={setAiJobType}
                          className="space-y-2 pt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fulltime" id="fulltime" />
                            <Label htmlFor="fulltime" className="font-normal">
                              Full-Time
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="contract" id="contract" />
                            <Label htmlFor="contract" className="font-normal">
                              Contract
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="parttime" id="parttime" />
                            <Label htmlFor="parttime" className="font-normal">
                              Part-Time
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <Separator />

                    {/* Location - Stacked */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="location"
                        className="text-base font-medium"
                      >
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="location"
                          placeholder="e.g., New York, NY or Remote"
                          value={aiLocation}
                          onChange={(e) => setAiLocation(e.target.value)}
                          className={`flex-1 text-base ${validationErrors.location ? 'border-red-500' : ''}`}
                        />
                        <div className="flex items-center space-x-2 whitespace-nowrap">
                          <Switch
                            id="remote-option"
                            checked={aiRemoteOption}
                            onCheckedChange={setAiRemoteOption}
                          />
                          <Label
                            htmlFor="remote-option"
                            className="text-sm font-normal"
                          >
                            Remote Option
                          </Label>
                        </div>
                      </div>
                      {validationErrors.location && (
                        <p className="text-xs text-red-500">
                          {validationErrors.location}
                        </p>
                      )}
                    </div>

                    {/* Compact Compensation Range Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          Compensation Range (USD)
                        </Label>
                        <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(aiCompensationRange[0])} -{' '}
                          {formatCurrency(aiCompensationRange[1])}
                        </div>
                      </div>

                      <div className="relative mt-1 pt-3 pb-6">
                        {/* Track Background */}
                        <div className="absolute top-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>

                        {/* Track Fill */}
                        <div
                          className="absolute top-3 h-2 rounded-full bg-indigo-500 dark:bg-indigo-600"
                          style={{
                            left: `${((aiCompensationRange[0] - 30000) / (500000 - 30000)) * 100}%`,
                            width: `${((aiCompensationRange[1] - aiCompensationRange[0]) / (500000 - 30000)) * 100}%`,
                          }}
                        ></div>

                        {/* Range Slider */}
                        <Slider
                          min={30000}
                          max={500000}
                          step={5000}
                          value={aiCompensationRange}
                          onValueChange={(value: [number, number]) =>
                            setAiCompensationRange(value)
                          }
                          className="relative z-10"
                        />

                        {/* Tick Marks */}
                        <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>$30k</span>
                          <span>$100k</span>
                          <span>$250k</span>
                          <span>$400k</span>
                          <span>$500k</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Skills Section */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Skills</Label>
                      <div className="flex gap-2">
                        <Input
                          id="aiSkillInput"
                          placeholder="Enter skill & click add (e.g., React, Python, AWS)"
                          value={aiSkillInput}
                          onChange={(e) => setAiSkillInput(e.target.value)}
                          className="flex-1 text-base"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill('must')}
                          disabled={!aiSkillInput.trim()}
                          className="border-indigo-300 whitespace-nowrap text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                        >
                          <Plus className="mr-1 h-4 w-4" /> Add Required
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill('good')}
                          disabled={!aiSkillInput.trim()}
                          className="border-gray-300 whitespace-nowrap text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700/50"
                        >
                          <Plus className="mr-1 h-4 w-4" /> Add Preferred
                        </Button>
                      </div>

                      {/* Required and Preferred Skills */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-700 dark:text-gray-300">
                            Required Skills
                          </Label>
                          <div className="flex min-h-[60px] flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/30">
                            {aiMustHaveSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="default"
                                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/70"
                              >
                                {skill}
                                <button
                                  className="ml-1.5 rounded-full p-0.5 transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-800"
                                  onClick={() => removeSkill(skill, 'must')}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            {aiMustHaveSkills.length === 0 && (
                              <span className="p-1 text-sm text-gray-500 italic">
                                No required skills added.
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-700 dark:text-gray-300">
                            Preferred Skills
                          </Label>
                          <div className="flex min-h-[60px] flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/30">
                            {aiGoodToHaveSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700/70"
                              >
                                {skill}
                                <button
                                  className="ml-1.5 rounded-full p-0.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                                  onClick={() => removeSkill(skill, 'good')}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            {aiGoodToHaveSkills.length === 0 && (
                              <span className="p-1 text-sm text-gray-500 italic">
                                No preferred skills added.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Generation Options */}
                    <div>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="mode-specific"
                          checked={aiModeSpecific}
                          onCheckedChange={setAiModeSpecific}
                        />
                        <Label
                          htmlFor="mode-specific"
                          className="text-base font-medium"
                        >
                          Generate detailed, role-specific requirements &
                          responsibilities
                        </Label>
                      </div>
                      <p className="mt-1 pl-10 text-xs text-gray-500 dark:text-gray-400">
                        If unchecked, AI will generate a more generic
                        description based on the title.
                      </p>
                    </div>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === 'advanced' && (
                <motion.div
                  key="advanced-tab"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="advanced" forceMount>
                    <div className="space-y-2">
                      <Label htmlFor="prompt" className="text-base font-medium">
                        Describe your ideal candidate and requirements{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="prompt"
                        placeholder="Describe the job requirements, skills, experience level, and any specific qualifications in detail..."
                        className={`min-h-[400px] resize-none ${validationErrors.jobTitle ? 'border-red-500' : ''}`}
                        value={aiJobPrompt}
                        onChange={(e) => setAiJobPrompt(e.target.value)}
                      />
                      {validationErrors.jobTitle && (
                        <p className="text-xs text-red-500">
                          Please provide a detailed job description
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === 'preview' && (
                <motion.div
                  key="preview-tab"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="preview" forceMount>
                    {previewJobDescription ? (
                      <div
                        className={`rounded-md border ${
                          justGenerated
                            ? 'border-indigo-400 bg-indigo-50/50 dark:border-indigo-700 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        } overflow-hidden transition-all duration-300`}
                      >
                        {/* Preview Content */}
                        <div className="p-5">
                          {justGenerated && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="mb-4 flex items-center rounded-md bg-green-50 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              <CheckCircle2 className="mr-2 h-5 w-5" />
                              <p className="text-sm font-medium">
                                Job description successfully generated!
                              </p>
                            </motion.div>
                          )}

                          <h3 className="mb-3 text-xl font-semibold">
                            {previewJobDescription.title}
                          </h3>

                          <div className="mb-4 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-gray-100">
                              {previewJobDescription.location}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-indigo-100 text-indigo-700"
                            >
                              $
                              {previewJobDescription.compensation.min.toLocaleString()}{' '}
                              - $
                              {previewJobDescription.compensation.max.toLocaleString()}{' '}
                              {previewJobDescription.compensation.currency}
                            </Badge>
                          </div>

                          <div className="mb-6">
                            <h4 className="mb-2 text-base font-medium">
                              Requirements:
                            </h4>
                            <ul className="ml-5 list-disc space-y-1 text-sm">
                              {previewJobDescription.requirements.map(
                                (req, index) => (
                                  <li key={index}>{req}</li>
                                )
                              )}
                            </ul>
                          </div>

                          <div className="mb-6">
                            <h4 className="mb-2 text-base font-medium">
                              Responsibilities:
                            </h4>
                            <ul className="ml-5 list-disc space-y-1 text-sm">
                              {previewJobDescription.responsibilities.map(
                                (resp, index) => (
                                  <li key={index}>{resp}</li>
                                )
                              )}
                            </ul>
                          </div>

                          <div className="mb-6 grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="mb-2 text-base font-medium">
                                Required Skills:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {previewJobDescription.mustHaveSkills.map(
                                  (skill, index) => (
                                    <Badge
                                      key={index}
                                      className="bg-indigo-100 text-indigo-700"
                                    >
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-2 text-base font-medium">
                                Preferred Skills:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {previewJobDescription.goodToHaveSkills.map(
                                  (skill, index) => (
                                    <Badge key={index} variant="outline">
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <FileText className="mr-1 h-4 w-4" />
                              Ready to use in your job listing
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-[460px] flex-col items-center justify-center text-center text-gray-500">
                        <FileText className="mb-3 h-12 w-12 opacity-20" />
                        <h3 className="mb-1 text-lg font-medium">
                          No job description generated yet
                        </h3>
                        <p className="mb-4 max-w-md text-sm">
                          Fill out the form in the Setup tab and click &quot;
                          Generate Job Description&quot; to create a job
                          description.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('guided')}
                        >
                          Go to Setup
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="border-t p-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <AnimatePresence mode="wait">
            {activeTab === 'preview' ? (
              <motion.div
                key="use-button"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Button
                  onClick={() => onOpenChange(false)}
                  className="relative bg-indigo-600 hover:bg-indigo-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Use This Description
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="generate-button"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Button
                  onClick={generateJobWithAI}
                  disabled={!isFormValid() || aiGenerating}
                  className="relative"
                  title={
                    !isFormValid() ? 'Please fill all required fields' : ''
                  }
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Generate Job Description
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
