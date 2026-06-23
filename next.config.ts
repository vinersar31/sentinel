import type { NextConfig } from "next";

// Project is deployed to GitHub Pages as a project site:
//   https://vinersar31.github.io/sentinel
// so production assets must be served under the /sentinel base path.
// In development (next dev) the base path is empty so everything works at
// http://localhost:3000.
const basePath = process.env.NODE_ENV === "production" ? "/sentinel" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // Exposed to the browser so client-side fetch() calls and <img> tags can
  // prefix static asset / data URLs with the base path (Next does not rewrite
  // string URLs inside your own code).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
