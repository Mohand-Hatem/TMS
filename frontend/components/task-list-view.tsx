"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Task, TaskFilters, TaskStatus } from "@/types/task";
import { TaskCard } from "@/components/task-card";
import { TaskBoardSkeleton } from "@/components/project-board";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconClipboardOff,
  IconChevronLeft,
  IconChevronRight,
  IconFilterOff,
  IconLoader2,
} from "@tabler/icons-react";

interface TaskListViewProps {
  projectId: string;
  filters: TaskFilters;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  currentUserRole?: string;
  onClearFilters?: () => void;
  onPageChange?: (newPage: number) => void;
}

/**
 * Task List View rendered within a React Suspense Boundary.
 * Displays a three-column board on desktop and collapses into a responsive filterable list on mobile/tablet.
 */
export function TaskListView({
  projectId,
  filters,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserRole,
  onClearFilters,
  onPageChange,
}: TaskListViewProps) {
  const {
    data: response,
    isPending,
    isFetching,
  } = useTasks(projectId, filters);
  const tasks = response?.tasks || [];
  const total = response?.total || tasks.length;
  const page = response?.page || 1;
  const pages = response?.pages || 1;

  if (isPending && !response) {
    return <TaskBoardSkeleton />;
  }

  // Mobile tab selector for smaller screens
  const [mobileTab, setMobileTab] = useState<"All" | TaskStatus>("All");

  const columns: { title: string; status: TaskStatus }[] = [
    { title: "To Do", status: "To Do" },
    { title: "In Progress", status: "In Progress" },
    { title: "Done", status: "Done" },
  ];

  const hasActiveFilters = Boolean(
    filters.status ||
    filters.priority ||
    filters.assignee ||
    (filters.search && filters.search.trim() !== ""),
  );

  // Filter tasks by status for columns
  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      "To Do": [],
      "In Progress": [],
      Done: [],
    };
    tasks.forEach((t) => {
      const st = (t.status as TaskStatus) || "To Do";
      if (map[st]) map[st].push(t);
      else map["To Do"].push(t);
    });
    return map;
  }, [tasks]);

  const displayedMobileTasks = useMemo(() => {
    if (mobileTab === "All") return tasks;
    return tasksByStatus[mobileTab] || [];
  }, [tasks, mobileTab, tasksByStatus]);

  // EMPTY STATE
  if (tasks.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/80 bg-card/40 rounded-xl my-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3.5 shadow-2xs">
          {hasActiveFilters ? (
            <IconFilterOff className="h-6 w-6" />
          ) : (
            <IconClipboardOff className="h-6 w-6" />
          )}
        </div>
        <h3 className="text-base font-bold tracking-tight text-foreground">
          {hasActiveFilters
            ? "No tasks matched your filter criteria"
            : "No tasks on this project board yet"}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
          {hasActiveFilters
            ? "Adjust or reset your active filters above to view remaining registered tasks in this workspace."
            : "This project has no task lines recorded. Register a task above to begin tracking team deliverables."}
        </p>
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="mt-5 text-xs font-medium"
          >
            Reset All Filters
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div
      className={`space-y-6 relative ${isFetching ? "opacity-85 transition-opacity duration-200" : "transition-opacity duration-200"}`}
    >
      {isFetching && (
        <div className="absolute -top-3 inset-e-0 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse z-20 flex items-center gap-1.5">
          <IconLoader2 className="h-3 w-3 animate-spin" />
          <span>Syncing board...</span>
        </div>
      )}

      {/* MOBILE VIEW SELECTOR (Visible only on < lg screens) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:hidden border-b border-border">
        {(["All", "To Do", "In Progress", "Done"] as const).map((tab) => {
          const count =
            tab === "All" ? tasks.length : tasksByStatus[tab]?.length || 0;
          const isActive = mobileTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MOBILE LIST VIEW (< lg screens) */}
      <div className="space-y-3 lg:hidden">
        {displayedMobileTasks.map((task) => (
          <TaskCard
            key={task._id || task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            currentUserRole={currentUserRole}
          />
        ))}
        {displayedMobileTasks.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8 italic">
            No tasks in the &quot;{mobileTab}&quot; column.
          </p>
        )}
      </div>

      {/* DESKTOP 3-COLUMN BOARD VIEW (>= lg screens) */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
        {columns.map((col) => {
          const colTasks = tasksByStatus[col.status] || [];
          return (
            <div
              key={col.status}
              className="flex flex-col rounded-xl border border-border/80 bg-muted/20 p-3 min-h-125"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-border/60 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-sm text-foreground">
                    {col.title}
                  </span>
                </div>
                <span className="flex h-5 items-center justify-center rounded-full bg-card px-2 text-[11px] font-mono font-bold text-muted-foreground border border-border/70 shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3.5 flex-1">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task._id || task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    currentUserRole={currentUserRole}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/20 p-4 text-center">
                    <span className="text-xs text-muted-foreground/60 italic font-mono">
                      No active tasks in this status
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION CONTROLS (Rendered when response contains multiple pages) */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
          <span className="font-mono">
            Showing page{" "}
            <strong className="text-foreground font-semibold">{page}</strong> of{" "}
            <strong className="text-foreground font-semibold">{pages}</strong> (
            {total} total tasks)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 px-3 text-xs"
            >
              <IconChevronLeft className="h-4 w-4 me-1" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= pages}
              className="h-8 px-3 text-xs"
            >
              <span>Next</span>
              <IconChevronRight className="h-4 w-4 ms-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
