'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { mcpClientService } from '@/lib/services/services';
import type { IMcpClientCreate, IMcpClientWithApiKey } from '@/lib/shared';
import { toast } from 'sonner';
import { CopyIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateMcpClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess?: () => void;
}

export function CreateMcpClientDialog({
  open,
  onOpenChange,
  onCreateSuccess,
}: CreateMcpClientDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [sourceSystem, setSourceSystem] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [createdClient, setCreatedClient] =
    useState<IMcpClientWithApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: availableScopes } = useQuery({
    queryKey: ['mcpScopes'],
    queryFn: () => mcpClientService.getAvailableScopes(),
  });

  const createMutation = useMutation({
    mutationFn: (data: IMcpClientCreate) =>
      mcpClientService.createMcpClient(data),
    onSuccess: (client) => {
      setCreatedClient(client);
      toast.success('MCP client created successfully');
      onCreateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create MCP client');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (selectedScopes.length === 0) {
      toast.error('At least one scope is required');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      scopes: selectedScopes as IMcpClientCreate['scopes'],
      sourceSystem: sourceSystem.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
    });
  };

  const handleScopeToggle = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleCopyApiKey = async () => {
    if (createdClient?.apiKey) {
      await navigator.clipboard.writeText(createdClient.apiKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedScopes([]);
    setSourceSystem('');
    setContactEmail('');
    setCreatedClient(null);
    setCopied(false);
    onOpenChange(false);
  };

  // Show API key after creation
  if (createdClient) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>MCP Client Created</DialogTitle>
            <DialogDescription>
              Your MCP client has been created. Copy the API key now - it will
              not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                Make sure to copy the API key now. You will not be able to see
                it again after closing this dialog.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={createdClient.apiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyApiKey}
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client Name</Label>
              <p className="text-muted-foreground text-sm">
                {createdClient.name}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="flex flex-wrap gap-1">
                {createdClient.scopes.map((scope) => (
                  <span
                    key={scope}
                    className="bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs"
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create MCP Client</DialogTitle>
          <DialogDescription>
            Create a new MCP client for AI agent integration. The API key will
            be shown once after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My AI Agent"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this integration"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Scopes *</Label>
              <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded border p-3">
                {availableScopes?.map((scopeInfo) => (
                  <div
                    key={scopeInfo.scope}
                    className="flex items-start space-x-2"
                  >
                    <Checkbox
                      id={scopeInfo.scope}
                      checked={selectedScopes.includes(scopeInfo.scope)}
                      onCheckedChange={() => handleScopeToggle(scopeInfo.scope)}
                    />
                    <div className="grid gap-0.5 leading-none">
                      <label
                        htmlFor={scopeInfo.scope}
                        className="cursor-pointer text-sm font-medium"
                      >
                        {scopeInfo.scope}
                      </label>
                      <p className="text-muted-foreground text-xs">
                        {scopeInfo.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceSystem">Source System</Label>
              <Input
                id="sourceSystem"
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                placeholder="e.g., linkedin, greenhouse"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="integration@example.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
