'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bell,
  MessageCircle,
  Eye,
  Shield,
  Palette,
  Volume2,
  Moon,
  Sun,
  Monitor,
  Save,
  RotateCcw,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConvexUserType } from '@/lib/services/chat-service/chat.service';

interface ChatSettingsProps {
  userId: string;
  userType: ConvexUserType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  _className?: string;
}

interface ChatSettings {
  // Notification preferences
  enableNotifications: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'never';

  // Privacy settings
  allowDirectMessages: boolean;
  allowCommunityMessages: boolean;
  showOnlineStatus: boolean;

  // Feature preferences
  enableFileSharing: boolean;
  enableVideoChat: boolean;
  autoArchiveOldChats: boolean;
  autoArchiveDays: number;

  // Theme and display
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
}

const defaultSettings: ChatSettings = {
  enableNotifications: true,
  enableEmailNotifications: true,
  enablePushNotifications: true,
  notificationFrequency: 'immediate',
  allowDirectMessages: true,
  allowCommunityMessages: true,
  showOnlineStatus: true,
  enableFileSharing: true,
  enableVideoChat: true,
  autoArchiveOldChats: false,
  autoArchiveDays: 30,
  theme: 'system',
  fontSize: 'medium',
};

export function ChatSettings({
  userId,
  userType,
  open,
  onOpenChange,
  _className,
}: ChatSettingsProps) {
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [initialSettings, setInitialSettings] =
    useState<ChatSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings (would typically come from API)
  useEffect(() => {
    // Simulate loading settings
    const loadedSettings = { ...defaultSettings };
    setSettings(loadedSettings);
    setInitialSettings(loadedSettings);
  }, [userId]);

  // Check for changes
  useEffect(() => {
    const changed =
      JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setHasChanges(changed);
  }, [settings, initialSettings]);

  const handleSettingChange = <K extends keyof ChatSettings>(
    key: K,
    value: ChatSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setInitialSettings(settings);
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (_error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(false);
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
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Chat Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingItem
                icon={Bell}
                title="Enable Notifications"
                description="Receive notifications for new messages and updates"
              >
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange('enableNotifications', checked)
                  }
                />
              </SettingItem>

              <Separator />

              <SettingItem
                icon={MessageCircle}
                title="Email Notifications"
                description="Get notified via email for important messages"
              >
                <Switch
                  checked={settings.enableEmailNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange('enableEmailNotifications', checked)
                  }
                  disabled={!settings.enableNotifications}
                />
              </SettingItem>

              <Separator />

              <SettingItem
                icon={Volume2}
                title="Push Notifications"
                description="Receive push notifications on your device"
              >
                <Switch
                  checked={settings.enablePushNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange('enablePushNotifications', checked)
                  }
                  disabled={!settings.enableNotifications}
                />
              </SettingItem>

              <Separator />

              <SettingItem
                icon={Bell}
                title="Notification Frequency"
                description="How often you want to receive notifications"
              >
                <Select
                  value={settings.notificationFrequency}
                  onValueChange={(
                    value: ChatSettings['notificationFrequency']
                  ) => handleSettingChange('notificationFrequency', value)}
                  disabled={!settings.enableNotifications}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </SettingItem>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingItem
                icon={MessageCircle}
                title="Allow Direct Messages"
                description="Let other users send you direct messages"
              >
                <Switch
                  checked={settings.allowDirectMessages}
                  onCheckedChange={(checked) =>
                    handleSettingChange('allowDirectMessages', checked)
                  }
                />
              </SettingItem>

              <Separator />

              {userType === 'candidate' && (
                <>
                  <SettingItem
                    icon={MessageCircle}
                    title="Allow Community Messages"
                    description="Participate in community discussions and posts"
                  >
                    <Switch
                      checked={settings.allowCommunityMessages}
                      onCheckedChange={(checked) =>
                        handleSettingChange('allowCommunityMessages', checked)
                      }
                    />
                  </SettingItem>

                  <Separator />
                </>
              )}

              <SettingItem
                icon={Eye}
                title="Show Online Status"
                description="Let others see when you're online"
              >
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) =>
                    handleSettingChange('showOnlineStatus', checked)
                  }
                />
              </SettingItem>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4" />
                Chat Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingItem
                icon={MessageCircle}
                title="File Sharing"
                description="Allow uploading and sharing files in chats"
              >
                <Switch
                  checked={settings.enableFileSharing}
                  onCheckedChange={(checked) =>
                    handleSettingChange('enableFileSharing', checked)
                  }
                />
              </SettingItem>

              <Separator />

              <SettingItem
                icon={MessageCircle}
                title="Video Chat"
                description="Enable video calling features"
              >
                <Switch
                  checked={settings.enableVideoChat}
                  onCheckedChange={(checked) =>
                    handleSettingChange('enableVideoChat', checked)
                  }
                />
              </SettingItem>

              <Separator />

              <SettingItem
                icon={MessageCircle}
                title="Auto-Archive Old Chats"
                description="Automatically archive old conversations"
              >
                <Switch
                  checked={settings.autoArchiveOldChats}
                  onCheckedChange={(checked) =>
                    handleSettingChange('autoArchiveOldChats', checked)
                  }
                />
              </SettingItem>

              {settings.autoArchiveOldChats && (
                <>
                  <Separator />
                  <SettingItem
                    icon={MessageCircle}
                    title="Archive After (Days)"
                    description="Number of days before archiving inactive chats"
                  >
                    <Select
                      value={settings.autoArchiveDays.toString()}
                      onValueChange={(value) =>
                        handleSettingChange('autoArchiveDays', parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="14">14</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                        <SelectItem value="90">90</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingItem>
                </>
              )}
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingItem
                icon={Palette}
                title="Theme"
                description="Choose your preferred color theme"
              >
                <Select
                  value={settings.theme}
                  onValueChange={(value: ChatSettings['theme']) =>
                    handleSettingChange('theme', value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </SettingItem>

              <Separator />

              <SettingItem
                icon={Palette}
                title="Font Size"
                description="Adjust the text size in chat messages"
              >
                <Select
                  value={settings.fontSize}
                  onValueChange={(value: ChatSettings['fontSize']) =>
                    handleSettingChange('fontSize', value)
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </SettingItem>
            </CardContent>
          </Card>

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
