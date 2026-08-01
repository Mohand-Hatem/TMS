import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tms-back-end.vercel.app/api';

export interface ServerFetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ServerFetchError extends Error {
  status: number;
  data?: any;
}

export function createServerFetchError(message: string, status: number, data?: any): ServerFetchError {
  const error = new Error(message) as ServerFetchError;
  error.name = 'ServerFetchError';
  error.status = status;
  error.data = data;
  return error;
}

/**
 * Reusable server-side fetch helper for Next.js 16 Server Components and Route Handlers.
 * Manually extracts incoming httpOnly cookies using asynchronous await cookies() and attaches
 * them as a Cookie header on server-to-backend fetch requests.
 */
export async function serverFetch<T = any>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<T> {
  // In Next.js 16, cookies() is asynchronous and must be awaited
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  const headers = new Headers(options.headers);
  if (cookieString) {
    headers.set('Cookie', cookieString);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (options.params) {
    const urlObj = new URL(url);
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        urlObj.searchParams.append(key, String(val));
      }
    });
    url = urlObj.toString();
  }

  const res = await fetch(url, {
    ...options,
    headers,
    // By default, no SSG or ISR caching for private authenticated dashboard views
    cache: options.cache || 'no-store',
  });

  if (!res.ok) {
    let errorMessage = `Server-side fetch failed with status ${res.status}`;
    let errorData: any;
    try {
      errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // ignore JSON parse errors on failure responses
    }
    throw createServerFetchError(errorMessage, res.status, errorData);
  }

  // Check if response has empty body (e.g. 204 No Content)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return {} as T;
  }

  return res.json() as Promise<T>;
}
