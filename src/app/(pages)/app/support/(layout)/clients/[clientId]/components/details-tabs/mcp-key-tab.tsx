'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supportClientManagementService } from '@/lib/services/services';
import type { IMcpClientWithApiKey } from '@/lib/shared';
import { toast } from 'sonner';
import { CheckIcon, CopyIcon, KeyRound, RefreshCwIcon } from 'lucide-react';

interface McpKeyTabProps {
  clientId: string;
  clientName?: string;
  isActive?: boolean;
}

export function McpKeyTab({
  clientId,
  clientName,
  isActive = false,
}: McpKeyTabProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () =>
      supportClientManagementService.generateOrRotateClientMcpKey(clientId),
    onSuccess: (data: IMcpClientWithApiKey) => {
      setApiKey(data.apiKey);
      toast.success('MCP key generated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate MCP key');
    },
  });

  const handleGenerateClick = () => setShowConfirmDialog(true);

  const handleConfirmGenerate = () => {
    setShowConfirmDialog(false);
    generateMutation.mutate();
  };

  const handleCopy = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success('MCP key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isActive) return null;

  return (
    <>
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            MCP Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKey ? (
            <>
              <Alert variant="destructive">
                <AlertDescription>
                  Copy this MCP key now. You will not be able to see it again.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>New MCP Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={apiKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    aria-label="Copy MCP key"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Alert>
              <AlertDescription>
                For security reasons, existing MCP keys can’t be displayed. You
                can generate a new key (this will invalidate any previous key
                for this client).
              </AlertDescription>
            </Alert>
          )}

          <Button
            variant="outline"
            onClick={handleGenerateClick}
            disabled={generateMutation.isPending}
            className="w-full"
          >
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            {generateMutation.isPending
              ? 'Generating…'
              : 'Generate / Rotate MCP Key'}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate / rotate MCP key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate the current MCP key immediately. Any
              integrations using the old key will stop working. The new key will
              be shown only once.
              {clientName ? ` (Client: ${clientName})` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmGenerate}>
              Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
