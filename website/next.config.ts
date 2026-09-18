import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // GitHub Pages project site: https://maxmccutcheon59.github.io/spindle/
  basePath: isProd ? "/spindle" : "",
  assetPrefix: isProd ? "/spindle/" : undefined,
  trailingSlash: true,
};

export default nextConfig;
