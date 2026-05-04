'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FeatureFlagsHeader } from './components/feature-flags-header';
import { FeatureFlagsList } from './components/feature-flags-list';
import { CreateFeatureFlagDialog } from './components/create-feature-flag-dialog';
import { EditFeatureFlagDialog } from './components/edit-feature-flag-dialog';
import { CopyToClientsDialog } from './components/copy-to-clients-dialog';
import { ScheduleFlagDialog } from './components/schedule-flag-dialog';
import { DiffViewDialog } from './components/diff-view-dialog';
import { PresetsDialog } from './components/presets-dialog';
import type { IFeatureFlag } from '@/lib/shared';

export default function FeatureFlagsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<IFeatureFlag | null>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [copyFlag, setCopyFlag] = useState<IFeatureFlag | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleFlag, setScheduleFlag] = useState<IFeatureFlag | null>(null);
  const [isDiffDialogOpen, setIsDiffDialogOpen] = useState(false);
  const [isPresetsDialogOpen, setIsPresetsDialogOpen] = useState(false);

  const invalidateFlags = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['supportFeatureFlags'] });
  }, [queryClient]);

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditFlag = useCallback((flag: IFeatureFlag) => {
    setEditingFlag(flag);
    setIsEditDialogOpen(true);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    invalidateFlags();
  }, [invalidateFlags]);

  const handleEditSuccess = useCallback(() => {
    setEditingFlag(null);
    invalidateFlags();
  }, [invalidateFlags]);

  const handleEditDialogChange = useCallback((open: boolean) => {
    if (!open) setEditingFlag(null);
    setIsEditDialogOpen(open);
  }, []);

  const handleCopyToClients = useCallback((flag: IFeatureFlag) => {
    setCopyFlag(flag);
    setIsCopyDialogOpen(true);
  }, []);

  const handleCopyDialogChange = useCallback((open: boolean) => {
    if (!open) setCopyFlag(null);
    setIsCopyDialogOpen(open);
  }, []);

  const handleScheduleFlag = useCallback((flag: IFeatureFlag) => {
    setScheduleFlag(flag);
    setIsScheduleDialogOpen(true);
  }, []);

  const handleScheduleDialogChange = useCallback((open: boolean) => {
    if (!open) setScheduleFlag(null);
    setIsScheduleDialogOpen(open);
  }, []);

  return (
    <div className="p-4">
      <FeatureFlagsHeader
        onCreateClick={handleCreateClick}
        onDiffClick={() => setIsDiffDialogOpen(true)}
        onPresetsClick={() => setIsPresetsDialogOpen(true)}
      />

      <div className="mt-6">
        <FeatureFlagsList
          onEditFlag={handleEditFlag}
          onCopyToClients={handleCopyToClients}
          onScheduleFlag={handleScheduleFlag}
        />
      </div>

      <CreateFeatureFlagDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditFeatureFlagDialog
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogChange}
        flag={editingFlag}
        onSuccess={handleEditSuccess}
      />

      <CopyToClientsDialog
        open={isCopyDialogOpen}
        onOpenChange={handleCopyDialogChange}
        flag={copyFlag}
        onSuccess={handleCreateSuccess}
      />

      <ScheduleFlagDialog
        open={isScheduleDialogOpen}
        onOpenChange={handleScheduleDialogChange}
        flag={scheduleFlag}
        onSuccess={handleCreateSuccess}
      />

      <DiffViewDialog
        open={isDiffDialogOpen}
        onOpenChange={setIsDiffDialogOpen}
      />

      <PresetsDialog
        open={isPresetsDialogOpen}
        onOpenChange={setIsPresetsDialogOpen}
        onApplySuccess={invalidateFlags}
      />
    </div>
  );
}
