import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute client stale time
        retry: (failureCount, error: any) => {
          // Do not retry on authentication or authorization failures
          const status = error?.status || error?.response?.status;
          if (status === 401 || status === 403) {
            return false;
          }
          return failureCount < 2;
        },
      },
      dehydrate: {
        // Support dehydrating pending queries for streaming / suspense hydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns a per-request QueryClient instance on the server to prevent data leaks between authenticated users,
 * or a stable singleton QueryClient in the client browser.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always instantiate a fresh QueryClient per request
    return makeQueryClient();
  } else {
    // Browser: reuse existing singleton QueryClient
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
