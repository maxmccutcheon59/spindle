import type { NextConfig } from "next";

// Default: server mode (AI /api/agent works on Vercel / next start).
// Firebase static: SPINDLE_STATIC=1 npm run build
const staticExport = process.env.SPINDLE_STATIC === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(staticExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
      }
    : {}),
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
};

export default nextConfig;
