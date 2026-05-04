'use client';

import { ChatLayout } from '@/components/app/chat/chat-layout';
import { useApp } from '@/lib/context/app-context';
import { ConvexUserType } from '@/lib/services/chat-service/chat.service';

export default function ChatPage() {
  const { user } = useApp();
  return (
    <div>
      <ChatLayout
        userId={user?.id ?? ''}
        userType={
          (user?.type?.toLocaleLowerCase() || 'partner') as ConvexUserType
        }
        userName={user?.name ?? ''}
      />
    </div>
  );
}
