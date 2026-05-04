'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

import { Progress } from '@/components/ui/progress';
import {
  X,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TourStepTypeEnum } from '@/lib/shared';
import { useTourHook } from '@/lib/hooks/use-tour-hook';
import { logger } from '@/lib/logger';
import { useTourContext } from '@/lib/context/tour-context';
import { ENV } from '@/lib/env';
import { TourStartButton } from './tour-start-button';
import { TourResumeButton } from './tour-resume-button';

/**
 * TourGuide Component with Killswitch Support
 *
 * This component can be disabled globally using the NEXT_PUBLIC_TOUR_GUIDE_ENABLED environment variable.
 *
 * Usage:
 * - Set NEXT_PUBLIC_TOUR_GUIDE_ENABLED=false in your .env file to disable all tour guides
 * - Set NEXT_PUBLIC_TOUR_GUIDE_ENABLED=true (default) to enable tour guides
 *
 * Example .env configuration:
 * NEXT_PUBLIC_TOUR_GUIDE_ENABLED=false
 *
 * When disabled, the component returns null and no tour functionality is rendered.
 */
export interface TourGuideProps {
  tourKey: string;
  autoStart?: boolean;
  triggerStartTour?: boolean;
  showProgress?: boolean;
  className?: string;
  scrollBehavior?: 'auto' | 'smooth' | 'none';
  placementStrategy?: 'smart' | 'fixed';
  highlightPadding?: number;
  repositionThrottle?: number;
  maxRepositionAttempts?: number;
  hideOnSmallScreens?: boolean;
  hideOnZoom?: boolean;
  minScreenWidth?: number;
  maxZoomLevel?: number;
  debugMode?: boolean;
  portalContainer?: HTMLElement | null;
  showStepProgress?: boolean;
}

interface Position {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

interface TargetInfo {
  element: HTMLElement;
  rect: DOMRect;
  isVisible: boolean;
  isInViewport: boolean;
}

// Utility function to check if tour should be hidden based on screen conditions
export const shouldHideTour = (
  hideOnSmallScreens: boolean,
  hideOnZoom: boolean,
  minScreenWidth: number,
  maxZoomLevel: number
): boolean => {
  // Check if running on macOS - bypass restrictions for macOS
  const isMacOS = navigator.platform.includes('Mac');
  if (isMacOS) {
    return false;
  }

  // Check screen width
  if (hideOnSmallScreens && window.innerWidth <= minScreenWidth) {
    return true;
  }

  // Check zoom level
  if (hideOnZoom) {
    const zoomLevel = window.devicePixelRatio;
    if (zoomLevel > maxZoomLevel) {
      return true;
    }
  }

  return false;
};

export function TourGuide({
  tourKey,
  autoStart = true,
  triggerStartTour = false,
  showProgress = true,
  className,
  scrollBehavior = 'smooth',
  placementStrategy = 'smart',
  highlightPadding = 8,
  maxRepositionAttempts = 3,
  hideOnSmallScreens = true,
  hideOnZoom = true,
  minScreenWidth = 1140,
  maxZoomLevel = 1.25,
  debugMode = false,
  portalContainer = null,
  showStepProgress = true,
}: TourGuideProps) {
  // All hooks must be called at the top level before any conditional logic

  // Tour context for dialog detection
  const { dialogState, isDialogTourActive } = useTourContext();

  // Determine if we're in a dialog context
  const isInDialog = isDialogTourActive || dialogState.isOpen;

  const {
    tourDefinition,
    currentStep,
    isActive,
    isLoading,
    shouldShowTour,
    shouldShowResumePrompt,
    isTourCompleted,
    isTourDismissed,
    isPaused,
    progress,
    startTour,
    completeTour,
    nextStep,
    previousStep,
    skipStep,
    skipTour,
    dismissTour,
    pauseTour,
    resumeTour,
    error,
  } = useTourHook(tourKey, {
    autoStart,
  });

  // Refs and state
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tourContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const scrollObserverRef = useRef<ResizeObserver | null>(null);
  const repositionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<Position>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [_targetInfo, setTargetInfo] = useState<TargetInfo | null>(null);
  const [repositionAttempts, setRepositionAttempts] = useState(0);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);

  // All hooks must be called at the top level before any conditional logic

  // Check screen conditions and update hide state
  const checkScreenConditions = useCallback(() => {
    const currentWidth = window.innerWidth;
    const currentZoom = window.devicePixelRatio;
    const isMacOS = navigator.platform.includes('Mac');

    // Bypass restrictions for macOS
    if (isMacOS) {
      setShouldHide(false);
      return;
    }

    const hideDueToWidth = hideOnSmallScreens && currentWidth <= minScreenWidth;
    const hideDueToZoom = hideOnZoom && currentZoom > maxZoomLevel;
    const shouldHide = hideDueToWidth || hideDueToZoom;

    if (debugMode) {
      logger.info('[Tour Guide] Screen conditions check:', {
        currentWidth,
        minScreenWidth,
        hideDueToWidth,
        currentZoom,
        maxZoomLevel,
        hideDueToZoom,
        shouldHide,
        hideOnSmallScreens,
        hideOnZoom,
        isMacOS,
      });
    }

    setShouldHide(shouldHide);
  }, [hideOnSmallScreens, hideOnZoom, minScreenWidth, maxZoomLevel, debugMode]);

  // Optimized throttled reposition function using requestAnimationFrame with better timing
  const throttledReposition = useCallback((callback: () => void) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        callback();
        animationFrameRef.current = null;
      });
    });
  }, []);

  // Enhanced target element finder with retry logic and sidebar state awareness
  const findTargetElement = useCallback(
    async (
      selector: string,
      maxAttempts = maxRepositionAttempts
    ): Promise<HTMLElement | null> => {
      let attempts = 0;
      let element: HTMLElement | null = null;

      while (attempts < maxAttempts && !element) {
        // First try to find the element directly
        element = document.querySelector(selector) as HTMLElement;

        // If not found and it's a sidebar element, try alternative selectors
        if (!element && selector.includes('sidebar')) {
          // Try to find by data-tour attribute
          element = document.querySelector(
            `[data-tour="${selector}"]`
          ) as HTMLElement;

          // If still not found, try to find by partial match
          if (!element) {
            const tourElements = document.querySelectorAll(
              '[data-tour*="sidebar"]'
            );
            for (const tourEl of tourElements) {
              if (
                tourEl
                  .getAttribute('data-tour')
                  ?.includes(selector.replace('sidebar-', ''))
              ) {
                element = tourEl as HTMLElement;
                break;
              }
            }
          }
        }

        if (!element) {
          // Wait a bit before retrying
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
            continue;
          }
        }
      }

      return element;
    },
    [maxRepositionAttempts]
  );

  // Check if element is visible and in viewport
  const getTargetInfo = useCallback(
    (element: HTMLElement): TargetInfo => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      const isVisible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0;

      // Check if element is in viewport - account for dialog context
      let isInViewport = false;

      if (isInDialog) {
        // Find the dialog container
        const dialogContainer =
          document.querySelector('[role="dialog"]') ||
          document.querySelector('[data-radix-dialog-content]') ||
          document.querySelector('.dialog-overlay');

        if (dialogContainer) {
          const containerRect = dialogContainer.getBoundingClientRect();
          isInViewport =
            rect.top >= containerRect.top &&
            rect.left >= containerRect.left &&
            rect.bottom <= containerRect.bottom &&
            rect.right <= containerRect.right;
        } else {
          // Fallback to window viewport if no dialog container found
          isInViewport =
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth;
        }
      } else {
        // Normal viewport check
        isInViewport =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth;
      }

      return { element, rect, isVisible, isInViewport };
    },
    [isInDialog]
  );

  // Smart positioning with collision detection
  const calculateSmartPosition = useCallback(
    (
      targetElement: HTMLElement,
      tooltipElement: HTMLElement,
      preferredPlacement?: string
    ): Position => {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();

      // Get dialog container bounds if in dialog context
      let containerRect: DOMRect | null = null;
      let viewportWidth = window.innerWidth;
      let viewportHeight = window.innerHeight;

      if (isInDialog) {
        // Find the dialog container
        const dialogContainer =
          document.querySelector('[role="dialog"]') ||
          document.querySelector('[data-radix-dialog-content]') ||
          document.querySelector('.dialog-overlay');

        if (dialogContainer) {
          containerRect = dialogContainer.getBoundingClientRect();
          viewportWidth = containerRect.width;
          viewportHeight = containerRect.height;
        }
      }

      const padding = highlightPadding;

      // Determine preferred placement
      let placement = preferredPlacement || currentStep?.placement || 'bottom';
      if (placementStrategy === 'smart') {
        // Smart placement based on available space within dialog or viewport
        const spaceAbove = containerRect
          ? targetRect.top - containerRect.top
          : targetRect.top;
        const spaceBelow = containerRect
          ? containerRect.bottom - targetRect.bottom
          : viewportHeight - targetRect.bottom;
        const spaceLeft = containerRect
          ? targetRect.left - containerRect.left
          : targetRect.left;
        const spaceRight = containerRect
          ? containerRect.right - targetRect.right
          : viewportWidth - targetRect.right;

        if (placement === 'top' && spaceAbove < tooltipRect.height + padding) {
          placement = spaceBelow > spaceAbove ? 'bottom' : 'right';
        } else if (
          placement === 'bottom' &&
          spaceBelow < tooltipRect.height + padding
        ) {
          placement = spaceAbove > spaceBelow ? 'top' : 'right';
        } else if (
          placement === 'left' &&
          spaceLeft < tooltipRect.width + padding
        ) {
          placement = spaceRight > spaceLeft ? 'right' : 'bottom';
        } else if (
          placement === 'right' &&
          spaceRight < tooltipRect.width + padding
        ) {
          placement = spaceLeft > spaceRight ? 'left' : 'bottom';
        }
      }

      let top = 0;
      let left = 0;

      // Calculate position based on placement
      switch (placement) {
        case 'top':
          top = targetRect.top - tooltipRect.height - padding;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - padding;
          break;
        case 'right':
        default:
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + padding;
          break;
      }

      // Adjust positioning for dialog context
      if (containerRect) {
        // Convert to dialog-relative coordinates
        top = top - containerRect.top;
        left = left - containerRect.left;

        // Ensure tooltip stays within dialog bounds
        if (left < padding) left = padding;
        if (left + tooltipRect.width > viewportWidth - padding) {
          left = viewportWidth - tooltipRect.width - padding;
        }
        if (top < padding) top = padding;
        if (top + tooltipRect.height > viewportHeight - padding) {
          top = viewportHeight - tooltipRect.height - padding;
        }
      } else {
        // Ensure tooltip stays within viewport bounds
        if (left < padding) left = padding;
        if (left + tooltipRect.width > viewportWidth - padding) {
          left = viewportWidth - tooltipRect.width - padding;
        }
        if (top < padding) top = padding;
        if (top + tooltipRect.height > viewportHeight - padding) {
          top = viewportHeight - tooltipRect.height - padding;
        }
      }

      return {
        top,
        left,
        placement: placement as 'top' | 'bottom' | 'left' | 'right',
      };
    },
    [currentStep, placementStrategy, highlightPadding, isInDialog]
  );

  // Smooth scroll into view with user preference
  const scrollIntoView = useCallback(
    (element: HTMLElement) => {
      if (scrollBehavior === 'none') return;

      const elementRect = element.getBoundingClientRect();

      // Check if element is out of viewport - account for dialog context
      let isOutOfView = false;

      if (isInDialog) {
        // Find the dialog container
        const dialogContainer =
          document.querySelector('[role="dialog"]') ||
          document.querySelector('[data-radix-dialog-content]') ||
          document.querySelector('.dialog-overlay');

        if (dialogContainer) {
          const containerRect = dialogContainer.getBoundingClientRect();
          isOutOfView =
            elementRect.top < containerRect.top ||
            elementRect.bottom > containerRect.bottom ||
            elementRect.left < containerRect.left ||
            elementRect.right > containerRect.right;
        } else {
          // Fallback to window viewport if no dialog container found
          isOutOfView =
            elementRect.top < 0 ||
            elementRect.bottom > window.innerHeight ||
            elementRect.left < 0 ||
            elementRect.right > window.innerWidth;
        }
      } else {
        // Normal viewport check
        isOutOfView =
          elementRect.top < 0 ||
          elementRect.bottom > window.innerHeight ||
          elementRect.left < 0 ||
          elementRect.right > window.innerWidth;
      }

      if (isOutOfView) {
        element.scrollIntoView({
          behavior: scrollBehavior,
          block: 'center',
          inline: 'nearest',
        });
      }
    },
    [scrollBehavior, isInDialog]
  );

  // Clean up highlights safely
  const cleanupHighlights = useCallback(() => {
    document.querySelectorAll('.tour-highlight').forEach((el) => {
      el.classList.remove('tour-highlight');
    });
    setHighlightedElement(null);
    setTargetInfo(null);
  }, []);

  // Enhanced target highlighting with safety checks
  const highlightTargetElement = useCallback(async () => {
    if (
      !currentStep?.targetSelector ||
      currentStep.stepType === TourStepTypeEnum.MODAL
    ) {
      setHighlightedElement(null);
      setTargetInfo(null);
      return;
    }

    try {
      // Clean up previous highlights
      cleanupHighlights();

      // Find target element with retry logic
      const targetElement = await findTargetElement(currentStep.targetSelector);

      if (!targetElement) {
        logger.warn(
          `Target element not found after ${maxRepositionAttempts} attempts: ${currentStep.targetSelector}`
        );
        setHighlightedElement(null);
        setTargetInfo(null);
        skipStep();
        return;
      }

      // Get target information
      const info = getTargetInfo(targetElement);
      setTargetInfo(info);
      setHighlightedElement(targetElement);

      // Add highlight class
      targetElement.classList.add('tour-highlight');

      // Scroll into view if needed
      if (scrollBehavior !== 'none') {
        scrollIntoView(targetElement);
      }

      // Position tooltip for TOOLTIP, HIGHLIGHT, and SIDEBAR_TOOLTIP steps
      if (
        (currentStep.stepType === TourStepTypeEnum.TOOLTIP ||
          currentStep.stepType === TourStepTypeEnum.HIGHLIGHT ||
          currentStep.stepType === TourStepTypeEnum.SIDEBAR_TOOLTIP) &&
        tooltipRef.current
      ) {
        // Optimized positioning with reduced delay for smoother transitions
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (tooltipRef.current && targetElement) {
              const position = calculateSmartPosition(
                targetElement,
                tooltipRef.current
              );
              setTooltipPosition(position);
            }
          });
        });
      }

      setRepositionAttempts(0);
    } catch (error) {
      logger.error('Error highlighting target element:', error);
      setHighlightedElement(null);
      setTargetInfo(null);
    }
  }, [
    currentStep,
    findTargetElement,
    getTargetInfo,
    scrollBehavior,
    scrollIntoView,
    calculateSmartPosition,
    maxRepositionAttempts,
    cleanupHighlights,
    skipStep,
  ]);

  // Enhanced repositioning with throttling
  const handleReposition = useCallback(() => {
    if (!highlightedElement || !tooltipRef.current || isRepositioning) return;

    setIsRepositioning(true);

    throttledReposition(() => {
      try {
        // Verify element still exists and is visible
        if (!document.contains(highlightedElement)) {
          cleanupHighlights();
          return;
        }

        const info = getTargetInfo(highlightedElement);
        if (!info.isVisible) {
          // Element is hidden, try to find it again or skip
          if (repositionAttempts < maxRepositionAttempts) {
            setRepositionAttempts((prev) => prev + 1);
            highlightTargetElement();
          } else {
            logger.warn(
              'Target element hidden after max attempts, skipping step'
            );
            nextStep();
          }
          return;
        }

        // Update target info
        setTargetInfo(info);

        // Reposition tooltip if needed
        if (
          currentStep?.stepType === TourStepTypeEnum.TOOLTIP ||
          currentStep?.stepType === TourStepTypeEnum.HIGHLIGHT ||
          currentStep?.stepType === TourStepTypeEnum.SIDEBAR_TOOLTIP
        ) {
          if (tooltipRef.current) {
            const position = calculateSmartPosition(
              highlightedElement,
              tooltipRef.current
            );
            setTooltipPosition(position);
          }
        }

        // Scroll into view if needed
        if (scrollBehavior !== 'none' && !info.isInViewport) {
          scrollIntoView(highlightedElement);
        }
      } catch (error) {
        logger.error('Error during repositioning:', error);
      } finally {
        setIsRepositioning(false);
      }
    });
  }, [
    highlightedElement,
    tooltipRef,
    isRepositioning,
    throttledReposition,
    cleanupHighlights,
    getTargetInfo,
    repositionAttempts,
    maxRepositionAttempts,
    highlightTargetElement,
    nextStep,
    currentStep,
    calculateSmartPosition,
    scrollBehavior,
    scrollIntoView,
  ]);

  // Optimized window resize handling with requestAnimationFrame
  const handleResize = useCallback(() => {
    if (repositionTimeoutRef.current) {
      clearTimeout(repositionTimeoutRef.current);
    }

    repositionTimeoutRef.current = setTimeout(() => {
      throttledReposition(() => {
        handleReposition();
      });
    }, 16); // ~60fps timing
  }, [handleReposition, throttledReposition]);

  // Optimized scroll handling with requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (repositionTimeoutRef.current) {
      clearTimeout(repositionTimeoutRef.current);
    }

    repositionTimeoutRef.current = setTimeout(() => {
      throttledReposition(() => {
        handleReposition();
      });
    }, 8); // Faster response for scroll
  }, [handleReposition, throttledReposition]);

  // Enhanced click outside handling
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!isActive || isPaused || !tourContainerRef.current) return;

      const target = event.target as HTMLElement;

      // Only pause if clicking outside tour guide container
      if (tourContainerRef.current.contains(target)) {
        return;
      }

      // Pause tour when clicking anywhere else (including highlighted elements and data-tour containers)
      pauseTour();
    },
    [isActive, isPaused, pauseTour]
  );

  // Enhanced dialog detection
  const detectDialogState = useCallback(() => {
    const dialogSelectors = [
      '[role="dialog"][data-state="open"]',
      '[data-radix-dialog-overlay][data-state="open"]',
      '.dialog-overlay:not([style*="display: none"])',
      '[data-modal="true"]',
      '.modal-open',
    ];

    const dialogElements = document.querySelectorAll(dialogSelectors.join(','));
    const hasOpenDialog = dialogElements.length > 0;

    if (hasOpenDialog !== isDialogOpen) {
      setIsDialogOpen(hasOpenDialog);
      if (hasOpenDialog && isActive && !isPaused) {
        pauseTour();
      }
    }
  }, [isDialogOpen, isActive, isPaused, pauseTour]);

  // Handle element click for action-required steps
  const handleElementClick = useCallback(
    (event: Event) => {
      if (!currentStep?.actionRequired || !currentStep.isRequired) return;

      const target = event.target as HTMLElement;
      if (!target.matches(currentStep.targetSelector || '')) return;

      // Auto-advance for required click actions (not inputs) with optimized timing
      if (currentStep.actionRequired.type === 'click') {
        requestAnimationFrame(() => {
          setTimeout(() => {
            nextStep();
          }, 300); // Reduced delay for smoother flow
        });
      }
    },
    [currentStep, nextStep]
  );

  // Effect: Handle triggerStartTour prop
  useEffect(() => {
    if (triggerStartTour && !isActive && !isTourCompleted && !isTourDismissed) {
      startTour();
    }
  }, [triggerStartTour, isActive, isTourCompleted, isTourDismissed, startTour]);

  // Effect: Handle step changes
  useEffect(() => {
    cleanupHighlights();

    if (isActive && currentStep) {
      // Optimized DOM readiness check with requestAnimationFrame
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          highlightTargetElement();
        });
      }, 16); // Reduced delay for smoother transitions

      return () => {
        clearTimeout(timeoutId);
        cleanupHighlights();
      };
    }
  }, [isActive, currentStep, highlightTargetElement, cleanupHighlights]);

  // Effect: Cleanup when tour ends
  useEffect(() => {
    if (isTourCompleted || isTourDismissed || !shouldShowTour) {
      cleanupHighlights();
    }
  }, [isTourCompleted, isTourDismissed, shouldShowTour, cleanupHighlights]);

  // Effect: Add click listeners for action-required steps
  useEffect(() => {
    if (currentStep?.actionRequired && highlightedElement) {
      highlightedElement.addEventListener('click', handleElementClick);
      return () => {
        if (highlightedElement) {
          highlightedElement.removeEventListener('click', handleElementClick);
        }
      };
    }
  }, [currentStep, highlightedElement, handleElementClick]);

  // Effect: Click outside listener
  useEffect(() => {
    if (isActive && !isPaused) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [isActive, isPaused, handleClickOutside]);

  // Effect: Window resize and scroll listeners with passive option
  useEffect(() => {
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleResize, handleScroll]);

  // Effect: Enhanced DOM observation
  useEffect(() => {
    if (isActive) {
      // Clean up existing observers
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (scrollObserverRef.current) {
        scrollObserverRef.current.disconnect();
      }

      // Mutation observer for DOM changes
      observerRef.current = new MutationObserver(() => {
        throttledReposition(() => {
          detectDialogState();
          if (highlightedElement && document.contains(highlightedElement)) {
            handleReposition();
          }
        });
      });

      // Resize observer for target element changes
      if (highlightedElement) {
        resizeObserverRef.current = new ResizeObserver(() => {
          throttledReposition(() => {
            if (highlightedElement && document.contains(highlightedElement)) {
              handleReposition();
            }
          });
        });
        resizeObserverRef.current.observe(highlightedElement);
      }

      // Scroll observer for container changes
      scrollObserverRef.current = new ResizeObserver(() => {
        throttledReposition(() => {
          if (highlightedElement && document.contains(highlightedElement)) {
            handleReposition();
          }
        });
      });

      // Observe document body and highlighted element
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state', 'role', 'class', 'style', 'hidden'],
      });

      if (highlightedElement) {
        scrollObserverRef.current.observe(highlightedElement);
      }

      // Initial check
      detectDialogState();

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
        if (scrollObserverRef.current) {
          scrollObserverRef.current.disconnect();
        }
      };
    }
  }, [
    isActive,
    highlightedElement,
    detectDialogState,
    handleReposition,
    throttledReposition,
  ]);

  // Effect: Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupHighlights();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (scrollObserverRef.current) {
        scrollObserverRef.current.disconnect();
      }
      if (repositionTimeoutRef.current) {
        clearTimeout(repositionTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cleanupHighlights]);

  // Effect: Check screen conditions and update hide state
  useEffect(() => {
    checkScreenConditions();

    const handleResizeAndZoom = () => {
      checkScreenConditions();
    };

    window.addEventListener('resize', handleResizeAndZoom);

    // Enhanced zoom detection using multiple methods
    let lastZoomLevel = window.devicePixelRatio;

    const checkZoomChanges = () => {
      const currentZoomLevel = window.devicePixelRatio;
      if (Math.abs(currentZoomLevel - lastZoomLevel) > 0.01) {
        lastZoomLevel = currentZoomLevel;
        checkScreenConditions();
      }
    };

    // Check for zoom changes more frequently
    const checkZoomInterval = setInterval(checkZoomChanges, 500);

    // Also check on orientation change and visual viewport changes
    window.addEventListener('orientationchange', checkScreenConditions);
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', checkScreenConditions);
    }

    return () => {
      window.removeEventListener('resize', handleResizeAndZoom);
      window.removeEventListener('orientationchange', checkScreenConditions);
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener(
          'resize',
          checkScreenConditions
        );
      }
      clearInterval(checkZoomInterval);
    };
  }, [checkScreenConditions]);

  // Killswitch: Check if tour guide is enabled via environment variable
  if (!ENV.NEXT_PUBLIC_TOUR_GUIDE_ENABLED) {
    if (debugMode) {
      logger.info(
        '[Tour Guide] Disabled via NEXT_PUBLIC_TOUR_GUIDE_ENABLED environment variable'
      );
    }
    return null;
  }

  // If no tourKey is provided, don't render the tour
  if (!tourKey) {
    return null;
  }

  // Render backdrop
  const renderBackdrop = () => {
    if (
      currentStep?.stepType !== TourStepTypeEnum.MODAL &&
      currentStep?.stepType !== TourStepTypeEnum.HIGHLIGHT
    ) {
      return null;
    }

    return (
      <div
        className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-sm dark:bg-black/60"
        style={{ pointerEvents: 'none' }}
      />
    );
  };

  // Render resume prompt
  const renderResumePrompt = () => {
    if (!shouldShowResumePrompt) return null;

    return (
      <TourResumeButton
        onResume={() => {
          resumeTour();
        }}
        onSkip={() => {
          skipTour();
        }}
        isVisible={true}
      />
    );
  };

  // Render progress
  const renderProgress = () => {
    if (!showProgress || !progress) return null;

    return (
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Step {progress.currentStepIndex + 1} of {progress.totalSteps}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progress.percentComplete}% Complete
          </span>
        </div>
        <Progress value={progress.percentComplete} className="h-2" />
      </div>
    );
  };

  // Render action buttons
  const renderActionButtons = () => {
    if (!progress) return null;

    return (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {progress.canGoPrevious && (
            <Button
              variant="outline"
              size="sm"
              onClick={previousStep}
              disabled={isLoading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {progress.canSkip && progress.canGoNext && (
            <>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                disabled={isLoading}
                title="Skip the entire tour and mark it as completed"
                className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-300"
              >
                <SkipForward className="mr-1 h-4 w-4" />
                Skip Tour
              </Button>
            </>
          )}

          {progress.canGoNext ? (
            <Button onClick={nextStep} disabled={isLoading} size="sm">
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={completeTour} disabled={isLoading} size="sm">
              <CheckCircle className="mr-1 h-4 w-4" />
              Complete
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render tour content
  const renderTourContent = () => {
    if (!currentStep) return null;

    const isModal = currentStep.stepType === TourStepTypeEnum.MODAL;
    const isTooltip = currentStep.stepType === TourStepTypeEnum.TOOLTIP;
    const isHighlight = currentStep.stepType === TourStepTypeEnum.HIGHLIGHT;
    const isSidebarTooltip =
      currentStep.stepType === TourStepTypeEnum.SIDEBAR_TOOLTIP;

    const cardContent = (
      <Card
        ref={tooltipRef}
        className={cn(
          'bg-card z-[55] border-2 border-blue-200 p-4 shadow-lg dark:border-blue-300',
          isModal && 'mx-auto max-w-md',
          (isTooltip || isHighlight) && 'max-w-sm',
          isSidebarTooltip && 'mt-2 ml-4 max-w-sm'
        )}
        data-tour-card={currentStep?.id || 'tour-card'}
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {currentStep.title}
              </h3>
              {currentStep.isRequired && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
            {progress && !isInDialog && showStepProgress && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tourDefinition?.name} • Step {progress.currentStepIndex + 1} of{' '}
                {progress.totalSteps}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="-mt-1 -mr-1 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={dismissTour}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Progress - only show for non-dialog tours */}
        {!isInDialog && renderProgress()}

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {currentStep.content}
          </p>
        </div>

        {/* Actions */}
        {renderActionButtons()}
      </Card>
    );

    return (
      <AnimatePresence mode="wait">
        {currentStep && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, scale: 0.98, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -5 }}
            transition={{
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smoother motion
              opacity: { duration: 0.15 },
              scale: { duration: 0.2 },
              y: { duration: 0.2 },
            }}
            className={cn(
              'fixed z-[48]',
              isModal && 'inset-0 flex items-center justify-center p-4'
            )}
            style={
              isModal
                ? {}
                : isTooltip || isHighlight || isSidebarTooltip
                  ? { top: tooltipPosition.top, left: tooltipPosition.left }
                  : { right: '1rem', bottom: '1rem', maxWidth: '20rem' }
            }
          >
            {cardContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (!shouldShowTour || isTourCompleted || isTourDismissed) {
    return null;
  }

  // Early returns
  if (shouldShowResumePrompt) {
    return renderResumePrompt();
  }

  // Hide tour guide on small screens or when zoomed in
  if (shouldHide) {
    if (debugMode) {
      const isMacOS = navigator.platform.includes('Mac');
      return (
        <div className="fixed right-4 bottom-4 z-[47]">
          <Card className="border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20">
            <div className="flex items-center gap-2 text-xs text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <span>
                Tour hidden: Screen width ≤ {minScreenWidth}px or zoom &gt;{' '}
                {maxZoomLevel}x (Platform: {isMacOS ? 'macOS' : 'Other'})
              </span>
            </div>
          </Card>
        </div>
      );
    }
    return null;
  }

  if (isLoading && !isActive) {
    return null;
  }

  // Hide tour completely if there's an error
  if (error && !isActive) {
    return null;
  }

  if (!isActive && !isTourCompleted && !isTourDismissed) {
    return (
      <TourStartButton
        onStart={() => startTour()}
        onSkip={() => skipTour()}
        isVisible={true}
      />
    );
  }

  // Render active tour
  const isMacOS = navigator.platform.includes('Mac');

  const tourContent = (
    <div
      className={cn(
        isInDialog ? 'portal-tour-guide' : 'page-specific-tour-guide',
        className
      )}
      ref={tourContainerRef}
      data-platform={isMacOS ? 'macos' : 'other'}
    >
      {renderBackdrop()}
      {renderTourContent()}

      {/* Enhanced CSS for highlighting with dark mode support */}
      <style jsx global>{`
        .tour-highlight {
          position: relative !important;
          z-index: 49 !important;
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px !important;
          background: rgba(59, 130, 246, 0.05) !important;
          outline: 2px solid #3b82f6 !important;
          pointer-events: auto !important;
          will-change: transform, opacity, box-shadow !important;
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
        }

        /* Dark mode highlighting */
        .dark .tour-highlight {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4) !important;
          background: rgba(59, 130, 246, 0.1) !important;
          outline: 2px solid #60a5fa !important;
        }

        /* Sidebar tooltip specific styling */
        .tour-highlight[data-tour*='sidebar'] {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.4) !important;
          outline: 3px solid #3b82f6 !important;
          z-index: 50 !important;
          background: transparent !important; /* remove overlay */
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
          will-change: transform, opacity, box-shadow !important;
        }

        .dark .tour-highlight[data-tour*='sidebar'] {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.5) !important;
          outline: 3px solid #60a5fa !important;
          background: transparent !important; /* remove overlay */
        }

        /* Ensure sidebar elements are properly highlighted in both collapsed and expanded states */
        .tour-highlight[data-tour*='sidebar'] {
          position: relative !important;
          z-index: 50 !important;
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
          perspective: 1000px !important;
          will-change: transform, opacity, box-shadow !important;
        }

        /* Fix for collapsed sidebar highlighting */
        aside .tour-highlight[data-tour*='sidebar'] {
          z-index: 52 !important;
          position: relative !important;
        }

        /* Ensure dialogs appear above tour guide */
        [role='dialog'],
        [data-radix-dialog-content] {
          z-index: 51 !important;
        }

        [data-radix-dialog-overlay] {
          z-index: 50 !important;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .tour-highlight {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.3) !important;
          }

          .dark .tour-highlight {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.4) !important;
          }

          .tour-highlight[data-tour*='sidebar'] {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.4) !important;
          }

          .dark .tour-highlight[data-tour*='sidebar'] {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5) !important;
          }
        }

        /* Hide tour guide on small screens (except macOS) */
        @media (max-width: 1140px) {
          .page-specific-tour-guide:not([data-platform='macos']),
          .portal-tour-guide:not([data-platform='macos']) {
            display: none !important;
          }
        }

        /* Hide tour guide when zoomed in (except macOS) */
        /* Note: JS hides only when devicePixelRatio > maxZoomLevel (default 1.25).
           Use a slightly higher threshold here to avoid hiding at exactly 1.25 (common Windows scaling). */
        @media screen and (min-resolution: 1.26dppx) {
          .page-specific-tour-guide:not([data-platform='macos']),
          .portal-tour-guide:not([data-platform='macos']) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );

  // Wrap content in Portal if in dialog context or portalContainer is provided
  if (isInDialog || portalContainer) {
    return createPortal(tourContent, portalContainer || document.body);
  }

  return tourContent;
}

export default TourGuide;
