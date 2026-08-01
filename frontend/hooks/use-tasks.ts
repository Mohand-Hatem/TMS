'use client';

import { useQuery, useSuspenseQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  Task,
  TaskFilters,
  TaskPaginatedResponse,
  CreateTaskInput,
  UpdateTaskInput,
  TaskAuditLog,
} from '@/types/task';
import { taskKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

/**
 * Hook to query tasks for a project with filter-aware cache key indexing.
 * 
 * ASSUMPTION FLAG & KEY DECISION:
 * In the backend (`task.controller.js`), GET /api/projects/:projectId/tasks returns a paginated wrapper object:
 * `{ tasks: [...], total, page, pages }`, rather than a bare array. This hook explicitly types and preserves
 * the paginated structure so dashboards can render total task counts and paging controls.
 */
export function useTasks(projectId: string, filters: TaskFilters = {}) {
  // Clean empty or undefined filters before making query key and HTTP params
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
  ) as TaskFilters;

  return useQuery<TaskPaginatedResponse>({
    queryKey: taskKeys.list(projectId, activeFilters),
    queryFn: async () => {
      const response = await api.get<TaskPaginatedResponse>(`/projects/${projectId}/tasks`, {
        params: activeFilters,
      });
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Suspense-backed hook for Task List rendering to ensure instant page shell display while data hydrates or streams.
 * Notice: TanStack Query v5 useSuspenseQuery does not accept an 'enabled' option since suspending is unconditional.
 */
export function useSuspenseTasks(projectId: string, filters: TaskFilters = {}) {
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
  ) as TaskFilters;

  return useSuspenseQuery<TaskPaginatedResponse>({
    queryKey: taskKeys.list(projectId, activeFilters),
    queryFn: async () => {
      const response = await api.get<TaskPaginatedResponse>(`/projects/${projectId}/tasks`, {
        params: activeFilters,
      });
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Mutation hook to create a new task under a specific project.
 */
export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput): Promise<Task> => {
      const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all list variations under this project regardless of current active filters
      queryClient.invalidateQueries({ queryKey: taskKeys.lists(projectId) });
      toast.success('Task created successfully!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to create task';
      toast.error(msg);
    },
  });
}

/**
 * Mutation hook to update an existing task (fields or status transitions).
 * Notice: The backend mounts PUT /api/tasks/:id directly without requiring :projectId in the URL path.
 */
export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, ...data }: UpdateTaskInput): Promise<Task> => {
      const response = await api.put<Task>(`/tasks/${taskId}`, data);
      return response.data;
    },
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists(projectId) });
      queryClient.setQueryData(taskKeys.detail(taskId), updatedTask);
      queryClient.invalidateQueries({ queryKey: taskKeys.auditLog(taskId) });
      toast.success('Task updated successfully.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update task';
      toast.error(msg);
    },
  });
}

/**
 * Mutation hook to delete a task.
 */
export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists(projectId) });
      queryClient.removeQueries({ queryKey: taskKeys.detail(deletedId) });
      toast.success('Task removed.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete task';
      toast.error(msg);
    },
  });
}

/**
 * Hook to query the status transition Audit Log for a specific task.
 */
export function useTaskAuditLog(taskId: string, enabled = false) {
  return useQuery<TaskAuditLog[]>({
    queryKey: taskKeys.auditLog(taskId),
    queryFn: async () => {
      const response = await api.get<TaskAuditLog[]>(`/tasks/${taskId}/audit-log`);
      return response.data;
    },
    enabled: !!taskId && enabled,
  });
}
