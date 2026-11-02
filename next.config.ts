import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // .next/standalone: a minimal server.js plus only the traced node_modules. The Dockerfile ships that.
  output: "standalone",
  // No "X-Powered-By: Next.js".
  poweredByHeader: false,
};

export default nextConfig;
