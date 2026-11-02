import { isServer, QueryClient } from "@tanstack/react-query";

// Shared by QueryProvider and QueryPrefetch, so the staleTime is defined once.
// staleTime is not optional: at 0, every query a Server Component prefetched
// refetches the moment it mounts, wasting the prefetch.
export const makeQueryClient = () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

let browserClient: QueryClient | undefined;

// A fresh client per server request (users never share a cache); one long-lived client in the browser.
export const getQueryClient = () => (isServer ? makeQueryClient() : (browserClient ??= makeQueryClient()));
