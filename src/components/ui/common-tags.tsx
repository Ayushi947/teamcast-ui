import React, { useState } from 'react';
import { cn, formatEnumValue } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const commonTagsVariants = cva(
  'font-helvetica rounded-full px-2.5 py-1 text-xs font-bold',
  {
    variants: {
      variant: {
        default:
          'bg-primary/10 text-primary border-primary/40 dark:border-gray-50 dark:text-gray-100',
        showMore:
          'cursor-pointer bg-card text-muted-foreground border border-gray-300 dark:bg-gray-800  dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700',
        showLess:
          'cursor-pointer bg-card text-muted-foreground border border-gray-300 dark:bg-gray-800  dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CommonTagsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof commonTagsVariants> {
  values: string | string[];
  maxVisible?: number; // Number of skills to show initially (default: 5)
}

export const CommonTags = ({
  values,
  className,
  variant,
  maxVisible = 5,
  ...props
}: CommonTagsProps) => {
  const [showAll, setShowAll] = useState(false);

  // Handle both string and array inputs
  const skillsArray = Array.isArray(values)
    ? values
    : values
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

  if (!skillsArray || skillsArray.length === 0) return null;

  const visibleSkills = showAll
    ? skillsArray
    : skillsArray.slice(0, maxVisible);
  const hasMoreSkills = skillsArray.length > maxVisible;

  const handleToggleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowAll((prev) => !prev);
  };

  return (
    <div className="mb-3" {...props}>
      <div className="flex flex-wrap gap-2">
        {visibleSkills.map((skill, index) => (
          <div
            key={index}
            className={cn(
              commonTagsVariants({ variant: 'default' }),
              className
            )}
          >
            <span>{formatEnumValue(skill)}</span>
          </div>
        ))}

        {hasMoreSkills && (
          <div
            className={cn(
              commonTagsVariants({
                variant: showAll ? 'showLess' : 'showMore',
              }),
              className
            )}
            onClick={handleToggleClick}
          >
            <span>
              {showAll
                ? 'Show Less'
                : `+${skillsArray.length - maxVisible} More`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
