import type { NextConfig } from "next";

// Static export for Firebase Hosting (Google) + GitHub Pages.
// Set NEXT_PUBLIC_BASE_PATH=/spindle for project Pages; leave empty for Firebase root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
};

export default nextConfig;
