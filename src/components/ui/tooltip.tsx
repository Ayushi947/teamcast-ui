'use client';

import { cn } from '@/lib/utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

// Enhanced tooltip variants
const tooltipVariants = cva(
  [
    // Base styles
    'z-50 overflow-hidden rounded-lg border px-3 py-2 text-sm shadow-lg',
    'select-none will-change-[transform,opacity]',
    // Animation classes
    'animate-in fade-in-0 zoom-in-95 duration-200',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150',
    // Slide animations based on side
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-black text-white border-gray-800',
          'dark:bg-white dark:text-black dark:border-gray-200',
        ],
        secondary: [
          'bg-gray-100 text-gray-900 border-gray-200',
          'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
        ],
        accent: [
          'bg-blue-600 text-white border-blue-500',
          'dark:bg-blue-500 dark:border-blue-400',
        ],
        destructive: [
          'bg-red-600 text-white border-red-500',
          'dark:bg-red-500 dark:border-red-400',
        ],
        success: [
          'bg-green-600 text-white border-green-500',
          'dark:bg-green-500 dark:border-green-400',
        ],
        warning: [
          'bg-yellow-600 text-white border-yellow-500',
          'dark:bg-yellow-500 dark:border-yellow-400',
        ],
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        default: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipVariants> {
  showArrow?: boolean;
  maxWidth?: string;
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      sideOffset = 6,
      variant,
      size,
      showArrow = true,
      maxWidth = 'max-w-xs',
      children,
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          tooltipVariants({ variant, size }),
          maxWidth,
          'break-words',
          className
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow
            className={cn(
              'fill-current',
              variant === 'default' && 'text-black dark:text-white',
              variant === 'secondary' && 'text-gray-100 dark:text-gray-800',
              variant === 'accent' && 'text-blue-600 dark:text-blue-500',
              variant === 'destructive' && 'text-red-600 dark:text-red-500',
              variant === 'success' && 'text-green-600 dark:text-green-500',
              variant === 'warning' && 'text-yellow-600 dark:text-yellow-500'
            )}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Enhanced TooltipProvider with better defaults
interface EnhancedTooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

const EnhancedTooltipProvider: React.FC<EnhancedTooltipProviderProps> = ({
  children,
  delayDuration = 300,
  skipDelayDuration = 100,
  disableHoverableContent = false,
}) => (
  <TooltipProvider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    disableHoverableContent={disableHoverableContent}
  >
    {children}
  </TooltipProvider>
);

// Convenient wrapper component for common use cases
interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: TooltipContentProps['variant'];
  size?: TooltipContentProps['size'];
  side?: 'top' | 'right' | 'bottom' | 'left';
  showArrow?: boolean;
  maxWidth?: string;
  delayDuration?: number;
  className?: string;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  content,
  children,
  variant = 'default',
  size = 'default',
  side = 'top',
  showArrow = true,
  maxWidth = 'max-w-xs',
  delayDuration = 300,
  className,
}) => (
  <Tooltip delayDuration={delayDuration}>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent
      side={side}
      variant={variant}
      size={size}
      showArrow={showArrow}
      maxWidth={maxWidth}
      className={className}
    >
      {content}
    </TooltipContent>
  </Tooltip>
);

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  EnhancedTooltipProvider,
  SimpleTooltip,
  tooltipVariants,
  type TooltipContentProps,
  type SimpleTooltipProps,
};
