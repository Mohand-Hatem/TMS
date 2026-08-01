'use client';

import { useUser } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { IconSettings, IconShieldCheck, IconUserCheck, IconBellCheck } from '@tabler/icons-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: user } = useUser();

  const handleSavePreferences = () => {
    toast.success('Workspace preferences and UI layout configuration saved!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <IconSettings className="h-7 w-7 text-primary" />
          <span>Workspace & Profile Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage session authorization parameters, interface theme preferences, and account security.
        </p>
      </div>

      <Card className="p-6 border border-border bg-card rounded-xl space-y-6 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-foreground mb-1">Active User Profile</h2>
          <p className="text-xs text-muted-foreground">Authenticated credentials bound to this browser window.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border/60">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Account Name
            </label>
            <div className="text-sm font-bold text-foreground">{user?.name || 'Loading profile...'}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Registered Email
            </label>
            <div className="text-sm font-mono font-medium text-foreground">{user?.email || 'm@example.com'}</div>
          </div>
          <div className="sm:col-span-2 pt-2 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">Workspace Authorization Role:</span>
            <Badge variant="outline" className="font-bold text-xs bg-indigo-50 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 px-2.5 py-0.5">
              <IconShieldCheck className="h-3.5 w-3.5 me-1 inline text-indigo-600 dark:text-indigo-400" />
              <span>{user?.role || 'Member'}</span>
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Interface Theme & Lighting</h3>
              <p className="text-xs text-muted-foreground">Switch between high-contrast Light Mode and low-glare Dark Mode.</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/60">
            <div>
              <h3 className="text-sm font-bold text-foreground">Toaster Notification Color Scheme</h3>
              <p className="text-xs text-muted-foreground">Enforces clean light-themed feedback toasts across all dashboard views.</p>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] px-2.5 py-1 text-emerald-600 border-emerald-300 bg-background">
              LIGHT THEME LOCKED
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button onClick={handleSavePreferences} className="text-xs font-medium px-5 h-9 shadow-xs">
            Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
}
