'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, LogIn } from 'lucide-react';
import { useImpersonation } from '@/lib/utils/impersonation.utils';
import {
  UserTypeEnum,
  ImpersonationReasonEnum,
} from '@/lib/shared/models/common/enums';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatEnumValue } from '@/lib/utils';
import {
  canPerformImpersonation,
  canImpersonateClientUsers,
} from '@/lib/utils/impersonation.utils';
import { useApp } from '@/lib/context/app-context';

interface ImpersonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUserType: UserTypeEnum;
  targetUserName: string;
  targetUserEmail?: string;
  defaultReason?: string;
}

export function ImpersonationDialog({
  open,
  onOpenChange,
  targetUserId,
  targetUserType,
  targetUserName,
  targetUserEmail,
  defaultReason,
}: ImpersonationDialogProps) {
  const { startImpersonation } = useImpersonation();
  const [selectedReason, setSelectedReason] = useState(defaultReason || '');
  const [customReason, setCustomReason] = useState('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const { user } = useApp();

  const handleConfirmImpersonation = async () => {
    setIsImpersonating(true);
    try {
      const finalReason =
        selectedReason === 'custom'
          ? customReason
          : selectedReason
            ? formatEnumValue(selectedReason)
            : 'No reason provided';

      await startImpersonation(targetUserId, targetUserType, finalReason);
    } catch (_error) {
      // Impersonation failed - error handling is done in the hook
    } finally {
      setIsImpersonating(false);
      onOpenChange(false);
    }
  };

  const getUserTypeLabel = (type: UserTypeEnum): string => {
    switch (type) {
      case UserTypeEnum.CANDIDATE:
        return 'candidate';
      case UserTypeEnum.CLIENT:
        return 'client';
      case UserTypeEnum.PARTNER:
        return 'partner';
      default:
        return 'user';
    }
  };

  const hasPermission =
    targetUserType === UserTypeEnum.CLIENT
      ? canImpersonateClientUsers(user)
      : canPerformImpersonation(user);

  if (!hasPermission) {
    const getPermissionMessage = () => {
      if (targetUserType === UserTypeEnum.CLIENT) {
        return 'Only support admins and account managers can impersonate client users.';
      } else if (targetUserType === UserTypeEnum.CANDIDATE) {
        return 'Only support admins, technical support, or recruiters can impersonate candidate users.';
      } else {
        return 'Only support admins and technical support can perform impersonation.';
      }
    };

    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="bg-card dark:bg-card max-w-md border border-neutral-200 dark:border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-red-100 p-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Access Denied
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {getPermissionMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => onOpenChange(false)}
              className="border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card dark:bg-card max-w-md border border-neutral-200 dark:border-neutral-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            Log In as{' '}
            {getUserTypeLabel(targetUserType).charAt(0).toUpperCase() +
              getUserTypeLabel(targetUserType).slice(1)}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            You are about to log in as{' '}
            <strong className="text-foreground">{targetUserName}</strong>
            {targetUserEmail && ` (${targetUserEmail})`}. This will sign you in
            as this {getUserTypeLabel(targetUserType)} and allow you to access
            their account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason" className="text-foreground">
              Reason for impersonation (optional)
            </Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="bg-background mt-1 border-neutral-200 dark:border-neutral-700">
                <SelectValue placeholder="Select a reason or enter custom..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-neutral-200 dark:border-neutral-700">
                {Object.values(ImpersonationReasonEnum).map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {formatEnumValue(reason)}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Reason...</SelectItem>
              </SelectContent>
            </Select>
            {selectedReason === 'custom' && (
              <Textarea
                placeholder="Enter a custom reason for this impersonation session..."
                value={customReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCustomReason(e.target.value)
                }
                className="bg-background mt-2 border-neutral-200 dark:border-neutral-700"
              />
            )}
          </div>

          <div className="bg-muted/50 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <p className="text-foreground mb-2 font-medium">Important:</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                This action will be logged for audit purposes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                You will have access to all {getUserTypeLabel(
                  targetUserType
                )}{' '}
                data and functions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                The session will expire automatically after 2 hours
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                You can end the session at any time by signing out
              </li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isImpersonating}
            className="border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmImpersonation}
            disabled={isImpersonating}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isImpersonating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Button component that can be used to trigger the dialog
interface ImpersonationButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  tooltip?: string;
}

export function ImpersonationButton({
  onClick,
  className,
  size = 'default',
  disabled = false,
  tooltip,
}: ImpersonationButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      onClick={onClick}
      className={`flex h-10 items-center gap-2 border-orange-200 bg-orange-50 px-4 text-orange-700 hover:border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-950/50 ${className || ''}`}
      disabled={disabled}
      title={tooltip}
    >
      <LogIn className="h-4 w-4" />
      <span>Sign In</span>
    </Button>
  );
}
