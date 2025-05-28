/**
 * Utility for handling path prefixing for GitHub Pages deployment
 */

// Gets the base path for assets based on the environment
export function getBasePath(): string {
  // Use the public runtime config or default to the repository name for GitHub Pages
  return '/parklah';
}

// Prepends the base path to an asset URL if it starts with a slash
export function withBasePath(url: string): string {
  if (url.startsWith('/')) {
    return `${getBasePath()}${url}`;
  }
  return url;
}
