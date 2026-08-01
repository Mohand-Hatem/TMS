import { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';

export default function TeamLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
