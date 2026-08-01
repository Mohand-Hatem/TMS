import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'TMS — Task Management System',
    template: '%s | TMS',
  },
  description: 'A powerful, secure, and intuitive team Task Management System (TMS) built for high-performing workflows and real-time collaboration.',
  keywords: ['TMS', 'Task Management System', 'Project Management', 'Workflow', 'Collaboration', 'Productivity', 'Team Dashboard'],
  authors: [{ name: 'TMS Team' }],
  creator: 'TMS Workspace',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'TMS — Task Management System',
    description: 'Empower your collaborative workflow with TMS — a powerful, authoritative team task management system.',
    siteName: 'TMS',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('h-full antialiased', inter.variable, jetbrainsMono.variable, 'font-sans')}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
