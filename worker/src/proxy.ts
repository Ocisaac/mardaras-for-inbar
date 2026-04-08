export interface Env {
  MADRASA_ORIGIN: string;
  COURSES_ORIGIN: string;
}

/** Determine which upstream origin to use based on the requested path. */
function upstreamOrigin(url: URL, env: Env): string {
  // /courses/* → courses.madrasafree.com
  if (url.pathname.startsWith("/courses/") || url.hostname.includes("courses.")) {
    return env.COURSES_ORIGIN;
  }
  return env.MADRASA_ORIGIN;
}

/** Build the upstream URL from the incoming Worker request URL. */
export function buildUpstreamUrl(workerUrl: URL, env: Env): URL {
  const origin = upstreamOrigin(workerUrl, env);
  const upstream = new URL(workerUrl.pathname + workerUrl.search, origin);
  return upstream;
}

/** Rewrite absolute URLs in response headers (Location redirects) back to Worker origin. */
function rewriteLocationHeader(response: Response, workerOrigin: string, env: Env): Response {
  const location = response.headers.get("Location");
  if (!location) return response;

  let rewritten = location
    .replace(env.MADRASA_ORIGIN, workerOrigin)
    .replace(env.COURSES_ORIGIN, workerOrigin);

  const headers = new Headers(response.headers);
  headers.set("Location", rewritten);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/** Strip hop-by-hop headers that must not be forwarded. */
const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailers", "transfer-encoding", "upgrade",
  // Security headers we'll set ourselves
  "content-security-policy", "x-frame-options",
]);

function buildUpstreamHeaders(incoming: Request, upstreamHost: string): Headers {
  const headers = new Headers();
  for (const [key, value] of incoming.headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }
  headers.set("Host", upstreamHost);
  // Tell upstream we're a legitimate browser
  if (!headers.get("User-Agent")) {
    headers.set("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15");
  }
  return headers;
}

function buildResponseHeaders(upstream: Response, workerOrigin: string): Headers {
  const headers = new Headers();
  for (const [key, value] of upstream.headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }
  // Allow the PWA to embed this content
  headers.set("Access-Control-Allow-Origin", workerOrigin);
  headers.set("X-Madrasa-Proxy", "1");
  // Relax CSP so our injected CSS/scripts work
  headers.delete("Content-Security-Policy");
  headers.delete("X-Frame-Options");
  return headers;
}

export async function proxyRequest(request: Request, env: Env): Promise<Response> {
  const workerUrl = new URL(request.url);
  const workerOrigin = workerUrl.origin;
  const upstreamUrl = buildUpstreamUrl(workerUrl, env);
  const upstreamHost = new URL(upstreamUrl.toString()).hostname;

  const upstreamHeaders = buildUpstreamHeaders(request, upstreamHost);

  const upstreamRequest = new Request(upstreamUrl.toString(), {
    method: request.method,
    headers: upstreamHeaders,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
    redirect: "manual", // Handle redirects ourselves so we can rewrite Location
  });

  const upstreamResponse = await fetch(upstreamRequest);

  const responseHeaders = buildResponseHeaders(upstreamResponse, workerOrigin);
  const response = new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });

  return rewriteLocationHeader(response, workerOrigin, env);
}
