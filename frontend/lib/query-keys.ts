import { TaskFilters } from '@/types/task';

/**
 * Query key factory for Projects and Tasks to ensure deterministic cache indexing and type-safe invalidation.
 */

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export const taskKeys = {
  all: ['tasks'] as const,
  project: (projectId: string) => [...taskKeys.all, 'project', projectId] as const,
  lists: (projectId: string) => [...taskKeys.project(projectId), 'list'] as const,
  list: (projectId: string, filters: TaskFilters) => [...taskKeys.lists(projectId), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  auditLog: (id: string) => [...taskKeys.detail(id), 'audit-log'] as const,
};
