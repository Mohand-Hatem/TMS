'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useProject } from '@/hooks/use-projects';
import { useUpdateTask, useDeleteTask } from '@/hooks/use-tasks';
import { useUser } from '@/hooks/use-auth';
import { Task, TaskFilters, TaskStatus, TaskPriority } from '@/types/task';
import { ProjectMember } from '@/types/project';
import { TaskListView } from '@/components/task-list-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  IconPlus,
  IconSearch,
  IconUsers,
  IconLoader2,
  IconTrash,
  IconArrowLeft,
  IconFilterOff,
  IconFilter,
  IconShieldCheck,
} from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Lazy-load non-critical dialog and side drawer as per performance requirements
const TaskDialog = dynamic(() => import('@/components/task-dialog').then((m) => m.TaskDialog), { ssr: false });
const MembersSheet = dynamic(() => import('@/components/members-sheet').then((m) => m.MembersSheet), { ssr: false });

interface ProjectBoardProps {
  projectId: string;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProject(projectId);
  const { data: user } = useUser();
  const updateMutation = useUpdateTask(projectId);
  const deleteMutation = useDeleteTask(projectId);

  // State for modals and dialogs
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [membersSheetOpen, setMembersSheetOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Read current filters directly from URL searchParams (Single source of truth)
  const filters: TaskFilters = useMemo(() => {
    return {
      status: (searchParams.get('status') as TaskStatus) || undefined,
      priority: (searchParams.get('priority') as TaskPriority) || undefined,
      assignee: searchParams.get('assignee') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    };
  }, [searchParams]);

  const updateURLFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim() !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // If filter changes, reset to page 1
    if (key !== 'page') {
      params.delete('page');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Local reactive search state to prevent asynchronous URL racing & Suspense lag while typing
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const isFirstRender = useRef(true);

  // Debounce pushing searchTerm to URL parameters
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      updateURLFilter('search', searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleClearFilters = () => {
    setSearchTerm('');
    router.replace(pathname, { scroll: false });
  };

  const handleCreateNewTask = () => {
    setTaskToEdit(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskDialogOpen(true);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateMutation.mutate({ taskId, status: newStatus });
  };

  const handleDeleteConfirm = () => {
    if (!taskToDelete) return;
    const targetId = taskToDelete._id || taskToDelete.id || '';
    deleteMutation.mutate(targetId, {
      onSuccess: () => {
        setTaskToDelete(null);
      },
    });
  };

  const getInitials = (name?: string, email?: string) => {
    const source = name || email || 'M';
    return source
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = user?.role === 'Admin';
  const ownerObj = project && typeof project.owner === 'object' ? (project.owner as ProjectMember) : null;
  const ownerId = ownerObj?._id || ownerObj?.id || (project && typeof project.owner === 'string' ? project.owner : '');
  const isOwner = user?.id && ownerId && user.id === ownerId;
  const canManageMembers = isAdmin || isOwner;

  const membersList = project ? (project.members || []).map((m) =>
    typeof m === 'object' ? (m as ProjectMember) : { _id: m as string, name: 'Member', email: '' }
  ) : [];

  if (isProjectLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <Card className="p-8 text-center border-destructive/30 bg-destructive/5 text-destructive rounded-xl my-6">
        <h2 className="text-lg font-bold">Project Not Found or Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          The requested project record could not be retrieved. It may have been deleted, or your session may not be authorized to view this workspace.
        </p>
        <Link href="/projects">
          <Button variant="outline" className="mt-5 border-destructive/30 text-destructive hover:bg-destructive/10">
            <IconArrowLeft className="me-2 h-4 w-4" />
            <span>Return to Projects Dashboard</span>
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="h-3.5 w-3.5" />
          <span>Workspace Directory</span>
        </Link>
      </div>

      {/* PROJECT HEADER & TEAM ACCESS BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-border pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border">
              <IconShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Lead: {ownerObj?.name || 'Workspace Admin'}</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description || 'No detailed technical objectives registered for this workspace project.'}
          </p>
        </div>

        {/* Actions & Roster Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {canManageMembers ? (
            <Button
              variant="outline"
              onClick={() => setMembersSheetOpen(true)}
              className="font-medium text-xs h-9 px-3 border-border bg-card hover:bg-muted shadow-2xs"
            >
              <IconUsers className="me-1.5 h-4 w-4 text-muted-foreground" />
              <span>Team Roster ({membersList.length})</span>
            </Button>
          ) : (
            <div
              title="Authorized contributors"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-medium text-muted-foreground"
            >
              <IconUsers className="h-4 w-4" />
              <span>{membersList.length} Team Members</span>
            </div>
          )}

          <Button onClick={handleCreateNewTask} className="font-medium text-xs h-9 px-4 shadow-xs">
            <IconPlus className="me-1.5 h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* ENTERPRISE FILTER & SEARCH TOOLBAR */}
      <Card className="p-4 bg-gradient-to-r from-card/90 via-card/70 to-card/90 border border-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground me-1">
            <IconFilter className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          {/* Status Shadcn Select */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(val) => updateURLFilter('status', val === 'all' ? undefined : (val as string))}
          >
            <SelectTrigger className="h-9 min-w-[140px] bg-background/80 hover:bg-background border-border font-medium text-xs rounded-lg shadow-2xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false} className="min-w-[150px]">
              <SelectItem value="all" className="text-xs font-medium">All Statuses</SelectItem>
              <SelectItem value="To Do" className="text-xs font-medium">To Do</SelectItem>
              <SelectItem value="In Progress" className="text-xs font-medium">In Progress</SelectItem>
              <SelectItem value="Done" className="text-xs font-medium">Done</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Shadcn Select */}
          <Select
            value={filters.priority || 'all'}
            onValueChange={(val) => updateURLFilter('priority', val === 'all' ? undefined : (val as string))}
          >
            <SelectTrigger className="h-9 min-w-[140px] bg-background/80 hover:bg-background border-border font-medium text-xs rounded-lg shadow-2xs">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false} className="min-w-[150px]">
              <SelectItem value="all" className="text-xs font-medium">All Priorities</SelectItem>
              <SelectItem value="Low" className="text-xs font-medium">Low Priority</SelectItem>
              <SelectItem value="Medium" className="text-xs font-medium">Medium Priority</SelectItem>
              <SelectItem value="High" className="text-xs font-medium">High Priority</SelectItem>
            </SelectContent>
          </Select>

          {/* Assignee Shadcn Select */}
          <Select
            value={filters.assignee || 'all'}
            onValueChange={(val) => updateURLFilter('assignee', val === 'all' ? undefined : (val as string))}
          >
            <SelectTrigger className="h-9 min-w-[160px] max-w-[200px] bg-background/80 hover:bg-background border-border font-medium text-xs rounded-lg shadow-2xs truncate">
              <SelectValue placeholder="All Teammates" />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false} className="min-w-[180px]">
              <SelectItem value="all" className="text-xs font-medium">All Teammates</SelectItem>
              {membersList.map((m) => {
                const memId = m._id || m.id || '';
                if (!memId) return null;
                return (
                  <SelectItem key={memId} value={memId} className="text-xs font-medium">
                    {m.name || m.email || 'Member'}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Reset Filters button if any active */}
          {(filters.status || filters.priority || filters.assignee || filters.search) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              title="Clear active filter criteria"
              className="h-9 px-3 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive flex items-center gap-1.5 shadow-2xs ms-1"
            >
              <IconFilterOff className="h-4 w-4" />
              <span>Reset Filters</span>
            </Button>
          )}
        </div>

        {/* Search Input with Local Debounce */}
        <div className="relative w-full md:w-72 shrink-0">
          <IconSearch className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-9 h-9 text-xs bg-background/80 focus:bg-background border-border rounded-lg shadow-2xs"
          />
        </div>
      </Card>

      {/* REACT SUSPENSE BOUNDARY FOR TASK STREAMING */}
      <Suspense fallback={<TaskBoardSkeleton />}>
        <TaskListView
          projectId={projectId}
          filters={filters}
          onEdit={handleEditTask}
          onDelete={(t) => setTaskToDelete(t)}
          onStatusChange={handleStatusChange}
          currentUserRole={user?.role}
          onClearFilters={handleClearFilters}
          onPageChange={(newPage) => updateURLFilter('page', newPage.toString())}
        />
      </Suspense>

      {/* Lazy-Loaded Task Dialog Modal */}
      {taskDialogOpen && (
        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          projectId={projectId}
          taskToEdit={taskToEdit}
          projectMembers={membersList}
        />
      )}

      {/* Lazy-Loaded Admin Members Management Drawer */}
      {membersSheetOpen && (
        <MembersSheet
          open={membersSheetOpen}
          onOpenChange={setMembersSheetOpen}
          project={project}
          currentUserId={user?.id}
        />
      )}

      {/* Confirmation Modal for Task Deletion */}
      <Dialog open={!!taskToDelete} onOpenChange={(val) => !val && setTaskToDelete(null)}>
        <DialogContent className="sm:max-w-[420px] p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <IconTrash className="h-5 w-5 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">Destructive Project Action</span>
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight">Delete Task Record?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to permanently remove <strong className="text-foreground font-semibold">&quot;{taskToDelete?.title}&quot;</strong>? This record will be erased from the project board and audit logs.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTaskToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium"
            >
              {deleteMutation.isPending ? (
                <>
                  <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Confirm Deletion'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Skeleton fallback rendered inside React Suspense while task board streams or hydrates.
 */
export function TaskBoardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-1">
      {Array.from({ length: 3 }).map((_, colIdx) => (
        <div key={colIdx} className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-4 min-h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-7 rounded-full" />
          </div>
          <div className="space-y-3.5">
            <Card className="p-4 space-y-3 bg-card/70 border-border">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
              <div className="pt-2 flex justify-between items-center border-t border-border/50">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </Card>
            <Card className="p-4 space-y-3 bg-card/70 border-border">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="pt-2 flex justify-between items-center border-t border-border/50">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}
