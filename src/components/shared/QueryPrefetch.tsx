import { dehydrate, HydrationBoundary, type QueryClient } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/queryClient";

interface QueryPrefetchProps {
  // e.g. (client) => client.prefetchQuery(productsListQuery(queryString)): the same
  // queryOptions the client components below pass to useQuery.
  prefetch: (client: QueryClient) => Promise<unknown>;
  children: React.ReactNode;
}

// Server Component: prefetch on the server, hydrate the client cache, so client tables
// render with data on first paint instead of a spinner.
const QueryPrefetch = async ({ prefetch, children }: QueryPrefetchProps) => {
  const client = makeQueryClient();
  await prefetch(client);
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
};

export default QueryPrefetch;
