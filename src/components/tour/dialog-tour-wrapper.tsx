'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useTourContext } from '@/lib/context/tour-context';
import { logger } from '@/lib/logger';

interface DialogTourWrapperProps {
  children: React.ReactNode;
  dialogType: string;
  defaultSection?: string;
  onSectionChange?: (section: string) => void;
  className?: string;
}

/**
 * DialogTourWrapper - A wrapper component for Radix UI dialogs that integrates with the tour system
 *
 * This component automatically manages dialog state and triggers appropriate tours when:
 * - Dialog opens/closes
 * - User navigates between sections
 * - Query parameters change
 *
 * Usage:
 * Wrap your Dialog component with DialogTourWrapper and add data-tour-section attributes
 * to your dialog sections for automatic tour detection.
 */
export const DialogTourWrapper: React.FC<DialogTourWrapperProps> = ({
  children,
  dialogType,
  defaultSection,
  onSectionChange,
  className,
}) => {
  const { setDialogState, triggerTour, getDialogTourKey, isDialogTourActive } =
    useTourContext();
  const dialogRef = useRef<HTMLDivElement>(null);
  const currentSectionRef = useRef<string | undefined>(defaultSection);

  // Detect dialog open/close state
  const detectDialogState = useCallback(() => {
    if (!dialogRef.current) return;

    // Check if dialog is open by looking for Radix UI dialog content
    const dialogContent = dialogRef.current.querySelector(
      '[data-radix-dialog-content]'
    );
    const dialogOverlay = dialogRef.current.querySelector(
      '[data-radix-dialog-overlay]'
    );
    const isOpen = !!(dialogContent && dialogOverlay);

    // Get current section from data attributes or query params
    const activeSectionElement = dialogRef.current.querySelector(
      '[data-tour-section][data-active="true"]'
    );
    const currentSection =
      activeSectionElement?.getAttribute('data-tour-section') || defaultSection;

    // Update dialog state if changed
    if (
      isOpen !== isDialogTourActive ||
      currentSection !== currentSectionRef.current
    ) {
      setDialogState({
        isOpen,
        currentSection,
        dialogType,
        dialogId: `${dialogType}-${currentSection}`,
      });

      currentSectionRef.current = currentSection;

      // Trigger tour if dialog opened or section changed
      if (isOpen && currentSection) {
        const tourKey = getDialogTourKey(currentSection);
        if (tourKey) {
          logger.info('Dialog tour triggered:', {
            dialogType,
            section: currentSection,
            tourKey,
            isOpen,
          });

          // Small delay to ensure dialog is fully rendered
          setTimeout(() => {
            triggerTour(tourKey, { delay: 300 });
          }, 300);
        }
      }

      // Notify parent component of section change
      if (
        onSectionChange &&
        currentSection &&
        currentSection !== currentSectionRef.current
      ) {
        onSectionChange(currentSection);
      }
    }
  }, [
    setDialogState,
    triggerTour,
    getDialogTourKey,
    isDialogTourActive,
    dialogType,
    defaultSection,
    onSectionChange,
  ]);

  // Set up mutation observer to watch for dialog state changes
  useEffect(() => {
    if (!dialogRef.current) return;

    const observer = new MutationObserver(() => {
      // Debounce the detection to avoid excessive calls
      setTimeout(detectDialogState, 100);
    });

    observer.observe(dialogRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'data-state',
        'data-radix-dialog-content',
        'data-radix-dialog-overlay',
        'data-tour-section',
        'data-active',
        'role',
        'data-modal',
      ],
    });

    // Initial detection
    detectDialogState();

    return () => observer.disconnect();
  }, [detectDialogState]);

  // Clean up dialog state when component unmounts
  useEffect(() => {
    return () => {
      setDialogState({
        isOpen: false,
        currentSection: undefined,
        dialogType: undefined,
        dialogId: undefined,
      });
    };
  }, [setDialogState]);

  return (
    <div ref={dialogRef} className={className}>
      {children}
    </div>
  );
};

/**
 * Hook for managing dialog tours programmatically
 */
export const useDialogTour = (dialogType: string, defaultSection?: string) => {
  const { setDialogState, triggerTour, getDialogTourKey, isDialogTourActive } =
    useTourContext();

  const openDialog = useCallback(
    (section?: string) => {
      const targetSection = section || defaultSection;
      setDialogState({
        isOpen: true,
        currentSection: targetSection,
        dialogType,
        dialogId: `${dialogType}-${targetSection}`,
      });

      // Trigger tour after dialog opens
      setTimeout(() => {
        const tourKey = getDialogTourKey(targetSection);
        if (tourKey) {
          triggerTour(tourKey, { delay: 300 });
        }
      }, 300);
    },
    [setDialogState, triggerTour, getDialogTourKey, dialogType, defaultSection]
  );

  const closeDialog = useCallback(() => {
    setDialogState({
      isOpen: false,
      currentSection: undefined,
      dialogType: undefined,
      dialogId: undefined,
    });
  }, [setDialogState]);

  const changeSection = useCallback(
    (section: string) => {
      setDialogState({
        currentSection: section,
        dialogId: `${dialogType}-${section}`,
      });

      // Trigger tour for new section
      setTimeout(() => {
        const tourKey = getDialogTourKey(section);
        if (tourKey) {
          triggerTour(tourKey, { delay: 200 });
        }
      }, 200);
    },
    [setDialogState, triggerTour, getDialogTourKey, dialogType]
  );

  return {
    openDialog,
    closeDialog,
    changeSection,
    isDialogTourActive,
    getDialogTourKey,
  };
};

export default DialogTourWrapper;
