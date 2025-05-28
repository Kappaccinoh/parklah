const repo = 'parklah';
// Always use the repo path for static assets since we're deploying to GitHub Pages
const isProd = true; // Force production mode for GitHub Pages

/** @type {import('next').NextConfig} */
const nextConfig = {
  // produce a pure static export
  output: 'export',

  // when serving from GitHub Pages
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  
  // ensure folders instead of .html files (helps in some cases)
  trailingSlash: true,
  
  // Add public runtime config for base path
  publicRuntimeConfig: {
    basePath: `/${repo}`,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
