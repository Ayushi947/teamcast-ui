import { SharedLayout } from '@/components/app/common/layout';
import { ConvexHeartbeatWrapper } from '@/components/app/common/convex-heartbeat-wrapper/convex-heartbeat-wrapper';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function PartnerLayout({ children }: LayoutProps) {
  return (
    <SharedLayout userType="partner">
      <ConvexHeartbeatWrapper />
      {children}
    </SharedLayout>
  );
}
