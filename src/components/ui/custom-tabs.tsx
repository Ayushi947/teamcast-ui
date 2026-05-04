import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  disabled?: boolean;
  dataTour?: string;
}

interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export const CustomTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}: CustomTabsProps) => {
  return (
    <div className={cn('flex space-x-1', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            data-tour={tab.dataTour}
            type="button"
            onClick={() => !tab.disabled && onTabChange(tab.key)}
            disabled={tab.disabled}
            className={cn(
              'cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
              tab.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
