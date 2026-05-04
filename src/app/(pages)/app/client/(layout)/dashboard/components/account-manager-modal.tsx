'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Calendar, Shield, Clock, Copy, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientAccountManagerService } from '@/lib/services/services';
import { format } from 'date-fns';
import { parseISO } from 'date-fns';
import { toast } from 'sonner';
import { enumToReadableText } from '@/lib/utils';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export const AccountManagerModal = ({
  isOpen,
  onClose,
  clientId,
}: AccountManagerModalProps) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const {
    data: accountManager,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['accountManager', clientId],
    queryFn: () =>
      clientAccountManagerService.getAccountManagerByClientId(clientId),
    enabled: isOpen && !!clientId,
  });

  const handleCopyEmail = async () => {
    if (accountManager?.email) {
      try {
        await navigator.clipboard.writeText(accountManager.email);
        setCopiedEmail(true);
        toast.success('Email copied to clipboard');
        setTimeout(() => setCopiedEmail(false), 2000);
      } catch (_err) {
        toast.error('Failed to copy email');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ACCOUNT_MANAGER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5" />
            Account Manager Details
          </DialogTitle>
          <DialogDescription>
            Your dedicated account manager information
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-muted h-16 w-16 animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 animate-pulse rounded" />
                <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted h-12 animate-pulse rounded" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <div className="text-destructive mb-2">
              Failed to load account manager details
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {accountManager && !isLoading && (
          <div className="space-y-6">
            {/* Profile Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={accountManager.image}
                      alt={accountManager.name}
                    />
                    <AvatarFallback className="text-lg">
                      {accountManager.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-foreground text-xl font-semibold">
                      {accountManager.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {accountManager.jobTitle || 'Account Manager'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(accountManager.status)}
                      >
                        {enumToReadableText(accountManager.status)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={getRoleColor(accountManager.role)}
                      >
                        {enumToReadableText(accountManager.role)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-foreground flex items-center gap-2 font-semibold">
                <User className="h-4 w-4" />
                Contact Information
              </h4>

              <div className="space-y-3">
                {/* Email */}
                <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-muted-foreground text-sm">
                        {accountManager.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyEmail}
                    className="h-8 w-8 p-0"
                  >
                    {copiedEmail ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Account Type */}
                <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                  <Shield className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <p className="text-muted-foreground text-sm">
                      {accountManager.type}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Assigned Since</p>
                    <p className="text-muted-foreground text-sm">
                      {accountManager.assignedAt
                        ? format(
                            accountManager.assignedAt instanceof Date
                              ? accountManager.assignedAt
                              : parseISO(accountManager.assignedAt),
                            'MMM dd, yyyy'
                          )
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-muted-foreground text-sm">
                      {accountManager.updatedAt
                        ? format(
                            accountManager.updatedAt instanceof Date
                              ? accountManager.updatedAt
                              : parseISO(accountManager.updatedAt),
                            'MMM dd, yyyy'
                          )
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Message */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Need help?</strong> Your account manager is here to
                support you with any questions about your subscription,
                features, or account management.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
