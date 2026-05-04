import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ICandidateProfile, IResume } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { Star, Award, Globe, Languages, Building, Zap } from 'lucide-react';
import { useState } from 'react';

interface PublicProfessionalSummaryProps {
  profile: ICandidateProfile;
  resume?: IResume;
}

export const PublicProfessionalSummary = ({
  resume,
}: PublicProfessionalSummaryProps) => {
  // State to track if skills are expanded
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  const [isIndustriesExpanded, setIsIndustriesExpanded] = useState(false);

  // Toggle skills expansion
  const toggleSkillsExpansion = () => {
    setIsSkillsExpanded((prev) => !prev);
  };

  const toggleIndustriesExpansion = () => {
    setIsIndustriesExpanded((prev) => !prev);
  };

  return (
    <Card className="group from-card via-card to-background/50 relative h-full overflow-hidden bg-gradient-to-br shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Background decoration */}
      <div className="bg-accent/5 group-hover:bg-accent/10 dark:bg-accent/10 dark:group-hover:bg-accent/20 absolute -top-6 -left-6 h-24 w-24 rounded-full blur-xl transition-all duration-500" />

      <div className="relative flex h-full flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="border-border/50 flex items-center gap-2 border-b pb-3 sm:gap-3 sm:pb-4">
          <div className="bg-primary/10 dark:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10">
            <Star className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h3 className="text-foreground text-lg font-bold sm:text-xl">
              Professional Summary
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Skills, expertise, and background
            </p>
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-4 sm:mt-6 sm:space-y-6">
          {/* Summary Text */}
          <div className="space-y-3">
            <p className="text-foreground/90 text-sm leading-relaxed">
              {resume?.summary ||
                'This professional is actively seeking new opportunities and is ready to contribute their expertise to your team.'}
            </p>
          </div>

          {/* Skills Section */}
          {resume?.resumeSkills && resume.resumeSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-accent/10 flex h-5 w-5 items-center justify-center rounded-md sm:h-6 sm:w-6">
                  <Award className="text-accent-foreground h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
                <h4 className="text-foreground text-sm font-semibold sm:text-base">
                  Core Skills & Technologies
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {/* Show first 8 skills on mobile, 12 on larger screens */}
                {resume.resumeSkills.slice(0, 8).map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-400 dark:hover:bg-primary/30 text-xs transition-colors duration-200 sm:text-sm"
                  >
                    {formatEnumValue(skill)}
                  </Badge>
                ))}

                {/* Show remaining skills if expanded */}
                {isSkillsExpanded &&
                  resume.resumeSkills.slice(8).map((skill, index) => (
                    <Badge
                      key={index + 8}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-400 dark:hover:bg-primary/30 text-xs transition-colors duration-200 sm:text-sm"
                    >
                      {formatEnumValue(skill)}
                    </Badge>
                  ))}

                {/* Show "more" badge if there are more than 8 skills */}
                {resume.resumeSkills.length > 8 && (
                  <Badge
                    variant="outline"
                    className="border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary cursor-pointer border-dashed text-xs transition-colors duration-200 sm:text-sm"
                    onClick={toggleSkillsExpansion}
                  >
                    {isSkillsExpanded
                      ? 'Show less'
                      : `+${resume.resumeSkills.length - 8} more`}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Industry & Languages Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {resume?.industries && resume.industries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-secondary/20 flex h-5 w-5 items-center justify-center rounded-md sm:h-6 sm:w-6">
                    <Building className="text-secondary-foreground h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                  <h4 className="text-foreground text-sm font-semibold sm:text-base">
                    Industry Expertise
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(isIndustriesExpanded
                    ? resume.industries
                    : resume.industries.slice(0, 4)
                  ).map((industry, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-secondary/30 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 dark:border-secondary/40 dark:bg-secondary/20 text-xs transition-colors duration-200 sm:text-sm"
                    >
                      {formatEnumValue(industry)}
                    </Badge>
                  ))}
                  {resume.industries.length > 4 && (
                    <Badge
                      variant="outline"
                      className="border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary cursor-pointer border-dashed text-xs transition-colors duration-200 sm:text-sm"
                      onClick={toggleIndustriesExpansion}
                    >
                      {isIndustriesExpanded
                        ? 'Show less'
                        : `+${resume.industries.length - 4} more`}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {resume?.languages && resume.languages.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 sm:h-6 sm:w-6 dark:bg-emerald-900/30">
                    <Languages className="h-3 w-3 text-emerald-600 sm:h-3.5 sm:w-3.5 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-foreground text-sm font-semibold sm:text-base">
                    Languages
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {resume.languages.slice(0, 4).map((language, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700 transition-colors duration-200 hover:bg-emerald-100 sm:text-sm dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                    >
                      <Globe className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {formatEnumValue(language)}
                    </Badge>
                  ))}
                  {resume.languages.length > 4 && (
                    <Badge
                      variant="outline"
                      className="border-muted-foreground/30 text-muted-foreground border-dashed text-xs sm:text-sm"
                    >
                      +{resume.languages.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current Position Highlight */}
          {(resume?.currentJobTitle || resume?.currentCompany) && (
            <div className="from-muted/50 to-muted/20 rounded-xl bg-gradient-to-br p-3 shadow-inner sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg sm:h-8 sm:w-8">
                  <Zap className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-foreground mb-1 text-sm font-semibold sm:mb-2 sm:text-base">
                    Current Position
                  </h4>
                  <div className="space-y-1">
                    {resume.currentJobTitle && (
                      <p className="text-foreground text-xs font-medium sm:text-sm">
                        {resume.currentJobTitle}
                      </p>
                    )}
                    {resume.currentCompany && (
                      <p className="text-primary text-xs font-medium sm:text-sm">
                        at {resume.currentCompany}
                      </p>
                    )}
                    {resume.currentIndustry && (
                      <p className="text-muted-foreground text-xs">
                        {formatEnumValue(resume.currentIndustry)} Industry
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
