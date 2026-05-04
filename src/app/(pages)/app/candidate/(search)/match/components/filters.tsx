'use client';

import { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Filter options
export const filterOptions = {
  experience: ['0-2 years', '3-5 years', '6-8 years', '9+ years'],
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'UI/UX',
    'Product Management',
  ],
  education: ["Bachelor's", "Master's", 'PhD', 'Bootcamp'],
  jobType: ['Full-time', 'Part-time', 'Contract', 'Remote'],
  salary: ['$50k-$80k', '$80k-$120k', '$120k-$160k', '$160k+'],
};

export interface FilterState {
  experience: string;
  skills: string[];
  education: string;
  jobType: string;
  salary: string;
}

interface FiltersProps {
  selectedFilters: FilterState;
  setSelectedFilters: (filters: FilterState) => void;
  activeFilters: string[];
}

export const Filters = ({
  selectedFilters,
  setSelectedFilters,
  activeFilters,
}: FiltersProps) => {
  const [filterOpen, setFilterOpen] = useState(false);

  const clearFilters = () => {
    setSelectedFilters({
      experience: '',
      skills: [],
      education: '',
      jobType: '',
      salary: '',
    });
  };

  const removeFilter = (filter: string) => {
    if (selectedFilters.experience === filter) {
      setSelectedFilters({ ...selectedFilters, experience: '' });
    } else if (selectedFilters.education === filter) {
      setSelectedFilters({ ...selectedFilters, education: '' });
    } else if (selectedFilters.jobType === filter) {
      setSelectedFilters({ ...selectedFilters, jobType: '' });
    } else if (selectedFilters.salary === filter) {
      setSelectedFilters({ ...selectedFilters, salary: '' });
    } else if (selectedFilters.skills.includes(filter)) {
      setSelectedFilters({
        ...selectedFilters,
        skills: selectedFilters.skills.filter((s) => s !== filter),
      });
    }
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedFilters({
      ...selectedFilters,
      skills: selectedFilters.skills.includes(skill)
        ? selectedFilters.skills.filter((s) => s !== skill)
        : [...selectedFilters.skills, skill],
    });
  };

  return (
    <>
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`border-border text-muted-foreground hover:bg-muted hover:text-foreground ${
              activeFilters.length > 0 ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary ml-2"
              >
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground font-medium">Filters</h3>
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-[300px] p-4">
            <div className="space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Experience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.experience.map((level) => (
                    <Button
                      key={level}
                      variant={
                        selectedFilters.experience === level
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      className="justify-start"
                      onClick={() =>
                        setSelectedFilters({
                          ...selectedFilters,
                          experience:
                            selectedFilters.experience === level ? '' : level,
                        })
                      }
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={
                        selectedFilters.skills.includes(skill)
                          ? 'default'
                          : 'outline'
                      }
                      className={`cursor-pointer ${
                        selectedFilters.skills.includes(skill)
                          ? 'bg-primary hover:bg-primary/90'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleSkillFilter(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Job Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.jobType.map((type) => (
                    <Button
                      key={type}
                      variant={
                        selectedFilters.jobType === type ? 'default' : 'outline'
                      }
                      size="sm"
                      className="justify-start"
                      onClick={() =>
                        setSelectedFilters({
                          ...selectedFilters,
                          jobType: selectedFilters.jobType === type ? '' : type,
                        })
                      }
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Salary Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.salary.map((range) => (
                    <Button
                      key={range}
                      variant={
                        selectedFilters.salary === range ? 'default' : 'outline'
                      }
                      size="sm"
                      className="justify-start"
                      onClick={() =>
                        setSelectedFilters({
                          ...selectedFilters,
                          salary: selectedFilters.salary === range ? '' : range,
                        })
                      }
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-4">
            <Button className="w-full" onClick={() => setFilterOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="bg-primary/10 text-primary flex items-center gap-1"
            >
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter(filter)}
              />
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};
