'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Plus, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TourDefinitionsList } from './components/tour-definitions-list';
import { TourDefinitionFormDialog } from './components/tour-definition-form-dialog';
import { ITourDefinitionExtended } from '@/lib/shared/models/api/support/tour.definition.management.api';

export default function TourDefinitionsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTour, setEditingTour] =
    useState<ITourDefinitionExtended | null>(null);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (tour: ITourDefinitionExtended) => {
    setEditingTour(tour);
  };

  const handleEditSuccess = () => {
    setEditingTour(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/app/support/configurations')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <MapPin className="text-primary h-5 w-5" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold tracking-tight">
                  Tour Definitions
                </h1>
                <p className="text-muted-foreground mt-1.5 text-base">
                  Manage tour definitions and guide users through the platform
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Tour Definition
        </Button>
      </div>

      {/* Tour Definitions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tour Definitions</CardTitle>
          <CardDescription>
            View and manage all tour definitions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TourDefinitionsList onEdit={handleEdit} />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <TourDefinitionFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Dialog */}
      {editingTour && (
        <TourDefinitionFormDialog
          open={!!editingTour}
          onOpenChange={(open) => {
            if (!open) setEditingTour(null);
          }}
          tour={editingTour}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
