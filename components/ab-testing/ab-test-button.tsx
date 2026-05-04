'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useABTest, trackABTestClick } from '../../lib/ab-testing';
import { cn } from '@/lib/utils';

interface ABTestButtonProps {
  testId: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  fallbackText?: string;
}

export const ABTestButton: React.FC<ABTestButtonProps> = ({
  testId,
  href,
  onClick,
  className,
  children,
  fallbackText = 'Get Started',
}) => {
  const { variant, trackConversion } = useABTest(testId);

  const handleClick = () => {
    if (variant) {
      trackABTestClick(testId, variant.id, 'button');
      trackConversion();
    }
    onClick?.();
  };

  if (!variant) {
    return (
      <Button className={className} onClick={handleClick} asChild={!!href}>
        {href ? <a href={href}>{fallbackText}</a> : fallbackText}
      </Button>
    );
  }

  const { text, variant: buttonVariant, size, color } = variant.props || {};

  const buttonClasses = cn(
    color === 'gradient' &&
      'bg-gradient-to-r from-[#6e55cf] to-[#8b6edb] hover:from-[#5a4ba8] hover:to-[#7a5dc9]',
    className
  );

  return (
    <Button
      variant={buttonVariant || 'default'}
      size={size || 'default'}
      className={buttonClasses}
      onClick={handleClick}
      asChild={!!href}
    >
      {href ? (
        <a href={href}>{text || children || fallbackText}</a>
      ) : (
        text || children || fallbackText
      )}
    </Button>
  );
};

// Specific A/B test components for different sections
export const HeroCTAButton: React.FC<{
  href?: string;
  onClick?: () => void;
  className?: string;
}> = ({ href = '/pricing', onClick, className }) => (
  <ABTestButton
    testId="hero_cta"
    href={href}
    onClick={onClick}
    className={cn('bg-[#6e55cf] hover:bg-[#5a4ba8]', className)}
    fallbackText="Start Free Trial"
  />
);

export const PricingCTAButton: React.FC<{
  _planName: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}> = ({ _planName, href, onClick, className }) => {
  const handleClick = () => {
    // Track pricing plan selection
    onClick?.();
  };

  return (
    <ABTestButton
      testId="pricing_cta"
      href={href}
      onClick={handleClick}
      className={className}
      fallbackText="Choose Plan"
    />
  );
};

export const ContactCTAButton: React.FC<{
  href?: string;
  onClick?: () => void;
  className?: string;
}> = ({ href = '/contact', onClick, className }) => (
  <ABTestButton
    testId="contact_cta"
    href={href}
    onClick={onClick}
    className={className}
    fallbackText="Contact Sales"
  />
);

// A/B Test component for different button layouts
interface ABTestButtonLayoutProps {
  testId: string;
  primaryButton: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryButton?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export const ABTestButtonLayout: React.FC<ABTestButtonLayoutProps> = ({
  testId,
  primaryButton,
  secondaryButton,
  className,
}) => {
  const { variant } = useABTest(testId);

  const layout = variant?.props?.layout || 'horizontal';
  const showSecondary = variant?.props?.showSecondary !== false;

  return (
    <div
      className={cn(
        'flex gap-4',
        layout === 'vertical'
          ? 'flex-col items-center'
          : 'flex-col justify-center sm:flex-row',
        className
      )}
    >
      <ABTestButton
        testId={testId}
        href={primaryButton.href}
        onClick={primaryButton.onClick}
        className="w-full sm:w-auto"
      >
        {primaryButton.text}
      </ABTestButton>

      {showSecondary && secondaryButton && (
        <Button
          variant="outline"
          size="lg"
          className="w-full border-[#6e55cf] text-[#6e55cf] hover:bg-[#6e55cf] hover:text-white sm:w-auto"
          onClick={secondaryButton.onClick}
          asChild={!!secondaryButton.href}
        >
          {secondaryButton.href ? (
            <a href={secondaryButton.href}>{secondaryButton.text}</a>
          ) : (
            secondaryButton.text
          )}
        </Button>
      )}
    </div>
  );
};
