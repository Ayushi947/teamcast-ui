'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Banner from '@/components/ui/banner';
import { Mail, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import { authService } from '@/lib/services/services';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  is_email_verification_banner_dismissed,
  dismiss_email_verification_banner,
} from '@/lib/utils/auth-utils';
import { EmailVerificationDialog } from './email-verification-dialog';
import { useActivityTracking } from '@/lib/hooks/use-activity-tracking';
import { ActivityActionEnums } from '@/lib/models/activity';
import { IAuthUser, IAuthToken } from '@/lib/shared';

interface EmailVerificationBannerProps {
  onClose?: () => void;
}

export const EmailVerificationBanner = ({
  onClose,
}: EmailVerificationBannerProps) => {
  const { user, setUser } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const { trackAuthActivity } = useActivityTracking();

  // Check if banner should be shown based on email verification status and dismissal
  useEffect(() => {
    const checkBannerVisibility = () => {
      // If user is verified (emailVerified is not null), hide banner
      if (user?.emailVerified !== null) {
        setIsVisible(false);
        // Remove email verification pending state from localStorage
        localStorage.removeItem('email_verification_banner_pending');
        return;
      }

      // If user is not verified but banner is dismissed, hide banner
      if (is_email_verification_banner_dismissed()) {
        setIsVisible(false);
        return;
      }

      // Show banner if user is not verified and banner is not dismissed
      setIsVisible(true);
    };

    checkBannerVisibility();
  }, [user?.emailVerified]);

  // Listen for auth changes to refresh banner state
  useEffect(() => {
    const handleAuthChange = () => {
      // Re-check banner visibility when auth state changes
      if (user?.emailVerified !== null) {
        setIsVisible(false);
        localStorage.removeItem('email_verification_banner_pending');
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [user?.emailVerified]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Show banner if user is not verified (emailVerified is null) and not dismissed
  if (user?.emailVerified !== null || !isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    dismiss_email_verification_banner();
    onClose?.();
  };

  const handleSendOtp = async () => {
    if (!user?.email) {
      toast.error('Email not found');
      return;
    }

    if (countdown > 0) {
      toast.error(
        `Please wait ${countdown} seconds before requesting another code`
      );
      return;
    }

    // Open the verification dialog immediately
    setShowDialog(true);

    // Start 60-second countdown
    setCountdown(60);

    setIsResending(true);

    try {
      await authService.sendOtpVerification(user.email);
      toast.success('Verification code sent to your email address!');

      // Track email verification request activity
      if (user?.id) {
        await trackAuthActivity(
          ActivityActionEnums.EMAIL_VERIFICATION_REQUEST,
          user.id,
          `Email verification OTP requested for ${user.email}`,
          { email: user.email, timestamp: new Date().toISOString() }
        );
      }
    } catch (error) {
      logger.error('Send OTP error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send OTP';
      toast.error(errorMessage);
      // Reset countdown on error
      setCountdown(0);

      // Track failed email verification request activity
      if (user?.id) {
        await trackAuthActivity(
          ActivityActionEnums.EMAIL_VERIFICATION_FAILED,
          user.id,
          `Failed to send email verification OTP for ${user.email}`,
          {
            email: user.email,
            error: errorMessage,
            timestamp: new Date().toISOString(),
          }
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (user?.emailVerified !== null) {
      setIsVisible(false);
      localStorage.removeItem('email_verification_banner_pending');
    }
  };

  const handleVerificationSuccess = (
    updatedUser: IAuthUser,
    token: IAuthToken
  ) => {
    if (setUser) {
      setUser(updatedUser);
    }

    localStorage.setItem('token', JSON.stringify(token));
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setIsVisible(false);
    localStorage.removeItem('email_verification_banner_pending');
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mb-6"
          >
            <Banner
              variant="warning"
              title="Email Verification Required"
              description={
                countdown > 0
                  ? `Please verify your email address to access all features. Didn't receive the email? Try again in ${countdown} seconds.`
                  : 'Please verify your email address to access all features and ensure account security.'
              }
              buttonText={
                isResending
                  ? 'Sending...'
                  : countdown > 0
                    ? `Resend in ${countdown}s`
                    : 'Verify Email'
              }
              onButtonClick={handleSendOtp}
              onClose={handleClose}
              icon={
                isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Verification Dialog */}
      <EmailVerificationDialog
        isOpen={showDialog}
        onClose={handleDialogClose}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </>
  );
};
