'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Loader2,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
  Users,
} from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import { authService } from '@/lib/services/services';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { useActivityTracking } from '@/lib/hooks/use-activity-tracking';
import { ActivityActionEnums } from '@/lib/models/activity';
import { IAuthUser, IAuthToken } from '@/lib/shared';

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess?: (user: IAuthUser, token: IAuthToken) => void;
}

export const EmailVerificationDialog = ({
  isOpen,
  onClose,
  onVerificationSuccess,
}: EmailVerificationDialogProps) => {
  const { user, setUser } = useApp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [attempts, setAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const { trackAuthActivity } = useActivityTracking();
  const [shouldPreventClose, setShouldPreventClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Start countdown for resend
      setCountdown(60);
      // Reset states when dialog opens
      setOtp(['', '', '', '', '', '']);
      setVerificationStatus('idle');
      setAttempts(3);
      setIsBlocked(false);
      setShouldPreventClose(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-submit when 6th digit is entered
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleVerifyOtp = useCallback(async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return;
    }

    if (isBlocked || attempts <= 0) {
      toast.error('Maximum attempts exceeded. Please try again later.');
      return;
    }

    setIsLoading(true);
    setVerificationStatus('idle');

    try {
      logger.info('Verifying OTP:', otpString);

      const response = await authService.verifyOtp(otpString);

      logger.info('OTP verification response:', response);

      if (response.message && response.user && response.token) {
        setVerificationStatus('success');
        setShouldPreventClose(true);
        toast.success('Email verified successfully!');

        // Update user and token in context and localStorage
        if (setUser) {
          setUser(response.user);
        }

        localStorage.setItem('token', JSON.stringify(response.token));
        localStorage.setItem('user', JSON.stringify(response.user));

        // Track successful email verification activity
        if (response.user?.id) {
          await trackAuthActivity(
            ActivityActionEnums.EMAIL_VERIFICATION_SUCCESS,
            response.user.id,
            `Email successfully verified for ${response.user.email}`,
            {
              email: response.user.email,
              timestamp: new Date().toISOString(),
              userType: response.user.type,
            }
          );
        }

        // Close dialog after successful verification
        setTimeout(() => {
          setShouldPreventClose(false);
          onClose();
          if (onVerificationSuccess) {
            onVerificationSuccess(response.user, response.token);
          }
        }, 2000);
      }
    } catch (error) {
      logger.error('OTP verification error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to verify OTP';
      toast.error(errorMessage);
      setVerificationStatus('error');

      // Track failed email verification activity
      if (user?.id) {
        await trackAuthActivity(
          ActivityActionEnums.EMAIL_VERIFICATION_FAILED,
          user.id,
          `Failed to verify email for ${user.email} - ${errorMessage}`,
          {
            email: user.email,
            error: errorMessage,
            attempts: attempts,
            timestamp: new Date().toISOString(),
          }
        );
      }

      // Decrease attempts
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);

      if (newAttempts <= 0) {
        setIsBlocked(true);
        toast.error('Maximum attempts exceeded. Redirecting to login...');

        // Clear user data and redirect to login
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          window.location.href = '/app/auth/login';
        }, 500);
        return;
      }

      // Clear OTP on error after a delay
      setTimeout(() => {
        setOtp(['', '', '', '', '', '']);
        setVerificationStatus('idle');
        // Focus first input
        const firstInput = document.getElementById('dialog-otp-0');
        if (firstInput) {
          (firstInput as HTMLInputElement).focus();
        }
      }, 500);
    } finally {
      setIsLoading(false);
    }
  }, [otp, setUser, user, attempts, isBlocked, onClose, onVerificationSuccess]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Reset verification status when user starts typing
    if (verificationStatus !== 'idle') {
      setVerificationStatus('idle');
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`dialog-otp-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`dialog-otp-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !user?.email) return;

    setResendLoading(true);

    try {
      await authService.sendOtpVerification(user.email);
      toast.success('OTP resent successfully!');
      setCountdown(60);
      setVerificationStatus('idle');
    } catch (error) {
      logger.error('Resend OTP error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to resend OTP';
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const currentEmail = user?.email || '';

  const getOtpInputStyle = (_index: number) => {
    const baseStyle =
      'h-12 w-12 text-center text-lg font-bold transition-all duration-500 ease-out';

    if (verificationStatus === 'success') {
      return cn(
        baseStyle,
        'border-2 border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-200/50'
      );
    } else if (verificationStatus === 'error') {
      return cn(
        baseStyle,
        'border-2 border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-200/50'
      );
    }

    return cn(
      baseStyle,
      'border-2 border-gray-200 bg-white text-gray-900 shadow-sm hover:border-gray-300'
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && shouldPreventClose) {
          return;
        }
        onClose();
      }}
    >
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="bg-card w-full">
          <div className="flex h-full flex-col p-6">
            {/* Header */}
            <div className="mb-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-foreground mb-2 text-xl font-bold tracking-tight">
                  Verify Your Email
                </h2>
                <p className="text-muted-foreground text-sm">
                  We&apos;ve sent a verification code to{' '}
                  <span className="text-foreground font-medium">
                    {currentEmail}
                  </span>
                </p>
              </motion.div>
            </div>

            {/* OTP Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 space-y-6"
            >
              {/* OTP Input Grid */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
                    Enter Verification Code
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    We&apos;ve sent a 6-digit code to your email
                  </p>

                  {/* Attempts Counter */}
                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((attempt) => (
                        <div
                          key={attempt}
                          className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            attempt <= attempts
                              ? 'bg-primary'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {attempts} {attempts === 1 ? 'attempt' : 'attempts'}{' '}
                      remaining
                    </span>
                  </div>
                </div>

                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        ...(verificationStatus === 'success' && {
                          scale: [1, 1.1, 1],
                          transition: { duration: 0.6, delay: index * 0.1 },
                        }),
                        ...(verificationStatus === 'error' && {
                          x: [0, -5, 5, -5, 0],
                          transition: { duration: 0.5, delay: index * 0.05 },
                        }),
                      }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <Input
                        id={`dialog-otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={getOtpInputStyle(index)}
                        disabled={isLoading || isBlocked}
                      />
                    </motion.div>
                  ))}
                </div>

                {isBlocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center py-3"
                  >
                    <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                        Maximum attempts exceeded. Redirecting to login...
                      </span>
                    </div>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center space-x-3 py-3"
                  >
                    <div className="flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/20">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Verifying your code...
                      </span>
                    </div>
                  </motion.div>
                )}

                {verificationStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center py-3"
                  >
                    <div className="flex items-center space-x-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2 dark:border-green-800 dark:bg-green-900/20">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        Email verified successfully!
                      </span>
                    </div>
                  </motion.div>
                )}

                {verificationStatus === 'error' && !isBlocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center py-3"
                  >
                    <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                        Invalid code. {attempts}{' '}
                        {attempts === 1 ? 'attempt' : 'attempts'} remaining.
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Resend Section */}
              <div className="space-y-3 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                      Didn&apos;t receive the code?
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || resendLoading || isBlocked}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary hover:border-primary/90 w-full transition-all duration-200 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>

              {/* Help Text */}
              <div className="from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20 dark:border-primary/30 rounded-xl border bg-gradient-to-r p-3">
                <div className="flex items-start space-x-2">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="bg-primary h-2 w-2 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-primary mb-1 text-sm font-medium">
                      Check your email
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Look in your inbox and spam folder for the verification
                      code. It may take a few minutes to arrive.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-muted-foreground/70 mt-4 flex items-center justify-center space-x-4 text-xs"
            >
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Fast</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Trusted</span>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
