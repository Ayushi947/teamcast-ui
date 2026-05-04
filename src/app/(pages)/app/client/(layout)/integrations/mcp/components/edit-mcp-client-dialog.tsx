'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { mcpClientService } from '@/lib/services/services';
import type { IMcpClient, IMcpClientUpdate } from '@/lib/shared';
import { toast } from 'sonner';

interface EditMcpClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: IMcpClient;
  onEditSuccess?: () => void;
}

export function EditMcpClientDialog({
  open,
  onOpenChange,
  client,
  onEditSuccess,
}: EditMcpClientDialogProps) {
  const [name, setName] = useState(client.name);
  const [description, setDescription] = useState(client.description || '');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(client.scopes);
  const [sourceSystem, setSourceSystem] = useState(client.sourceSystem || '');
  const [contactEmail, setContactEmail] = useState(client.contactEmail || '');
  const [isActive, setIsActive] = useState(client.isActive);

  // Reset form when client changes
  useEffect(() => {
    setName(client.name);
    setDescription(client.description || '');
    setSelectedScopes(client.scopes);
    setSourceSystem(client.sourceSystem || '');
    setContactEmail(client.contactEmail || '');
    setIsActive(client.isActive);
  }, [client]);

  const { data: availableScopes } = useQuery({
    queryKey: ['mcpScopes'],
    queryFn: () => mcpClientService.getAvailableScopes(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: IMcpClientUpdate) =>
      mcpClientService.updateMcpClient(client.id, data),
    onSuccess: () => {
      toast.success('MCP client updated successfully');
      onEditSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update MCP client');
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

    updateMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      scopes: selectedScopes as IMcpClientUpdate['scopes'],
      sourceSystem: sourceSystem.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      isActive,
    });
  };

  const handleScopeToggle = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit MCP Client</DialogTitle>
          <DialogDescription>
            Update the MCP client configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

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
                      id={`edit-${scopeInfo.scope}`}
                      checked={selectedScopes.includes(scopeInfo.scope)}
                      onCheckedChange={() => handleScopeToggle(scopeInfo.scope)}
                    />
                    <div className="grid gap-0.5 leading-none">
                      <label
                        htmlFor={`edit-${scopeInfo.scope}`}
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
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
