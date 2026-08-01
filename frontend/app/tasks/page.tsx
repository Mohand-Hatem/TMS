'use client';

import { useProjects } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import { useUser } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { IconClipboardList, IconArrowUpRight, IconFolder } from '@tabler/icons-react';

function ProjectTaskSection({ project }: { project: any }) {
  const pId = project._id || project.id || '';
  const { data: tasksResponse, isLoading: isTasksLoading } = useTasks(pId);
  const tasks = tasksResponse?.tasks || [];
  const total = tasksResponse?.total ?? tasks.length;

  return (
    <Card className="p-6 border border-border bg-card rounded-xl shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <IconFolder className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-bold text-foreground truncate">{project.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 ms-10">
            {project.description || 'No objective specification documented for this board.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ms-10 sm:ms-0">
          <Badge variant="outline" className="text-[11px] font-mono font-semibold">
            {total} {total === 1 ? 'Task' : 'Tasks'} Registered
          </Badge>
          <Link href={`/projects/${pId}`}>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs font-medium">
              <span>Open Board</span>
              <IconArrowUpRight className="ms-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {isTasksLoading ? (
        <div className="space-y-3 pt-1">
          <Skeleton className="h-12 rounded-lg w-full" />
          <Skeleton className="h-12 rounded-lg w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-6 text-center bg-muted/20 rounded-lg border border-dashed border-border/60">
          <p className="text-xs text-muted-foreground font-mono">No tasks recorded on this project board yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/40 bg-background/50 rounded-lg border border-border/60 overflow-hidden">
          {tasks.map((task) => (
            <div key={task.id || (task as any)._id} className="p-3.5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1 max-w-xl">
                <div className="font-semibold text-sm text-foreground flex items-center gap-2 flex-wrap">
                  <span>{task.title}</span>
                  {task.priority && (
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                      task.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' :
                      task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' :
                      'bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider select-none ${
                  task.status === 'Done' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                  task.status === 'In Progress' ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' :
                  'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                }`}>
                  {task.status || 'To Do'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function TasksPage() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: user } = useUser();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl w-full" />
          <Skeleton className="h-48 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <IconClipboardList className="h-7 w-7 text-primary" />
            <span>My Task Queue</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centralized register of deliverables across your authorized workspace project boards.
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1 font-mono self-start sm:self-auto bg-muted/40">
          Contributor: {user?.name || 'Authorized Session'}
        </Badge>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/80 bg-card/40 rounded-xl my-4">
          <IconClipboardList className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-bold tracking-tight text-foreground">No active task queues assigned</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            You are not currently enrolled in any workspace project boards. Join or create a project to inspect your task queue.
          </p>
          <Link href="/projects" className="mt-5 inline-block">
            <Button size="sm" className="text-xs font-medium">Open Projects Directory</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Project Deliverables ({projects.length})
          </h2>
          <div className="space-y-6">
            {projects.map((proj) => (
              <ProjectTaskSection key={proj._id || proj.id || Math.random()} project={proj} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
