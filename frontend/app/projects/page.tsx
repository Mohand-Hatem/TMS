import { getQueryClient } from '@/lib/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { projectKeys } from '@/lib/query-keys';
import { serverFetch } from '@/lib/server-fetch';
import { Project } from '@/types/project';
import { ProjectsDashboard } from '@/components/projects-dashboard';

/**
 * Server Component for Projects List Page (/projects).
 *
 * KEY DECISION & RENDERING STRATEGY:
 * This private authenticated dashboard utilizes Server-Side Rendering (SSR) with TanStack Query Cache Hydration.
 * We invoke `serverFetch('/projects')` which extracts incoming httpOnly cookies via `await cookies()` and manually
 * forwards them to the REST backend. The prefetched data is dehydrated into `<HydrationBoundary>`, ensuring zero
 * loading flash on initial page load while handing off clean interactive state management to client components.
 * Per requirements, SSG and ISR are strictly disabled to prevent CDN/build caching of authenticated user data.
 */
export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: projectKeys.list(),
      queryFn: () => serverFetch<Project[]>('/projects'),
    });
  } catch (error) {
    // If server-side fetch fails (e.g., expired cookie or network latency), we do not terminate SSR.
    // Dehydrated cache handles error transfer cleanly so client components render actionable Error UI.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectsDashboard />
    </HydrationBoundary>
  );
}
