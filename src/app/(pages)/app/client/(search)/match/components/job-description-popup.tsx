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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Briefcase, Edit, FileText } from 'lucide-react';
import { useState } from 'react';

// Job Description type
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

interface JobDescriptionPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobDescription: JobDescription;
  onEditWithAI: () => void;
  onUpdateJobDescription: (updatedJob: JobDescription) => void;
}

export const JobDescriptionPopup = ({
  open,
  onOpenChange,
  jobDescription,
  onEditWithAI,
  onUpdateJobDescription,
}: JobDescriptionPopupProps) => {
  const [title, setTitle] = useState(jobDescription.title);
  const [location, setLocation] = useState(jobDescription.location);
  const [minSalary, setMinSalary] = useState<number>(
    jobDescription.compensation.min
  );
  const [maxSalary, setMaxSalary] = useState<number>(
    jobDescription.compensation.max
  );
  const [requirements, setRequirements] = useState(
    jobDescription.requirements.join('\n')
  );
  const [responsibilities, setResponsibilities] = useState(
    jobDescription.responsibilities.join('\n')
  );
  const [mustHaveSkills, setMustHaveSkills] = useState(
    jobDescription.mustHaveSkills.join(', ')
  );
  const [goodToHaveSkills, setGoodToHaveSkills] = useState(
    jobDescription.goodToHaveSkills.join(', ')
  );
  const [activeTab, setActiveTab] = useState('form');

  // Plain text representation of the job description
  const plainTextJobDescription = `
Job Title: ${title}
Location: ${location}
Compensation: $${minSalary} - $${maxSalary} USD

Requirements:
${requirements
  .split('\n')
  .map((req) => `- ${req}`)
  .join('\n')}

Responsibilities:
${responsibilities
  .split('\n')
  .map((resp) => `- ${resp}`)
  .join('\n')}

Must Have Skills:
${mustHaveSkills
  .split(',')
  .map((skill) => `- ${skill.trim()}`)
  .join('\n')}

Good to Have Skills:
${goodToHaveSkills
  .split(',')
  .map((skill) => `- ${skill.trim()}`)
  .join('\n')}
`.trim();

  const handleSave = () => {
    const updatedJob: JobDescription = {
      ...jobDescription,
      title,
      location,
      compensation: {
        min: typeof minSalary === 'string' ? parseInt(minSalary) : minSalary,
        max: typeof maxSalary === 'string' ? parseInt(maxSalary) : maxSalary,
        currency: 'USD',
      },
      requirements: requirements
        .split('\n')
        .filter((line: string) => line.trim()),
      responsibilities: responsibilities
        .split('\n')
        .filter((line: string) => line.trim()),
      mustHaveSkills: mustHaveSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      goodToHaveSkills: goodToHaveSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
    };
    onUpdateJobDescription(updatedJob);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[700px] max-h-[85vh] flex-col p-0 sm:max-w-[700px]">
        {/* Fixed Header */}
        <DialogHeader className="border-b px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            <DialogTitle className="text-xl">Job Description</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Edit the job description or use AI to help generate it.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="border-b px-6 py-2">
          <Tabs
            defaultValue="form"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form" className="flex items-center gap-1.5">
                <Edit className="h-4 w-4" />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Plain Text</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'form' ? (
            <div className="space-y-5 px-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Job Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-salary" className="text-sm font-medium">
                    Minimum Salary (USD)
                  </Label>
                  <Input
                    id="min-salary"
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-salary" className="text-sm font-medium">
                    Maximum Salary (USD)
                  </Label>
                  <Input
                    id="max-salary"
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(Number(e.target.value))}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm font-medium">
                  Requirements
                </Label>
                <Textarea
                  id="requirements"
                  rows={5}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="One requirement per line"
                  className="resize-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500">
                  One requirement per line
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="responsibilities"
                  className="text-sm font-medium"
                >
                  Responsibilities
                </Label>
                <Textarea
                  id="responsibilities"
                  rows={5}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="One responsibility per line"
                  className="resize-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500">
                  One responsibility per line
                </p>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label
                  htmlFor="must-have-skills"
                  className="text-sm font-medium"
                >
                  Must Have Skills
                </Label>
                <Textarea
                  id="must-have-skills"
                  rows={2}
                  value={mustHaveSkills}
                  onChange={(e) => setMustHaveSkills(e.target.value)}
                  placeholder="Add skills separated by commas"
                  className="resize-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500">
                  Comma-separated list of required skills
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="good-to-have-skills"
                  className="text-sm font-medium"
                >
                  Good to Have Skills
                </Label>
                <Textarea
                  id="good-to-have-skills"
                  rows={2}
                  value={goodToHaveSkills}
                  onChange={(e) => setGoodToHaveSkills(e.target.value)}
                  placeholder="Add skills separated by commas"
                  className="resize-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500">
                  Comma-separated list of nice-to-have skills
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col px-6 py-4">
              <Textarea
                value={plainTextJobDescription}
                readOnly
                className="w-full flex-1 resize-none border-gray-300 font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500"
                style={{ height: 'calc(100% - 16px)' }}
              />
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-end border-t px-6 py-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onEditWithAI}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
            >
              <Bot className="mr-2 h-4 w-4 text-blue-500" />
              Edit with AI
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
