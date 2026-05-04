import { SharedLayout } from '@/components/app/common/layout';
import { ConvexHeartbeatWrapper } from '@/components/app/common/convex-heartbeat-wrapper/convex-heartbeat-wrapper';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SharedLayout userType="support">
      <ConvexHeartbeatWrapper />
      {children}
    </SharedLayout>
  );
}
