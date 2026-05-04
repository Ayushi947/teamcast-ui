'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentsList } from './components/documents-list';
import { DocumentsHeader } from './components/documents-config-header';
import { AddDocumentsDialog } from './components/add-documents-dialog';

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const handleInviteClient = () => {
    setIsInviteDialogOpen(true);
  };

  const handleInviteDialogChange = (open: boolean) => {
    setIsInviteDialogOpen(open);
  };

  const handleDocumentSaveSuccess = async () => {
    // Refetch the documents list to show the new entry
    await queryClient.refetchQueries({
      queryKey: ['support-country-data'],
      exact: false,
    });
  };

  return (
    <div className="p-4">
      <DocumentsHeader onInviteClick={handleInviteClient} />

      <div className="mt-6 space-y-4">
        <DocumentsList />
      </div>

      <AddDocumentsDialog
        open={isInviteDialogOpen}
        onOpenChange={handleInviteDialogChange}
        onSuccess={handleDocumentSaveSuccess}
      />
    </div>
  );
}
