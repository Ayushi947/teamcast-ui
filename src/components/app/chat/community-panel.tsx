'use client';

import { CommunityFeed } from './community-feed';
import { ConvexUserType } from '@/lib/services/chat-service/chat.service';

interface CommunityPanelProps {
  userId: string;
  userType: ConvexUserType;
}

export function CommunityPanel({ userId, userType }: CommunityPanelProps) {
  return (
    <div className="bg-card h-full rounded-lg border">
      <CommunityFeed userId={userId} userType={userType} />
    </div>
  );
}
