/**
 * All network requests go through the Cloudflare Worker proxy.
 * Set VITE_WORKER_URL in .env.local to your deployed Worker URL.
 * Falls back to localhost:8787 for local development.
 */
const WORKER_BASE = import.meta.env.VITE_WORKER_URL ?? "http://localhost:8787";

export interface Course {
  id: string;
  title: string;
  courseUrl: string;
  thumbnailUrl: string | null;
  progressPercent: number;
}

export interface Lesson {
  id: string;
  title: string;
  url: string;
  completed: boolean;
  type: "video" | "audio" | "text" | "exercise";
}

export interface LessonContent {
  title: string;
  bodyHtml: string;
  videoUrl: string | null;
  audioUrl: string | null;
}

async function workerFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${WORKER_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  return res;
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  // edX CSRF token must be fetched first
  const csrfRes = await workerFetch("/csrf/api/v1/token");
  const csrfData = await csrfRes.json() as { csrfToken?: string };
  const csrfToken = csrfData.csrfToken ?? "";

  const res = await workerFetch("/api/user/v1/account/login_session/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRFToken": csrfToken,
      Referer: `${WORKER_BASE}/login`,
    },
    body: new URLSearchParams({ email, password }),
  });

  if (res.ok) {
    localStorage.setItem("madrasa_logged_in", "1");
    return { ok: true };
  }

  const body = await res.json().catch(() => ({})) as { value?: string };
  return { ok: false, error: body.value ?? "Login failed. Please check your credentials." };
}

export function logout() {
  localStorage.removeItem("madrasa_logged_in");
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("madrasa_logged_in") === "1";
}

/**
 * Fetch enrolled courses from the edX dashboard.
 * The Worker proxies /dashboard and we parse the response on the server side.
 * For now we return the raw proxied dashboard page URL for the iframe approach,
 * but ideally the Worker exposes a /api/courses JSON endpoint.
 */
export async function fetchCourses(): Promise<Course[]> {
  const res = await workerFetch("/api/courses");
  if (!res.ok) throw new Error("Failed to load courses");
  return res.json() as Promise<Course[]>;
}

export async function fetchLessons(courseUrl: string): Promise<Lesson[]> {
  const path = `/api/lessons?courseUrl=${encodeURIComponent(courseUrl)}`;
  const res = await workerFetch(path);
  if (!res.ok) throw new Error("Failed to load lessons");
  return res.json() as Promise<Lesson[]>;
}

export async function fetchLessonContent(lessonUrl: string): Promise<LessonContent> {
  const path = `/api/lesson?url=${encodeURIComponent(lessonUrl)}`;
  const res = await workerFetch(path);
  if (!res.ok) throw new Error("Failed to load lesson");
  return res.json() as Promise<LessonContent>;
}

/** Returns the proxied URL for a given upstream URL (for direct embedding). */
export function proxyUrl(upstreamUrl: string): string {
  try {
    const u = new URL(upstreamUrl);
    return `${WORKER_BASE}${u.pathname}${u.search}`;
  } catch {
    return upstreamUrl;
  }
}
