import React, { useState, useMemo } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Badge } from './badge';
import { X, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supportLookupService } from '@/lib/services/services';
import { formatEnumValue } from '@/lib/utils';

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  yearsOfExperience: string;
}

interface SkillSelectorProps {
  value: Skill[];
  onChange: (skills: Skill[]) => void;
  error?: string;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Skill>({
    name: '',
    level: 'Beginner',
    yearsOfExperience: '',
  });
  const [skillSearch, setSkillSearch] = useState('');

  // Fetch skills from lookup service
  const { data: lookupCategories, isLoading: isLookupCategoriesLoading } =
    useQuery({
      queryKey: ['lookup-categories-skills'],
      queryFn: async () => {
        const response = await supportLookupService.getLookupValuesByCategories(
          ['skills']
        );
        return response as { lookupValues?: { id: string; label: string }[] }[];
      },
    });

  // Find the skills category from the fetched list
  const skillsCategory = useMemo(() => {
    return lookupCategories?.[0];
  }, [lookupCategories]);

  const filteredSkills =
    skillsCategory?.lookupValues?.filter(
      (skill: { label: string }) =>
        skill.label.toLowerCase().includes(skillSearch.toLowerCase()) &&
        !value.some((s) => s.name === skill.label)
    ) ?? [];

  const handleAddSkill = () => {
    if (
      currentSkill.name.trim() &&
      !value.some((s) => s.name === currentSkill.name)
    ) {
      onChange([...value, { ...currentSkill }]);
      setCurrentSkill({
        name: '',
        level: 'Beginner',
        yearsOfExperience: '',
      });
      setIsOpen(false);
      setSkillSearch('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = value.filter((_, i) => i !== index);
    onChange(newSkills);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {Array.isArray(value) &&
          value.length > 0 &&
          value.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1"
            >
              {skill.name && <span>{formatEnumValue(skill.name)}</span>}
              <button
                type="button"
                onClick={() => handleRemoveSkill(index)}
                className="text-muted-foreground hover:text-foreground ml-1 cursor-pointer rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="h-7 cursor-pointer"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Skill
        </Button>
      </div>
      {error && <p className="text-destructive mt-1 text-sm">{error}</p>}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Enter the skill details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Select
                value={currentSkill.name}
                onValueChange={(val) => {
                  setCurrentSkill({ ...currentSkill, name: val });
                  setSkillSearch('');
                }}
              >
                <SelectTrigger id="skill-name">
                  <SelectValue placeholder="Select or search skill" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder={
                        isLookupCategoriesLoading
                          ? 'Loading...'
                          : 'Search skills...'
                      }
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {filteredSkills.length > 0 ? (
                    filteredSkills.map(
                      (skill: { id: string; label: string }) => (
                        <SelectItem key={skill.id} value={skill.label}>
                          {formatEnumValue(skill.label)}
                        </SelectItem>
                      )
                    )
                  ) : (
                    <div className="text-muted-foreground px-2 py-1 text-sm">
                      No skills found.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skill-level">Experience Level</Label>
              <Select
                value={currentSkill.level}
                onValueChange={(value: Skill['level']) =>
                  setCurrentSkill({ ...currentSkill, level: value })
                }
              >
                <SelectTrigger id="skill-level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="years-of-experience">Years of Experience</Label>
              <Input
                id="years-of-experience"
                type="number"
                min="0"
                max="50"
                value={currentSkill.yearsOfExperience}
                onChange={(e) =>
                  setCurrentSkill({
                    ...currentSkill,
                    yearsOfExperience: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddSkill}
              disabled={!currentSkill.name}
            >
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
