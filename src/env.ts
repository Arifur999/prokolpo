import "server-only";
import { z } from "@/lib/zod";

const schema = z.object({
  API_BASE_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "silent"]).optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

// Validated on first use, not at import: `next build` (and the Docker build) runs
// without runtime env, and loading a route module must not crash it.
// instrumentation.ts calls this at server start, so a missing variable still fails the boot,
// not the first request. Dev gets a localhost default; production gets no default on purpose.
export const getEnv = (): Env => {
  cached ??= schema.parse({
    API_BASE_URL: process.env.API_BASE_URL ?? (process.env.NODE_ENV === "production" ? undefined : "http://localhost:5000/api/v1"),
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });
  return cached;
};
