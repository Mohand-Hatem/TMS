'use client';

import { useProjects } from '@/hooks/use-projects';
import { useUser } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconUsers, IconShieldCheck, IconMail, IconFolder } from '@tabler/icons-react';

export default function TeamPage() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: currentUser } = useUser();

  // Aggregate unique members and owners across projects from seeded Vercel DB
  const allMembers = new Map<string, { id: string; name: string; email?: string; isOwner: boolean; projectsCount: number }>();
  
  if (currentUser) {
    allMembers.set(currentUser.id, {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      isOwner: currentUser.role === 'Admin',
      projectsCount: projects.length,
    });
  }

  projects.forEach((proj) => {
    // Check populated owner object from DB
    if (proj.owner && typeof proj.owner === 'object') {
      const oid = (proj.owner as any)._id || (proj.owner as any).id || (proj.owner as any).email || '';
      if (oid) {
        const existing = allMembers.get(oid);
        allMembers.set(oid, {
          id: oid,
          name: (proj.owner as any).name || 'Workspace Admin',
          email: (proj.owner as any).email || 'admin@test.com',
          isOwner: true,
          projectsCount: (existing?.projectsCount || 0) + 1,
        });
      }
    }

    // Check populated members array from DB
    (proj.members || []).forEach((m) => {
      if (typeof m === 'object' && m !== null) {
        const mid = m._id || m.id || m.email || '';
        if (mid) {
          const existing = allMembers.get(mid);
          allMembers.set(mid, {
            id: mid,
            name: m.name || 'Workspace Collaborator',
            email: m.email || 'confidential-credential@tms.local',
            isOwner: existing ? existing.isOwner : false,
            projectsCount: (existing?.projectsCount || 0) + 1,
          });
        }
      }
    });
  });

  const memberList = Array.from(allMembers.values());

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <IconUsers className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          <span>Team Directory & Collaborators</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Authorized team contributors across your active projects and workspaces.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {memberList.map((m, idx) => {
          const initials = m.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
          return (
            <Card key={m.id || idx} className="p-5 border border-border bg-card rounded-xl shadow-2xs flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-3.5">
                <Avatar className="h-12 w-12 border border-border shrink-0 shadow-xs">
                  <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-bold text-sm text-foreground truncate">{m.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconMail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{m.email || 'No mail registered'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  ID: {m.id.slice(-6).toUpperCase() || 'MEMBER'}
                </span>
                <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                  m.isOwner ? 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}>
                  {m.isOwner && <IconShieldCheck className="h-3 w-3 me-1 inline text-indigo-600 dark:text-indigo-400" />}
                  {m.isOwner ? 'Workspace Lead' : 'Contributor'}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
