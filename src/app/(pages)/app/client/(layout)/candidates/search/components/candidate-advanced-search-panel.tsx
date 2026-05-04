'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Plus,
  X,
  Filter,
  Sparkles,
  MapPin,
  Briefcase,
  Code,
  CheckCheck,
  RotateCcw,
  Zap,
  ChevronDown,
} from 'lucide-react';

// Search interfaces
interface CandidateSearchFilter {
  id: string;
  type:
    | 'skills'
    | 'location'
    | 'experience'
    | 'salary'
    | 'jobTitle'
    | 'education'
    | 'status';
  label: string;
  value: string | number | string[] | { min: number; max: number };
  operator: 'contains' | 'equals' | 'range' | 'in';
}

interface CandidateAdvancedSearchState {
  filters: CandidateSearchFilter[];
  quickFilters: {
    isRemote: boolean;
    availableNow: boolean;
    verified: boolean;
  };
  experienceRange: [number, number];
  salaryRange: [number, number];
  searchText: string;
}

interface CandidateAdvancedSearchPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  onSearch: (searchState: CandidateAdvancedSearchState) => void;
  onClear: () => void;
}

const SKILL_SUGGESTIONS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'C#',
  'PHP',
  'Ruby',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Azure',
  'Docker',
  'Kubernetes',
  'Git',
  'CI/CD',
  'Agile',
  'DevOps',
  'UI/UX',
  'Figma',
  'Photoshop',
  'Machine Learning',
  'AI',
  'Data Science',
  'Blockchain',
];

const LOCATION_SUGGESTIONS = [
  'New York, NY',
  'San Francisco, CA',
  'Los Angeles, CA',
  'Seattle, WA',
  'Austin, TX',
  'Chicago, IL',
  'Boston, MA',
  'Denver, CO',
  'Remote',
  'Hybrid',
  'On-site',
];

const JOB_TITLE_SUGGESTIONS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer',
  'QA Engineer',
  'Mobile Developer',
  'Machine Learning Engineer',
  'System Administrator',
  'Technical Lead',
];
export function CandidateAdvancedSearchPanel({
  isVisible,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggle,
  onSearch,
  onClear,
}: CandidateAdvancedSearchPanelProps) {
  const [searchState, setSearchState] = useState<CandidateAdvancedSearchState>({
    filters: [],
    quickFilters: {
      isRemote: false,
      availableNow: false,
      verified: false,
    },
    experienceRange: [0, 15],
    salaryRange: [30000, 200000],
    searchText: '',
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [isSkillsPopoverOpen, setIsSkillsPopoverOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addFilter = (type: CandidateSearchFilter['type'], value: any) => {
    const filterId = generateId();
    const filterLabels = {
      skills: 'Skills',
      location: 'Location',
      experience: 'Experience',
      salary: 'Salary',
      jobTitle: 'Job Title',
      education: 'Education',
      status: 'Status',
    };

    const newFilter: CandidateSearchFilter = {
      id: filterId,
      type,
      label: filterLabels[type],
      value,
      operator:
        type === 'skills'
          ? 'in'
          : type === 'experience' || type === 'salary'
            ? 'range'
            : 'contains',
    };

    setSearchState((prev) => ({
      ...prev,
      filters: [...prev.filters, newFilter],
    }));
  };

  const removeFilter = (id: string) => {
    setSearchState((prev) => ({
      ...prev,
      filters: prev.filters.filter((filter) => filter.id !== id),
    }));
  };

  const updateQuickFilter = (
    key: keyof CandidateAdvancedSearchState['quickFilters'],
    value: boolean
  ) => {
    setSearchState((prev) => ({
      ...prev,
      quickFilters: {
        ...prev.quickFilters,
        [key]: value,
      },
    }));
  };

  const addSkill = (skill: string) => {
    if (
      !selectedSkills.includes(skill) &&
      skill.trim() !== '' &&
      selectedSkills.length < 10
    ) {
      setSelectedSkills((prev) => [...prev, skill]);
      setSkillsInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  useEffect(() => {
    if (selectedSkills.length > 0) {
      // Check if we already have a skills filter
      const existingSkillFilter = searchState.filters.find(
        (f) => f.type === 'skills'
      );

      if (existingSkillFilter) {
        // Update existing filter
        setSearchState((prev) => ({
          ...prev,
          filters: prev.filters.map((f) =>
            f.id === existingSkillFilter.id
              ? { ...f, value: selectedSkills }
              : f
          ),
        }));
      } else {
        // Add new filter
        addFilter('skills', selectedSkills);
      }
    } else {
      // Remove skills filter if no skills selected
      setSearchState((prev) => ({
        ...prev,
        filters: prev.filters.filter((f) => f.type !== 'skills'),
      }));
    }
  }, [selectedSkills]);

  const handleApplySearch = () => {
    onSearch(searchState);
  };

  const handleClearAll = () => {
    setSearchState({
      filters: [],
      quickFilters: {
        isRemote: false,
        availableNow: false,
        verified: false,
      },
      experienceRange: [0, 15],
      salaryRange: [30000, 200000],
      searchText: '',
    });
    setSelectedSkills([]);
    onClear();
  };

  const getFilterValue = (filter: CandidateSearchFilter) => {
    let range: [number, number];
    switch (filter.type) {
      case 'skills':
        return Array.isArray(filter.value)
          ? filter.value.join(', ')
          : String(filter.value);
      case 'experience':
      case 'salary':
        range = filter.value as unknown as [number, number];
        if (filter.type === 'salary') {
          return `$${range[0].toLocaleString()} - $${range[1].toLocaleString()}`;
        }
        return `${range[0]} - ${range[1]} years`;
      default:
        return String(filter.value);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Advanced Search Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Filters */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Quick Filters
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="remote-filter"
                    className="flex cursor-pointer items-center gap-2 text-sm font-normal text-gray-700 dark:text-gray-300"
                  >
                    <MapPin className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span>Remote Only</span>
                  </Label>
                  <Switch
                    id="remote-filter"
                    checked={searchState.quickFilters.isRemote}
                    onCheckedChange={(checked) =>
                      updateQuickFilter('isRemote', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="available-filter"
                    className="flex cursor-pointer items-center gap-2 text-sm font-normal text-gray-700 dark:text-gray-300"
                  >
                    <Zap className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span>Available Now</span>
                  </Label>
                  <Switch
                    id="available-filter"
                    checked={searchState.quickFilters.availableNow}
                    onCheckedChange={(checked) =>
                      updateQuickFilter('availableNow', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="verified-filter"
                    className="flex cursor-pointer items-center gap-2 text-sm font-normal text-gray-700 dark:text-gray-300"
                  >
                    <CheckCheck className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span>Verified Profiles</span>
                  </Label>
                  <Switch
                    id="verified-filter"
                    checked={searchState.quickFilters.verified}
                    onCheckedChange={(checked) =>
                      updateQuickFilter('verified', checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Skills
              </h3>

              <div className="space-y-2">
                <Popover
                  open={isSkillsPopoverOpen}
                  onOpenChange={setIsSkillsPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isSkillsPopoverOpen}
                      className="w-full justify-between border-gray-200 bg-white text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <div className="flex items-center gap-2">
                        <Code className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="truncate">
                          {skillsInput || 'Select or type skills...'}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] border-gray-200 bg-white p-0 dark:border-gray-700 dark:bg-gray-800">
                    <Command className="dark:bg-gray-800">
                      <CommandInput
                        placeholder="Search skills..."
                        value={skillsInput}
                        onValueChange={setSkillsInput}
                        className="h-9 border-gray-200 dark:border-gray-700"
                      />
                      <CommandList className="max-h-[200px]">
                        <CommandEmpty className="text-gray-500 dark:text-gray-400">
                          No skills found
                        </CommandEmpty>
                        <CommandGroup>
                          {SKILL_SUGGESTIONS.filter((skill) =>
                            skill
                              .toLowerCase()
                              .includes(skillsInput.toLowerCase())
                          ).map((skill) => (
                            <CommandItem
                              key={skill}
                              onSelect={() => {
                                addSkill(skill);
                                setIsSkillsPopoverOpen(false);
                              }}
                              className="text-sm text-gray-700 aria-selected:bg-gray-100 dark:text-gray-300 dark:aria-selected:bg-gray-700"
                            >
                              {skill}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {skillsInput && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      addSkill(skillsInput);
                      setIsSkillsPopoverOpen(false);
                    }}
                    className="mt-1 h-8 w-full gap-1 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add &quot;{skillsInput}&quot;</span>
                  </Button>
                )}

                {selectedSkills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                      >
                        {skill}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSkill(skill)}
                          className="-mr-1.5 h-auto p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Location
              </h3>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-gray-200 bg-white text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      <span>Select location</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] border-gray-200 bg-white p-0 dark:border-gray-700 dark:bg-gray-800">
                  <Command className="dark:bg-gray-800">
                    <CommandInput
                      placeholder="Search locations..."
                      className="border-gray-200 dark:border-gray-700"
                    />
                    <CommandList className="max-h-[200px]">
                      <CommandEmpty className="text-gray-500 dark:text-gray-400">
                        No locations found
                      </CommandEmpty>
                      <CommandGroup>
                        {LOCATION_SUGGESTIONS.map((location) => (
                          <CommandItem
                            key={location}
                            onSelect={() => addFilter('location', location)}
                            className="text-sm text-gray-700 aria-selected:bg-gray-100 dark:text-gray-300 dark:aria-selected:bg-gray-700"
                          >
                            {location}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Experience Range Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Experience Range
              </h3>

              <div className="space-y-6">
                <div className="px-1">
                  <Slider
                    defaultValue={searchState.experienceRange}
                    min={0}
                    max={15}
                    step={1}
                    onValueChange={(value) =>
                      setSearchState((prev) => ({
                        ...prev,
                        experienceRange: value as [number, number],
                      }))
                    }
                    className="py-4"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>
                    {searchState.experienceRange[0]} year
                    {searchState.experienceRange[0] !== 1 && 's'}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {searchState.experienceRange[0]} -{' '}
                    {searchState.experienceRange[1]} years
                  </span>
                  <span>
                    {searchState.experienceRange[1]} year
                    {searchState.experienceRange[1] !== 1 && 's'}
                  </span>
                </div>
              </div>
            </div>

            {/* Salary Range Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Salary Range
              </h3>

              <div className="space-y-6">
                <div className="px-1">
                  <Slider
                    defaultValue={searchState.salaryRange}
                    min={30000}
                    max={200000}
                    step={5000}
                    onValueChange={(value) =>
                      setSearchState((prev) => ({
                        ...prev,
                        salaryRange: value as [number, number],
                      }))
                    }
                    className="py-4"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>
                    ${(searchState.salaryRange[0] / 1000).toFixed(0)}k
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    ${(searchState.salaryRange[0] / 1000).toFixed(0)}k - $
                    {(searchState.salaryRange[1] / 1000).toFixed(0)}k
                  </span>
                  <span>
                    ${(searchState.salaryRange[1] / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            </div>

            {/* Job Title Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Job Title
              </h3>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-gray-200 bg-white text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      <span>Select job title</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] border-gray-200 bg-white p-0 dark:border-gray-700 dark:bg-gray-800">
                  <Command className="dark:bg-gray-800">
                    <CommandInput
                      placeholder="Search job titles..."
                      className="border-gray-200 dark:border-gray-700"
                    />
                    <CommandList className="max-h-[200px]">
                      <CommandEmpty className="text-gray-500 dark:text-gray-400">
                        No job titles found
                      </CommandEmpty>
                      <CommandGroup>
                        {JOB_TITLE_SUGGESTIONS.map((title) => (
                          <CommandItem
                            key={title}
                            onSelect={() => addFilter('jobTitle', title)}
                            className="text-sm text-gray-700 aria-selected:bg-gray-100 dark:text-gray-300 dark:aria-selected:bg-gray-700"
                          >
                            {title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active Filters */}
          {searchState.filters.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Active Filters
              </h3>

              <div className="flex flex-wrap gap-2">
                {searchState.filters.map((filter) => (
                  <Badge
                    key={filter.id}
                    variant="secondary"
                    className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                  >
                    <span className="font-medium">{filter.label}:</span>
                    <span className="max-w-[120px] truncate">
                      {getFilterValue(filter)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFilter(filter.id)}
                      className="-mr-1.5 h-auto p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="gap-1.5 border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </Button>

            <Button onClick={handleApplySearch} className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Apply Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
