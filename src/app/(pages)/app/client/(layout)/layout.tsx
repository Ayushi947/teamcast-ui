'use client';
import { ConvexHeartbeatWrapper } from '@/components/app/common/convex-heartbeat-wrapper/convex-heartbeat-wrapper';
import { SharedLayout } from '@/components/app/common/layout';
import { HelpCenter } from '@/components/app/support-tickets/support-ticket-form/help-center';
import { ReactNode } from 'react';
import { ENV } from '@/lib/env';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SharedLayout userType="client">
      <ConvexHeartbeatWrapper />
      {children}
      {ENV.NEXT_PUBLIC_SUPPORT_TICKET_ENABLED && <HelpCenter />}
    </SharedLayout>
  );
}
