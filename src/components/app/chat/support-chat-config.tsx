'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  MessageCircle,
  Clock,
  Users,
  Settings,
  Save,
  RotateCcw,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetSupportChatConfig,
  useUpdateSupportChatConfig,
} from '@/lib/services/chat-service/anonymous-chat.service';
import { logger } from '@/lib/logger';
import { Id } from '../../../../convex/_generated/dataModel';

interface SupportChatConfigDialogProps {
  userId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SupportChatConfig {
  isLive: boolean;
  availabilityStatus: 'online' | 'away' | 'offline';
  workingHours: {
    start: string;
    end: string;
  };
}

const defaultConfig: SupportChatConfig = {
  isLive: false,
  availabilityStatus: 'offline',
  workingHours: {
    start: '09:00',
    end: '17:00',
  },
};

export function SupportChatConfigDialog({
  userId,
  open,
  onOpenChange,
}: SupportChatConfigDialogProps) {
  const [config, setConfig] = useState<SupportChatConfig>(defaultConfig);
  const [initialConfig, setInitialConfig] =
    useState<SupportChatConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const supportConfig = useGetSupportChatConfig();
  const updateConfig = useUpdateSupportChatConfig();

  // Load configuration from the hook
  useEffect(() => {
    if (supportConfig) {
      const loadedConfig: SupportChatConfig = {
        isLive: supportConfig.isLive,
        availabilityStatus: supportConfig.availabilityStatus,
        workingHours: supportConfig.workingHours,
      };
      setConfig(loadedConfig);
      setInitialConfig(loadedConfig);
    }
  }, [supportConfig]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(initialConfig);
    setHasChanges(changed);
  }, [config, initialConfig]);

  const handleConfigChange = <K extends keyof SupportChatConfig>(
    key: K,
    value: SupportChatConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleWorkingHoursChange = (field: 'start' | 'end', value: string) => {
    setConfig((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig({
        isLive: config.isLive,
        availabilityStatus: config.availabilityStatus,
        workingHours: config.workingHours,
        updatedBy: userId as Id<'users'>,
      });

      setInitialConfig(config);
      setHasChanges(false);
      toast.success('Support chat configuration saved successfully');
    } catch (error) {
      logger.error('Error saving support chat config:', error);
      toast.error('Failed to save support chat configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(initialConfig);
    setHasChanges(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    children,
  }: {
    icon: any;
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-start gap-3">
        <Icon className="text-muted-foreground mt-1 h-5 w-5" />
        <div className="flex-1">
          <Label className="text-sm font-medium">{title}</Label>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="item-center flex gap-2">
          <Settings className="h-4 w-4" />
          <span className="text-base">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Support Chat Configuration
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Configure the support chat for your organization
        </DialogDescription>

        <div className="space-y-6">
          {/* Current Status Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${getStatusColor(config.availabilityStatus)}`}
                  />
                  <span className="text-sm font-medium capitalize">
                    {config.availabilityStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4" />
                Support Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <Separator />

              <SettingItem
                icon={Users}
                title="Availability Status"
                description="Set your current availability status"
              >
                <Select
                  value={config.availabilityStatus}
                  onValueChange={(
                    value: SupportChatConfig['availabilityStatus']
                  ) => handleConfigChange('availabilityStatus', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Online
                      </div>
                    </SelectItem>
                    <SelectItem value="away">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        Away
                      </div>
                    </SelectItem>
                    <SelectItem value="offline">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Offline
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </SettingItem>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-sm font-medium">
                    Start Time
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={config.workingHours.start}
                    onChange={(e) =>
                      handleWorkingHoursChange('start', e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-sm font-medium">
                    End Time
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={config.workingHours.end}
                    onChange={(e) =>
                      handleWorkingHoursChange('end', e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Set your regular working hours. Users will see when support is
                available.
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>

              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
