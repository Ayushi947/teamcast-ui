'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ProfileFormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  headerAction?: React.ReactNode;
}

export const ProfileFormSection = ({
  title,
  description,
  icon: Icon,
  className,
  children,
  isCollapsible = false,
  defaultCollapsed = false,
  headerAction,
}: ProfileFormSectionProps) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <div
      className={cn(
        'text-card-foreground overflow-hidden rounded-lg border bg-white transition-all duration-200 dark:bg-white',
        'hover:border-primary/20',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-4 p-6',
          isCollapsible && 'hover:bg-muted/30 cursor-pointer'
        )}
        onClick={isCollapsible ? () => setCollapsed(!collapsed) : undefined}
      >
        {Icon && (
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full transition-colors">
            <Icon className="text-primary h-5 w-5" />
          </div>
        )}

        <div className="flex-1 space-y-1">
          <h3 className="font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>

        {headerAction && (
          <div className="flex items-center">{headerAction}</div>
        )}

        {isCollapsible && (
          <div className="bg-background flex h-7 w-7 items-center justify-center rounded-full border transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed ? 'rotate-0' : 'rotate-180'
              )}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        )}
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all',
          collapsed
            ? 'max-h-0 p-0 opacity-0'
            : 'max-h-[2000px] px-6 pt-0 pb-6 opacity-100'
        )}
      >
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};
