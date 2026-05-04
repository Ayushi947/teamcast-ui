import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from './button';

interface BannerCustomProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  buttonText?: string;
  buttonRoute?: string;
  onButtonClick?: () => void; // Add missing prop for button click handler
}

export interface BannerProps
  extends BannerCustomProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, keyof BannerCustomProps> {}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      variant = 'info',
      title,
      description,
      icon,
      action,
      className,
      onClose,
      buttonText,
      buttonRoute,
      onButtonClick,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    const handleButtonClick = () => {
      if (onButtonClick) {
        onButtonClick();
      } else if (buttonRoute) {
        window.location.href = buttonRoute;
      }
    };

    if (!isVisible) return null;

    const variants = {
      info: {
        containerClass:
          'bg-primary/8 dark:bg-primary/20 border-primary/30 dark:border-primary/30',
        iconClass: 'text-primary dark:text-primary',
        titleClass: 'text-primary dark:text-primary',
        descriptionClass: 'text-primary/90 dark:text-primary/90',
        buttonClass: 'bg-primary hover:bg-primary/90',
        icon: icon || <Info className="h-5 w-5" />,
      },
      warning: {
        containerClass:
          'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-900',
        iconClass: 'text-yellow-600 dark:text-yellow-400',
        titleClass: 'text-yellow-800 dark:text-yellow-200',
        descriptionClass: 'text-yellow-700/90 dark:text-yellow-300/90',
        buttonClass:
          'bg-gradient-to-r from-yellow-500/90 to-yellow-600 text-yellow-950 hover:from-yellow-500 hover:to-yellow-600/90 dark:text-yellow-100',
        icon: icon || <AlertCircle className="h-5 w-5" />,
      },
      error: {
        containerClass:
          'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900',
        iconClass: 'text-red-600 dark:text-red-400',
        titleClass: 'text-red-600 dark:text-red-400',
        descriptionClass: 'text-gray-700/90 dark:text-gray-300/90',
        buttonClass: 'bg-red-600 hover:bg-red-700',
        icon: icon || <XCircle className="h-5 w-5" />,
      },
      success: {
        containerClass:
          'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900',
        iconClass: 'text-green-600 dark:text-green-400',
        titleClass: 'text-green-800 dark:text-green-200',
        descriptionClass: 'text-green-700/90 dark:text-green-300/90',
        buttonClass: 'bg-green-600 hover:bg-green-700',
        icon: icon || <CheckCircle2 className="h-5 w-5" />,
      },
    };

    const currentVariant = variants[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-[80px] items-center gap-4 rounded-lg border p-4',
          currentVariant.containerClass,
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center',
            currentVariant.iconClass
          )}
        >
          {currentVariant.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          {title && (
            <h5
              className={cn('mb-0.5 font-semibold', currentVariant.titleClass)}
            >
              {title}
            </h5>
          )}
          {description && (
            <p
              className={cn(
                'text-sm leading-tight font-medium',
                currentVariant.descriptionClass
              )}
            >
              {description}
            </p>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>

        {/* Button */}
        {buttonText && (buttonRoute || onButtonClick) && (
          <div className="flex items-center">
            <Button
              size="sm"
              className={currentVariant.buttonClass}
              onClick={handleButtonClick}
            >
              {buttonText}
            </Button>
          </div>
        )}

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            '-mt-1 -mr-1 h-8 w-8 shrink-0 cursor-pointer',
            currentVariant.iconClass
          )}
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

Banner.displayName = 'Banner';

export default Banner;
