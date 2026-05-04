'use client';

import { useState, useEffect } from 'react';
import { McpClientsList } from './components/mcp-clients-list';
import { McpClientsHeader } from './components/mcp-clients-header';
import { CreateMcpClientDialog } from './components/create-mcp-client-dialog';

export default function McpClientsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPageInteractable, setIsPageInteractable] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Safety mechanism - if the page is not interactable for more than 10 seconds,
  // force it to be interactable again
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!isPageInteractable) {
      timeoutId = setTimeout(() => {
        setIsPageInteractable(true);
      }, 10000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPageInteractable]);

  const handleCreateClient = () => {
    setIsPageInteractable(false);
    setTimeout(() => {
      setIsCreateDialogOpen(true);
      setTimeout(() => {
        setIsPageInteractable(true);
      }, 300);
    }, 10);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setIsCreateDialogOpen(false);
      setIsPageInteractable(false);
      setTimeout(() => {
        setIsPageInteractable(true);
      }, 300);
    } else {
      setIsCreateDialogOpen(open);
    }
  };

  const handleCreateSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div
      className="text-foreground mx-auto p-4"
      style={{ pointerEvents: isPageInteractable ? 'auto' : 'none' }}
    >
      <McpClientsHeader onCreateClick={handleCreateClient} />

      <div className="mt-6">
        <McpClientsList refreshTrigger={refreshTrigger} />
      </div>

      <CreateMcpClientDialog
        open={isCreateDialogOpen}
        onOpenChange={handleDialogChange}
        onCreateSuccess={handleCreateSuccess}
      />
    </div>
  );
}
