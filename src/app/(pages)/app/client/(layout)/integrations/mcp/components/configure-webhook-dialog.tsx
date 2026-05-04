'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mcpClientService } from '@/lib/services/services';
import type { IMcpClient, IMcpClientWebhookConfig } from '@/lib/shared';
import { toast } from 'sonner';
import { CheckCircleIcon, XCircleIcon, LoaderIcon } from 'lucide-react';

interface ConfigureWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: IMcpClient;
  onConfigureSuccess?: () => void;
}

export function ConfigureWebhookDialog({
  open,
  onOpenChange,
  client,
  onConfigureSuccess,
}: ConfigureWebhookDialogProps) {
  const [webhookUrl, setWebhookUrl] = useState(client.webhookUrl || '');
  const [webhookEnabled, setWebhookEnabled] = useState(client.webhookEnabled);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Reset form when client changes
  useEffect(() => {
    setWebhookUrl(client.webhookUrl || '');
    setWebhookEnabled(client.webhookEnabled);
    setTestResult(null);
  }, [client]);

  const configureMutation = useMutation({
    mutationFn: (config: IMcpClientWebhookConfig) =>
      mcpClientService.configureWebhook(client.id, config),
    onSuccess: () => {
      toast.success('Webhook configured successfully');
      onConfigureSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to configure webhook');
    },
  });

  const testMutation = useMutation({
    mutationFn: () => mcpClientService.testWebhook(client.id),
    onSuccess: (result) => {
      setTestResult(result);
      if (result.success) {
        toast.success('Webhook test successful');
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: Error) => {
      setTestResult({ success: false, message: error.message });
      toast.error(error.message || 'Webhook test failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (webhookEnabled && !webhookUrl.trim()) {
      toast.error('Webhook URL is required when webhooks are enabled');
      return;
    }

    if (webhookUrl && !webhookUrl.startsWith('https://')) {
      toast.error('Webhook URL must use HTTPS');
      return;
    }

    configureMutation.mutate({
      webhookUrl: webhookUrl.trim(),
      webhookEnabled,
    });
  };

  const handleTest = () => {
    if (!client.webhookUrl) {
      toast.error('Save the webhook URL first before testing');
      return;
    }
    setTestResult(null);
    testMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure Webhook</DialogTitle>
          <DialogDescription>
            Set up webhook notifications for {client.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="webhookEnabled">Enable Webhooks</Label>
                <p className="text-muted-foreground text-xs">
                  Receive notifications for assessment and application events
                </p>
              </div>
              <Switch
                id="webhookEnabled"
                checked={webhookEnabled}
                onCheckedChange={setWebhookEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                disabled={!webhookEnabled}
              />
              <p className="text-muted-foreground text-xs">
                Must be an HTTPS URL that accepts POST requests
              </p>
            </div>

            {client.webhookUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Test Webhook</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTest}
                    disabled={testMutation.isPending}
                  >
                    {testMutation.isPending ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Send Test'
                    )}
                  </Button>
                </div>

                {testResult && (
                  <Alert
                    variant={testResult.success ? 'default' : 'destructive'}
                  >
                    {testResult.success ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <XCircleIcon className="h-4 w-4" />
                    )}
                    <AlertDescription>{testResult.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Alert>
              <AlertDescription>
                <strong>Webhook Events:</strong>
                <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                  <li>
                    assessment.started - When a candidate starts the assessment
                  </li>
                  <li>assessment.completed - When an assessment is finished</li>
                  <li>assessment.passed - When a candidate passes</li>
                  <li>assessment.failed - When a candidate fails</li>
                  <li>
                    application.statusChanged - When application status changes
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={configureMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={configureMutation.isPending}>
              {configureMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
