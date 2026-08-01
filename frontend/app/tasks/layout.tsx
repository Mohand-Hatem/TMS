import { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';

export default function TasksLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
