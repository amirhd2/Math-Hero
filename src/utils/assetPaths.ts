/**
 * Safe asset path resolution utility.
 * Handles relative base ('./'), root base ('/'), and sub-path deployments,
 * ensuring assets resolve correctly in standard browsers, standalone Web Apps (PWA),
 * and iOS/WebKit environments.
 */

export function getAssetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const rawBase = import.meta.env.BASE_URL || './';
  
  if (rawBase === './' || rawBase === '') {
    return `./${cleanPath}`;
  }
  
  const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${normalizedBase}${cleanPath}`;
}

export function getFallbackAssetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${cleanPath}`;
}
