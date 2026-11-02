import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // .next/standalone: a minimal server.js plus only the traced node_modules. The Dockerfile ships that.
  output: "standalone",
  // No "X-Powered-By: Next.js".
  poweredByHeader: false,
  // Memo photos (up to 5MB) travel through a server action on their way to the API.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default withNextIntl(nextConfig);
