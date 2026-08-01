'use client';

import Link from 'next/link';
import { Project, ProjectMember } from '@/types/project';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconFolder,
  IconUsers,
  IconArrowUpRight,
  IconUserCheck,
} from '@tabler/icons-react';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  currentUserRole?: string;
  currentUserId?: string;
}

/**
 * Responsive Project Card representing an authoritative record in TMS.
 *
 * ASSUMPTION FLAG & KEY DECISION:
 * The design brief references task count and percentage done on project cards. Because `GET /api/projects`
 * in our current REST backend returns populated team members without aggregating task completion stats,
 * this card emphasizes verified team rosters and membership indicators while maintaining structural readiness
 * for task analytics when backend metrics become available.
 */
export function ProjectCard({ project, onEdit, onDelete, currentUserRole, currentUserId }: ProjectCardProps) {
  const projectId = project._id || project.id || '';
  const ownerObj = typeof project.owner === 'object' ? (project.owner as ProjectMember) : null;
  const ownerId = ownerObj?._id || ownerObj?.id || (typeof project.owner === 'string' ? project.owner : '');

  const isAdmin = currentUserRole === 'Admin';
  const isOwner = currentUserId && ownerId && currentUserId === ownerId;
  const canManage = isAdmin || isOwner;

  const getInitials = (name?: string, email?: string) => {
    if (!name && !email) return 'U';
    const source = name || email || 'U';
    return source
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const membersList = (project.members || []).map((m) =>
    typeof m === 'object' ? (m as ProjectMember) : { _id: m as string, name: 'Member', email: '' }
  );

  const maxAvatars = 4;
  const displayMembers = membersList.slice(0, maxAvatars);
  const overflowCount = membersList.length - maxAvatars;

  return (
    <Card className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <div>
        {/* Card Header & Overflow Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-semibold shadow-xs">
              <IconFolder className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <Link
                href={`/projects/${projectId}`}
                className="truncate font-bold tracking-tight text-foreground text-base group-hover:text-primary transition-colors focus-visible:underline"
              >
                {project.name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <IconUserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  Lead: <strong className="font-medium text-foreground">{ownerObj?.name || 'Workspace Lead'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Role-aware actions menu */}
          <div className="flex items-center gap-1">
            <Link href={`/projects/${projectId}`} title="Open Project Board">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <IconArrowUpRight className="h-4 w-4" />
                <span className="sr-only">Open Project</span>
              </Button>
            </Link>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 w-8 text-muted-foreground transition-colors focus-visible:outline-hidden">
                  <IconDotsVertical className="h-4 w-4" />
                  <span className="sr-only">Open Project Controls</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() => onEdit && onEdit(project)}
                    className="cursor-pointer font-medium text-xs flex items-center gap-2"
                  >
                    <IconEdit className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Edit Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete && onDelete(project)}
                    className="cursor-pointer font-medium text-xs flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                    <span>Delete Record</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Project Description */}
        <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground min-h-[36px]">
          {project.description || (
            <span className="italic text-muted-foreground/60">No additional specification notes registered for this workspace board.</span>
          )}
        </p>
      </div>

      {/* Card Footer: Roster & Status Badge */}
      <div className="mt-5 pt-3.5 border-t border-border/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Overlapping Avatar Row */}
          <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
            {displayMembers.map((member, index) => (
              <Avatar
                key={member._id || index}
                title={`${member.name} (${member.email})`}
                className="inline-block h-7 w-7 rounded-full ring-2 ring-card bg-muted"
              >
                <AvatarFallback className="text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {getInitials(member.name, member.email)}
                </AvatarFallback>
              </Avatar>
            ))}
            {overflowCount > 0 && (
              <div
                title={`${overflowCount} additional team members`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-muted ring-2 ring-card text-[10px] font-bold text-muted-foreground"
              >
                +{overflowCount}
              </div>
            )}
          </div>

          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 ms-1">
            <IconUsers className="h-3.5 w-3.5 text-muted-foreground/80" />
            <span>{membersList.length} {membersList.length === 1 ? 'Member' : 'Members'}</span>
          </span>
        </div>

        {/* Stamped Status Badge */}
        <Badge
          variant="outline"
          className="rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 shadow-2xs rotate-[-1deg] select-none"
        >
          Active Record
        </Badge>
      </div>
    </Card>
  );
}
