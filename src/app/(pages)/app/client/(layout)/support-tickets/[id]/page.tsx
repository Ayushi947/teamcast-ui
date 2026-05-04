'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supportTicketService } from '@/lib/services/services';
import { TicketDetailsPage } from '@/components/app/support-tickets/ticket-details-page';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/shared';

const TicketDetailsRoutePage = () => {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  // No modal state needed for standard page

  // Fetch ticket data
  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => supportTicketService.getTicketByTicketId(ticketId),
    enabled: !!ticketId,
  });

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle ticket updates
  const handleTicketUpdate = async (ticketId: string, updates: any) => {
    try {
      await supportTicketService.updateTicketByTicketId(ticketId, updates);
      toast.success('Ticket updated successfully');
    } catch (error) {
      toast.error('Failed to update ticket');
      logger.error('Update ticket error:', error);
    }
  };

  // No modal handling needed for standard page

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-red-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Error Loading Ticket</h2>
          <p className="mb-4 text-gray-600">
            {error instanceof Error
              ? error.message
              : 'An error occurred while loading the ticket'}
          </p>
          <button
            onClick={handleBack}
            className="rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Ticket not found
  if (!ticket) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-gray-400">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Ticket Not Found</h2>
          <p className="mb-4 text-gray-600">
            The requested ticket could not be found or you don&apos;t have
            permission to view it.
          </p>
          <button
            onClick={handleBack}
            className="rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TicketDetailsPage
        ticketId={ticketId}
        onBack={handleBack}
        onTicketUpdate={handleTicketUpdate}
      />
    </div>
  );
};

export default TicketDetailsRoutePage;
