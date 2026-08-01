'use client';

import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { ProjectMember } from '@/types/project';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconCalendarDue,
  IconEdit,
  IconTrash,
  IconCheck,
  IconUser,
} from '@tabler/icons-react';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  currentUserRole?: string;
}

/**
 * Task Card representing a task entry in our project board.
 *
 * SIGNATURE ELEMENT & VISUAL DIRECTION:
 * Status badges are rendered like authentic rubber stamps: subtly rotated (-1.5°), hairline border,
 * solid small-caps text on a tinted paper background (`TO DO`, `IN PROGRESS`, `DONE`). Everything else
 * remains quiet and legible so this reads as intentional, authoritative design.
 */
export function TaskCard({ task, onEdit, onDelete, onStatusChange, currentUserRole }: TaskCardProps) {
  const taskId = task._id || task.id || '';
  const assigneesList: ProjectMember[] = Array.isArray(task.assignee)
    ? (task.assignee.filter((a) => typeof a === 'object' && a !== null) as ProjectMember[])
    : typeof task.assignee === 'object' && task.assignee !== null
    ? [task.assignee as ProjectMember]
    : [];

  const getInitials = (name?: string, email?: string) => {
    if (!name && !email) return '?';
    const source = name || email || '?';
    return source
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Status Rubber Stamp Theme Mapping
  const getStatusStampStyle = (status: TaskStatus) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-50 text-emerald-900 border-emerald-600/80 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-500/70';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-900 border-indigo-600/80 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-500/70';
      case 'To Do':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-400/80 dark:bg-slate-900/80 dark:text-slate-300 dark:border-slate-600/80';
    }
  };

  // Priority Badge Mapping
  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70 font-bold';
      case 'Medium':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70 font-semibold';
      case 'Low':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-300 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800 font-normal';
    }
  };

  const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

  return (
    <Card className="group relative rounded-lg border border-border bg-card p-4 shadow-2xs hover:border-primary/40 hover:shadow-sm transition-all duration-150 flex flex-col justify-between gap-3">
      <div>
        {/* Top bar: Stamped Status & Priority */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* THE SIGNATURE RUBBER STAMP STATUS BADGE */}
          <span
            className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono font-extrabold tracking-widest uppercase border shadow-2xs select-none -rotate-[1.5deg] transition-transform group-hover:rotate-0 ${getStatusStampStyle(
              task.status
            )}`}
          >
            {task.status}
          </span>

          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={`rounded text-[10px] px-2 py-0 uppercase tracking-wide ${getPriorityStyle(task.priority)}`}>
              {task.priority}
            </Badge>

            {/* Task Controls & Status Quick Move */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground h-7 w-7 transition-colors focus-visible:outline-hidden">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open Task Actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Stamp Status State
                  </DropdownMenuLabel>
                  {statuses.map((st) => (
                    <DropdownMenuItem
                      key={st}
                      onClick={() => onStatusChange && onStatusChange(taskId, st)}
                      className="cursor-pointer text-xs font-medium flex items-center justify-between gap-2"
                    >
                      <span>{st}</span>
                      {task.status === st && <IconCheck className="h-4 w-4 text-primary shrink-0" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onEdit && onEdit(task)}
                  className="cursor-pointer text-xs font-medium flex items-center gap-2"
                >
                  <IconEdit className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Edit Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete && onDelete(task)}
                  className="cursor-pointer text-xs font-medium flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                  <span>Delete Entry</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="font-semibold text-sm tracking-tight text-foreground leading-snug break-words">
          {task.title}
        </h3>
        {task.description ? (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        ) : null}
      </div>

      {/* Card Footer: Due Date & Assignee */}
      <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div
          className={`flex items-center gap-1.5 ${
            task.dueDate ? 'text-foreground font-medium' : 'text-muted-foreground/70'
          }`}
        >
          <IconCalendarDue className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
          <span className="truncate max-w-[120px]">{formatDate(task.dueDate)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {assigneesList.length === 1 ? (
            <div
              title={`Assigned to ${assigneesList[0].name || assigneesList[0].email}`}
              className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full border border-border/50 shadow-2xs"
            >
              <Avatar className="h-5 w-5 rounded-full">
                <AvatarFallback className="text-[9px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {getInitials(assigneesList[0].name, assigneesList[0].email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] font-medium text-foreground truncate max-w-[75px] pe-0.5">
                {(assigneesList[0].name || assigneesList[0].email || 'Member').split(' ')[0]}
              </span>
            </div>
          ) : assigneesList.length > 1 ? (
            <div
              title={`Assigned to ${assigneesList.map((m) => m.name || m.email).join(', ')}`}
              className="flex items-center -space-x-1.5 rtl:space-x-reverse overflow-hidden p-0.5 rounded-full bg-muted/30 border border-border/40 px-1.5 shadow-2xs"
            >
              {assigneesList.map((m, idx) => {
                const colors = [
                  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
                  'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
                  'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
                  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
                ];
                const colorClass = colors[idx % colors.length];
                return (
                  <Avatar key={m._id || m.id || idx} className="inline-block h-5 w-5 rounded-full ring-2 ring-background">
                    <AvatarFallback className={`text-[9px] font-bold ${colorClass}`}>
                      {getInitials(m.name, m.email)}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              <span className="text-[10px] font-extrabold text-foreground px-1 ms-0.5">{assigneesList.length}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60 italic" title="Unassigned task">
              <IconUser className="h-3 w-3" />
              <span>Unassigned</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
