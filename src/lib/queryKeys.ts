// TanStack Query key factory. Keys are built here, never inline, so a mutation's
// invalidation cannot drift from the key its list was fetched under.
//   all          -> everything in the domain (what mutations invalidate)
//   list(qs)     -> one filtered/paginated list
//   detail(id)   -> one record
const createDomainKeys = <TDomain extends string>(domain: TDomain) => ({
  all: [domain] as const,
  lists: () => [domain, "list"] as const,
  list: (queryString = "") => [domain, "list", queryString] as const,
  detail: (id: string) => [domain, "detail", id] as const,
});

export const queryKeys = {
  // products: createDomainKeys("products"),
} as const;

export { createDomainKeys };
