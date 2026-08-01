import { getQueryClient } from '@/lib/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { projectKeys, taskKeys } from '@/lib/query-keys';
import { serverFetch } from '@/lib/server-fetch';
import { Project } from '@/types/project';
import { TaskPaginatedResponse, TaskFilters } from '@/types/task';
import { ProjectBoard } from '@/components/project-board';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Server Component for Project Detail & Task Board (/projects/[id]).
 *
 * KEY DECISION & RENDERING STRATEGY:
 * We asynchronously await incoming `params` and `searchParams` (Next.js 16 requirement) and prefetch two
 * critical datasets via cookie-injected `serverFetch`:
 * 1) Project Record details from `/projects` (resolving cache key `projectKeys.detail(id)`).
 * 2) Filter-aware paginated Tasks from `/projects/${id}/tasks`, passing active URL searchParams directly to the API.
 * 
 * Both queries are dehydrated into `<HydrationBoundary>`, allowing client components (`useSuspenseTasks`)
 * to instantly render without loading spinners on initial page arrival, while maintaining URL shareability.
 */
export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const projectId = resolvedParams.id;

  const queryClient = getQueryClient();

  // Extract valid filter criteria from searchParams
  const filters: TaskFilters = {
    status: typeof resolvedSearchParams.status === 'string' ? (resolvedSearchParams.status as any) : undefined,
    priority: typeof resolvedSearchParams.priority === 'string' ? (resolvedSearchParams.priority as any) : undefined,
    assignee: typeof resolvedSearchParams.assignee === 'string' ? resolvedSearchParams.assignee : undefined,
    search: typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined,
    page: typeof resolvedSearchParams.page === 'string' ? Number(resolvedSearchParams.page) : undefined,
  };

  // Clean undefined keys for exact cache indexing
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== null && !isNaN(Number(v)))
  ) as TaskFilters;

  try {
    // 1. Prefetch Project Details
    await queryClient.prefetchQuery({
      queryKey: projectKeys.detail(projectId),
      queryFn: async () => {
        const projects = await serverFetch<Project[]>('/projects');
        return projects.find((p) => p._id === projectId || p.id === projectId) || null;
      },
    });

    // 2. Prefetch Paginated Task Board matching active URL filters
    await queryClient.prefetchQuery({
      queryKey: taskKeys.list(projectId, activeFilters),
      queryFn: () =>
        serverFetch<TaskPaginatedResponse>(`/projects/${projectId}/tasks`, {
          params: activeFilters as Record<string, string | number>,
        }),
    });
  } catch (error) {
    // Server fetch exceptions (e.g., token expired or offline API) default cleanly to client fallback error boundaries
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectBoard projectId={projectId} />
    </HydrationBoundary>
  );
}
