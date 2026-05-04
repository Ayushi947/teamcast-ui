'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { logger } from '@/lib/logger';

// Dialog state interface
interface DialogState {
  isOpen: boolean;
  currentSection?: string;
  dialogType?: string;
  dialogId?: string;
}

// Tour context interface
interface TourContextValue {
  dialogState: DialogState;
  setDialogState: (state: Partial<DialogState>) => void;
  triggerTour: (
    tourKey: string,
    options?: { force?: boolean; delay?: number }
  ) => void;
  isDialogTourActive: boolean;
  getDialogTourKey: (section?: string) => string | null;
}

// Create context
const TourContext = createContext<TourContextValue | null>(null);

// Tour provider component
export const TourProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dialogStateInternal, setDialogStateInternal] = useState<DialogState>({
    isOpen: false,
    currentSection: undefined,
    dialogType: undefined,
    dialogId: undefined,
  });

  const setDialogState = useCallback((state: Partial<DialogState>) => {
    setDialogStateInternal((prev) => ({ ...prev, ...state }));
  }, []);

  // Check if current tour is dialog-based
  const isDialogTourActive = useMemo(() => {
    return dialogStateInternal.isOpen && !!dialogStateInternal.currentSection;
  }, [dialogStateInternal]);

  // Manual tour triggering
  const triggerTour = useCallback(
    (tourKey: string, options: { force?: boolean; delay?: number } = {}) => {
      const { force = false, delay = 0 } = options;

      logger.info('Manual tour trigger requested:', {
        tourKey,
        force,
        delay,
        currentDialogState: dialogStateInternal,
      });

      // Dispatch custom event for tour triggering
      const event = new CustomEvent('tour-trigger', {
        detail: {
          tourKey,
          force,
          delay,
          dialogState: dialogStateInternal,
        },
      });

      window.dispatchEvent(event);
    },
    [dialogStateInternal]
  );

  // Get dialog tour key based on current section
  const getDialogTourKey = useCallback(
    (section?: string): string | null => {
      const currentSection = section || dialogStateInternal.currentSection;

      if (!currentSection) {
        return null;
      }

      // Map sections to tour keys for job creation form
      const sectionToTourKeyMap: { [key: string]: string } = {
        basic: 'client_job_basic_info_tour',
        details: 'client_job_details_tour',
        compensation: 'client_job_compensation_tour',
        requirements: 'client_job_requirements_tour',
        preferences: 'client_job_preferences_tour',
        settings: 'client_job_settings_tour',
        'method-selection': 'client_job_method_selection_tour',
        'pdf-upload': 'client_job_pdf_upload_tour',
        'text-paste': 'client_job_text_paste_tour',
        'ai-generator': 'client_job_ai_generator_tour',
      };

      return sectionToTourKeyMap[currentSection] || null;
    },
    [dialogStateInternal.currentSection]
  );

  // Auto-detect dialog state changes
  useEffect(() => {
    const detectDialogState = () => {
      // Check for Radix UI dialog
      const radixDialog = document.querySelector('[data-radix-dialog-content]');

      // Check for other common dialog patterns
      const modalDialog = document.querySelector('[role="dialog"]');
      const customDialog = document.querySelector('[data-modal="true"]');

      const hasDialog = !!(radixDialog || modalDialog || customDialog);

      // Get current section from query params
      const urlParams = new URLSearchParams(window.location.search);
      const querySection = urlParams.get('section');

      // Also check for active section within dialog using data-tour-section
      let activeSection = querySection;
      if (hasDialog && !querySection) {
        const activeSectionElement = document.querySelector(
          '[data-tour-section][data-active="true"]'
        );
        if (activeSectionElement) {
          activeSection =
            activeSectionElement.getAttribute('data-tour-section');
        } else {
          // Fallback: find the first visible section
          const visibleSection = document.querySelector('[data-tour-section]');
          if (visibleSection) {
            activeSection = visibleSection.getAttribute('data-tour-section');
          }
        }
      }

      // Update dialog state if changed
      if (
        hasDialog !== dialogStateInternal.isOpen ||
        activeSection !== dialogStateInternal.currentSection
      ) {
        setDialogStateInternal((prev) => ({
          ...prev,
          isOpen: hasDialog,
          currentSection: activeSection || prev.currentSection,
          dialogType: radixDialog ? 'radix' : modalDialog ? 'modal' : 'custom',
        }));
      }
    };

    // Initial detection
    detectDialogState();

    // Watch for dialog state changes
    const observer = new MutationObserver(() => {
      // Debounce the detection to avoid excessive calls
      setTimeout(detectDialogState, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'data-state',
        'data-radix-dialog-content',
        'data-tour-section',
        'data-active',
        'role',
        'data-modal',
      ],
    });

    return () => observer.disconnect();
  }, [dialogStateInternal.isOpen, dialogStateInternal.currentSection]);

  const contextValue: TourContextValue = {
    dialogState: dialogStateInternal,
    setDialogState,
    triggerTour,
    isDialogTourActive,
    getDialogTourKey,
  };

  return (
    <TourContext.Provider value={contextValue}>{children}</TourContext.Provider>
  );
};

// Hook to use tour context
export const useTourContext = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return context;
};

// Hook for dialog-specific tour management
export const useDialogTour = (dialogType: string, defaultSection?: string) => {
  const { setDialogState, isDialogTourActive } = useTourContext();

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
        // Note: You'll need to pass the specific tour key for the dialog section
        // This is now handled by the individual tour components
        logger.info(
          'Dialog opened, tour triggering should be handled by tour components'
        );
      }, 300);
    },
    [setDialogState, dialogType, defaultSection]
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
        // Note: You'll need to pass the specific tour key for the dialog section
        // This is now handled by the individual tour components
        logger.info(
          'Dialog section changed, tour triggering should be handled by tour components'
        );
      }, 200);
    },
    [setDialogState, dialogType]
  );

  return {
    openDialog,
    closeDialog,
    changeSection,
    isDialogTourActive,
  };
};

export default TourContext;
