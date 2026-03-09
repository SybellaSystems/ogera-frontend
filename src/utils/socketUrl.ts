/** Socket.io server URL (same origin as API, no path). */
export function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && typeof apiUrl === "string") {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return window.location.origin;
    }
  }
  return window.location.origin;
}
