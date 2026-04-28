const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (configuredApiBase) {
    return `${configuredApiBase.replace(/\/$/, "")}${normalizedPath}`;
  }
  return normalizedPath;
}
