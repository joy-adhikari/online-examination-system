import type { NextConfig } from "next";

/**
 * The app is frontend-only (data lives in the browser), so it can be deployed:
 *  - as a normal Next.js app (Vercel, Netlify, any Node host):  npm run build
 *  - as plain static files (GitHub Pages, Netlify drop, S3):     STATIC_EXPORT=true npx next build  -> ./out
 *    For a sub-path such as https://user.github.io/repo also set NEXT_PUBLIC_BASE_PATH=/repo
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        ...(basePath ? { basePath, assetPrefix: basePath } : {}),
      }
    : {}),
};

export default nextConfig;
