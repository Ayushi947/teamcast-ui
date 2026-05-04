'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'avatar' | 'card' | 'button';
  width?: string | number;
  height?: string | number;
  lines?: number; // For text variant
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  lines = 1,
  style,
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-muted rounded';

  const variantClasses = {
    default: '',
    circular: 'rounded-full',
    text: 'h-4 rounded',
    avatar: 'rounded-full w-10 h-10',
    card: 'w-full h-48 rounded-lg',
    button: 'h-10 w-24 rounded-md',
  };

  const skeletonStyle = {
    width: width,
    height: height,
    ...style,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              index === lines - 1 && 'w-3/4', // Last line is shorter
              className
            )}
            style={skeletonStyle}
            role="status"
            aria-label="Loading content..."
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={skeletonStyle}
      role="status"
      aria-label="Loading content..."
      {...props}
    />
  );
};

// Specific skeleton components for common use cases
export const AvatarSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <Skeleton
      variant="circular"
      className={sizeClasses[size]}
      aria-label="Loading user avatar..."
    />
  );
};

export const TextSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 1, className }) => (
  <Skeleton
    variant="text"
    lines={lines}
    className={className}
    aria-label={`Loading ${lines === 1 ? 'text' : `${lines} lines of text`}...`}
  />
);

export const ButtonSkeleton: React.FC<{
  variant?: 'default' | 'sm' | 'lg';
  className?: string;
}> = ({ variant = 'default', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-16',
    default: 'h-10 w-24',
    lg: 'h-11 w-32',
  };

  return (
    <Skeleton
      className={cn(sizeClasses[variant], 'rounded-md', className)}
      aria-label="Loading button..."
    />
  );
};

export const CardSkeleton: React.FC<{
  showHeader?: boolean;
  showFooter?: boolean;
  contentLines?: number;
  className?: string;
}> = ({
  showHeader = true,
  showFooter = false,
  contentLines = 3,
  className,
}) => (
  <div
    className={cn('bg-card space-y-4 rounded-lg border p-6', className)}
    role="status"
    aria-label="Loading card content..."
  >
    {showHeader && (
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )}

    <div className="space-y-2">
      {Array.from({ length: contentLines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === contentLines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>

    {showFooter && (
      <div className="flex gap-2 pt-2">
        <ButtonSkeleton variant="sm" />
        <ButtonSkeleton variant="sm" />
      </div>
    )}
  </div>
);

export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}> = ({ rows = 5, columns = 4, showHeader = true, className }) => (
  <div
    className={cn('w-full', className)}
    role="status"
    aria-label="Loading table..."
  >
    <div className="rounded-md border">
      {showHeader && (
        <div className="border-b p-4">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-3/4" />
            ))}
          </div>
        </div>
      )}

      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={cn('h-4', colIndex === 0 ? 'w-full' : 'w-2/3')}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ListSkeleton: React.FC<{
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}> = ({ items = 5, showAvatar = false, showActions = false, className }) => (
  <div
    className={cn('space-y-3', className)}
    role="status"
    aria-label="Loading list..."
  >
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-3 rounded-lg border p-3"
      >
        {showAvatar && <AvatarSkeleton />}

        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <ButtonSkeleton variant="sm" />
            <ButtonSkeleton variant="sm" />
          </div>
        )}
      </div>
    ))}
  </div>
);

// Loading states for specific components
export const FormSkeleton: React.FC<{
  fields?: number;
  showSubmit?: boolean;
  className?: string;
}> = ({ fields = 4, showSubmit = true, className }) => (
  <div
    className={cn('space-y-6', className)}
    role="status"
    aria-label="Loading form..."
  >
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
      </div>
    ))}

    {showSubmit && (
      <div className="pt-4">
        <ButtonSkeleton className="w-full" />
      </div>
    )}
  </div>
);

export const NavigationSkeleton: React.FC<{
  items?: number;
  className?: string;
}> = ({ items = 5, className }) => (
  <nav
    className={cn('space-y-2', className)}
    role="status"
    aria-label="Loading navigation..."
  >
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-2">
        <Skeleton className="h-5 w-5" /> {/* Icon */}
        <Skeleton className="h-4 w-24" /> {/* Text */}
      </div>
    ))}
  </nav>
);

export default Skeleton;
