'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import { useUser } from '@/hooks/use-auth';
import { Project } from '@/types/project';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
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
  IconAlertCircle,
  IconFolderOff,
  IconLoader2,
  IconTrash,
  IconRefresh,
} from '@tabler/icons-react';

// Lazy-load the project creation/edit dialog modal as specified in our performance instructions
const ProjectDialog = dynamic(() => import('@/components/project-dialog').then((m) => m.ProjectDialog), {
  ssr: false,
});

export function ProjectsDashboard() {
  const { data: projects, isLoading, isError, error, refetch } = useProjects();
  const { data: user } = useUser();
  const deleteMutation = useDeleteProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const isAdmin = user?.role === 'Admin';

  // Filter projects locally by name or description
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);

  const handleCreateNew = () => {
    setProjectToEdit(null);
    setDialogOpen(true);
  };

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!projectToDelete) return;
    const targetId = projectToDelete._id || projectToDelete.id || '';
    deleteMutation.mutate(targetId, {
      onSuccess: () => {
        setProjectToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Workspace Projects</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Authoritative directory of active project task boards and assigned teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Role-aware UI: Admin-only New Project trigger */}
          {isAdmin ? (
            <Button onClick={handleCreateNew} className="font-medium px-4 shadow-xs">
              <IconPlus className="me-2 h-4 w-4" />
              <span>New Project</span>
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-muted/60 border border-border">
              <span>Member View</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <IconSearch className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search projects by title or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 h-9.5 text-sm bg-card"
          />
        </div>

        {projects && projects.length > 0 && (
          <span className="text-xs text-muted-foreground font-mono">
            Showing <strong className="text-foreground font-semibold">{filteredProjects.length}</strong> of{' '}
            <strong className="text-foreground font-semibold">{projects.length}</strong> projects
          </span>
        )}
      </div>

      {/* STATE 1: LOADING STATE (Skeleton Shapes) */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-4 border border-border bg-card/60">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-7 w-7 rounded-full -ms-3" />
                  <Skeleton className="h-3 w-16 ms-2" />
                </div>
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* STATE 2: EXPLICIT ERROR STATE (Inline, Specific, Actionable) */}
      {isError && !isLoading && (
        <Card className="p-6 border-destructive/30 bg-destructive/5 text-destructive rounded-lg my-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <IconAlertCircle className="h-6 w-6 shrink-0 mt-0.5 text-destructive" />
              <div>
                <h3 className="text-base font-semibold tracking-tight">Unable to sync project directory</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(error as any)?.message || (error as any)?.response?.data?.message || 'A network or authentication failure occurred while contacting the server.'} Please verify your active network session and attempt to reconnect.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-destructive/40 hover:bg-destructive/10 text-destructive shrink-0"
            >
              <IconRefresh className="me-2 h-4 w-4" />
              <span>Retry Sync</span>
            </Button>
          </div>
        </Card>
      )}

      {/* STATE 3: EXPLICIT EMPTY STATE */}
      {!isLoading && !isError && projects && projects.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/80 bg-card/40 rounded-xl my-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4 shadow-2xs">
            <IconFolderOff className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">No projects yet</h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-md leading-relaxed">
            {isAdmin
              ? 'Your TMS workspace is completely blank. Create your first project to begin assigning team tasks and tracking deadlines.'
              : 'You have not been assigned to any project boards yet. Please contact your Workspace Admin to be added to an active project.'}
          </p>
          {isAdmin && (
            <Button onClick={handleCreateNew} className="mt-6 font-medium px-5 shadow-xs">
              <IconPlus className="me-2 h-4 w-4" />
              <span>Create your first project</span>
            </Button>
          )}
        </Card>
      )}

      {/* STATE 3B: EMPTY SEARCH FILTER RESULT */}
      {!isLoading && !isError && projects && projects.length > 0 && filteredProjects.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-10 text-center border border-border bg-card/50 rounded-lg my-6">
          <p className="text-sm text-muted-foreground">
            No active project records matched your query for <strong className="text-foreground">&quot;{searchQuery}&quot;</strong>.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="mt-3 text-xs text-primary font-semibold hover:underline"
          >
            Clear search filters
          </Button>
        </Card>
      )}

      {/* STATE 4: SUCCESS / CONTENT GRID VIEW */}
      {!isLoading && !isError && filteredProjects && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id || project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={(p) => setProjectToDelete(p)}
              currentUserRole={user?.role}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {/* Lazy-loaded Create/Edit Project Modal */}
      {dialogOpen && (
        <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} projectToEdit={projectToEdit} />
      )}

      {/* Confirmation Dialog for Record Deletion */}
      <Dialog open={!!projectToDelete} onOpenChange={(val) => !val && setProjectToDelete(null)}>
        <DialogContent className="sm:max-w-[420px] p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <IconTrash className="h-5 w-5 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">Destructive Workspace Action</span>
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight">Delete Project Record?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete <strong className="text-foreground font-semibold">&quot;{projectToDelete?.name}&quot;</strong>? This action cannot be reversed and will sever access for all assigned team members.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProjectToDelete(null)}
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
