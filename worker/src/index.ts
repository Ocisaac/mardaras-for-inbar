import type { Env } from "./proxy";
import { proxyRequest } from "./proxy";
import { transformResponse } from "./transform";
import { isCacheable, getFromCache, putInCache } from "./cache";

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Cookie, X-CSRFToken",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const cacheable = isCacheable(url, request.method);

    // Try cache first for GET requests
    if (cacheable) {
      const cached = await getFromCache(request);
      if (cached) return cached;
    }

    // Proxy to upstream
    let response = await proxyRequest(request, env);

    // Transform HTML responses
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("text/html")) {
      response = transformResponse(response);
    }

    // Cache the transformed response for GET HTML pages
    if (cacheable && contentType.includes("text/html") && response.status === 200) {
      // Clone before caching since body can only be consumed once
      const forCache = response.clone();
      await putInCache(request, forCache);
    }

    return response;
  },
} satisfies ExportedHandler<Env>;
