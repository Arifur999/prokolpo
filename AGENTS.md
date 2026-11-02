<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- `next dev` writes its own "This is NOT the Next.js you know" block at the top of this file.
     Leave it there and commit it. Read node_modules/next/dist/docs/ before using an API you are unsure of. -->

## Commands

```bash
pnpm dev          # http://localhost:3000, needs the API running
pnpm lint         # also enforces no-console and the zod import rule
pnpm typecheck    # tsc --noEmit, test files included
pnpm test         # vitest, pure logic only
pnpm build        # standalone output
```

CI runs `lint -> typecheck -> test -> build`, then builds the Docker image.

## Project rules

- **Layering is `component -> _action.ts -> service -> httpClient`.** A component never imports `httpClient` or axios. The browser never sees the API URL or a token.
- `"use server"` on every `services/*.services.ts` and every `_action.ts`. Exception: `services/auth.services.ts` returns raw tokens, so it is `import "server-only"` instead (every export of a "use server" file is a client-callable endpoint).
- **Actions never throw.** They are one-liners over `runAction` / `runValidatedAction` / `requireId` (`src/lib/runAction.ts`) and resolve to `{ success, message, data }`. Components never try/catch.
- **Server Component prefetches, Client Component consumes.** `page.tsx` wraps the client table in `QueryPrefetch` with the same `queryOptions` the client uses.
- **Query keys come from `src/lib/queryKeys.ts`, never inline arrays.** One `queryOptions` per call in `src/queries/<feature>.queries.ts`.
- **Mutations go through `useActionMutation`.** Sequence: toast, invalidate the touched keys (refetches what is on screen), `router.refresh()`, then the caller closes the dialog and resets the form.
- **Two zod schemas per entity** in `src/zod/<feature>.validation.ts`: `<entity>FormZodSchema` (strings, for `form.Field`) and `<entity>ServerZodSchema` (`.transform()` into the API payload, re-run in the action). Every server schema has a `.test.ts`.
- Forms use **TanStack Form** (`@tanstack/react-form`) with the shared `App*Field` components. Not react-hook-form.
- `app/` holds only `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `_action.ts` (plus `route.ts` for file responses). Feature code lives in `src/components/modules/<Domain>/<Feature>/`.
- **Route protection is `src/proxy.ts`** (Next 16's name for middleware) reading the table in `src/lib/authUtils.ts`. Token refresh happens only in proxy, because Server Components cannot set cookies. Wrong role goes to its default dashboard, never a 403 page. `?redirect=` goes through `safeRedirect` (open-redirect guard).
- **An API outage is not a logout.** `getUserInfo()` returns `null` only on 401/403 and throws otherwise, so an outage shows the error page instead of bouncing everyone to a login form that needs the same API.
- **Never `console.*`, never log a raw error** (lint-enforced). Use `@/lib/logger` and `logServiceError`. An axios error carries `config.headers`, which hold the Bearer token and forwarded cookies.
- **Import zod from `@/lib/zod`** (lint-enforced).
- **Env comes from `getEnv()` in `src/env.ts`**, never `process.env` in feature code. No `NEXT_PUBLIC_` for anything secret or for the API base URL.
- shadcn primitives in `src/components/ui/` are generated (`pnpm dlx shadcn@latest add <name>`), never hand-written.
- Tailwind v4: no `tailwind.config.js`; tokens live in `@theme inline` in `globals.css`. No hex in components; use tokens (`bg-primary`, `text-muted-foreground`, brand tokens).
- **A grid or flex item holding a wide table needs `min-w-0`.** Without it the item refuses to shrink and the whole page scrolls sideways on a phone (travelar's Reports page ended up 61px wider than a 390px screen).
- **The server's table query string must match the browser's `searchParams.toString()` byte for byte.** It is the query key on both sides; any difference silently drops the prefetch.

## Adding a feature

1. `types/<feature>.types.ts`
2. `zod/<feature>.validation.ts` + `.test.ts`
3. `services/<feature>.services.ts`
4. `queries/<feature>.queries.ts` (+ a domain in `lib/queryKeys.ts`)
5. `app/(dashboardLayout)/<route>/_action.ts`
6. `components/modules/<Domain>/<Feature>/`: columns, table config, table, form hook, form, dialogs
7. `page.tsx` + `loading.tsx`; add the route to the nav and to the route table if it is role-restricted
