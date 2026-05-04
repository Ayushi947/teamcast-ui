'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { supportUserManagementService } from '@/lib/services/services';
import { useMutation } from '@tanstack/react-query';
import { useApp } from '@/lib/context/app-context';
import { logger } from '@/lib/shared/utils/logger';
const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  toggleShow,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  showPassword: boolean;
  toggleShow: () => void;
  error: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </Label>
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`pr-10 ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={toggleShow}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-gray-400" />
        ) : (
          <Eye className="h-4 w-4 text-gray-400" />
        )}
      </Button>
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user } = useApp();
  const supportUserId = user?.supportUserId;
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const changeSupportPasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      supportUserManagementService.changeSupportUserPassword(
        supportUserId || '',
        data
      ),
    onSuccess: () => {
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsOpen(false);
      router.push('/app/support/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update password');
      setIsOpen(false);
    },
  });

  // Open dialog when component mounts
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return minLength && hasNumber && hasLetter && hasSpecial;
  };

  const handleValidation = () => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword =
        'Password must be at least 8 characters with numbers, letters and special characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword === newPassword && currentPassword.trim()) {
      newErrors.newPassword =
        'New password must be different from current password';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleCancelPasswordEdit = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsOpen(false);
    router.back();
  };

  const handlePasswordUpdate = async () => {
    if (!handleValidation()) return;

    try {
      await changeSupportPasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
    } catch (error) {
      logger.error('Failed to update password', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancelPasswordEdit();
    }
    setIsOpen(open);
  };

  const isLoading = changeSupportPasswordMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Reset Password
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Update your account password
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <PasswordInput
            id="currentPassword"
            label="Current Password *"
            value={currentPassword}
            onChange={(e) => {
              const value = e.target.value;
              setCurrentPassword(value);
              if (errors.currentPassword) {
                setErrors((prev) => ({ ...prev, currentPassword: '' }));
              }
            }}
            placeholder="Enter your current password"
            showPassword={showCurrentPassword}
            toggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            error={errors.currentPassword}
          />

          <PasswordInput
            id="newPassword"
            label="New Password *"
            value={newPassword}
            onChange={(e) => {
              const value = e.target.value;
              setNewPassword(value);
              if (errors.newPassword) {
                setErrors((prev) => ({ ...prev, newPassword: '' }));
              }
            }}
            placeholder="Enter your new password"
            showPassword={showNewPassword}
            toggleShow={() => setShowNewPassword(!showNewPassword)}
            error={errors.newPassword}
          />

          {!errors.newPassword && (
            <p className="-mt-2 text-xs text-gray-500">
              Must be at least 8 characters with numbers, letters and special
              characters
            </p>
          )}

          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password *"
            value={confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setConfirmPassword(value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }
            }}
            placeholder="Confirm your new password"
            showPassword={showConfirmPassword}
            toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
          />
        </div>

        <div className="flex gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleCancelPasswordEdit}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordUpdate}
            className="flex-1"
            disabled={
              isLoading || !currentPassword || !newPassword || !confirmPassword
            }
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </div>
            ) : (
              'Update Password'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
