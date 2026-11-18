import "server-only";
import { z } from "@/lib/zod";

const schema = z.object({
  API_BASE_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "silent"]).optional(),
  // Session cookies are Secure in production. "false" lets a production build be tried over
  // plain http on a local network (http://192.168.x.x), where browsers drop Secure cookies.
  COOKIE_SECURE: z.enum(["true", "false"]).optional(),
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
    COOKIE_SECURE: process.env.COOKIE_SECURE,
  });
  return cached;
};

export const cookiesAreSecure = () => {
  const { COOKIE_SECURE, NODE_ENV } = getEnv();
  return COOKIE_SECURE ? COOKIE_SECURE === "true" : NODE_ENV === "production";
};
