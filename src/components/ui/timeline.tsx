import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface TimelineProps {
  children: ReactNode;
  className?: string;
}

interface TimelineItemProps {
  title: string;
  description?: string;
  date?: string;
  icon?: ReactNode;
  className?: string;
  isLast?: boolean;
}

export function Timeline({ children, className }: TimelineProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

export function TimelineItem({
  title,
  description,
  date,
  icon,
  className,
  isLast = false,
}: TimelineItemProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex flex-col items-center">
        <div className="bg-background flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#6e55cf] dark:border-purple-400">
          {icon}
        </div>
        {!isLast && (
          <div className="h-full w-px bg-[#6e55cf]/20 dark:bg-purple-400/20" />
        )}
      </div>
      <div className="flex-1 pt-1 pb-4">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
          {date && (
            <span className="text-muted-foreground text-sm">• {date}</span>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
    </div>
  );
}
