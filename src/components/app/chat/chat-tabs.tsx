'use client';

import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Briefcase, HeadphonesIcon } from 'lucide-react';

interface TabConfig {
  id: string;
  label: string;
  icon: string;
  badge: number;
}

interface ChatTabsProps {
  tabsConfig: TabConfig[];
}

export function ChatTabs({ tabsConfig }: ChatTabsProps) {
  // Map string icon names to actual components
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return <MessageSquare className="h-4 w-4" />;
      case 'Users':
        return <Users className="h-4 w-4" />;
      case 'Briefcase':
        return <Briefcase className="h-4 w-4" />;
      case 'HeadphonesIcon':
        return <HeadphonesIcon className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-muted/50 grid h-11 w-full grid-cols-2 sm:max-w-lg sm:grid-cols-4">
      {tabsConfig.map((tab) => (
        <div
          key={tab.id}
          className="data-[state=active]:bg-background data-[state=active]:text-foreground relative flex items-center gap-2 text-sm font-medium"
        >
          {getIconComponent(tab.icon)}
          <span className="text-xs sm:text-sm">{tab.label}</span>
          {tab.badge > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center p-0 text-xs"
            >
              {tab.badge > 99 ? '99+' : tab.badge}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}
