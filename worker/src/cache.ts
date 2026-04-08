const CACHE_NAME = "madrasa-proxy-v1";
const LESSON_TTL = 60 * 60; // 1 hour in seconds

/** Returns true for URLs that should be cached (lesson/course pages, not auth). */
export function isCacheable(url: URL, method: string): boolean {
  if (method !== "GET") return false;
  const path = url.pathname;
  // Never cache login, registration, or API mutation endpoints
  if (path.includes("/login") || path.includes("/register") || path.includes("/password")) return false;
  if (path.startsWith("/api/user")) return false;
  return true;
}

export async function getFromCache(request: Request): Promise<Response | null> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached ?? null;
}

export async function putInCache(request: Request, response: Response): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", `public, max-age=${LESSON_TTL}`);
  headers.set("X-Madrasa-Cached", "true");
  await cache.put(request, new Response(response.body, { status: response.status, headers }));
}
