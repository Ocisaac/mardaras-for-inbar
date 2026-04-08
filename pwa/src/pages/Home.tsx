import { useState, useEffect, useCallback } from "react";
import type { Course } from "../lib/api";
import { fetchCourses } from "../lib/api";
import CourseCard from "../components/CourseCard";

function CourseSkeleton() {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#fff" }}>
      <div className="skeleton" style={{ height: 160, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 6, marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 36, width: 80, alignSelf: "flex-end" }} />
    </div>
  );
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch {
      setError("Could not load courses. Check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Pull-to-refresh
  useEffect(() => {
    let startY = 0;
    function onTouchStart(e: TouchEvent) { startY = e.touches[0].clientY; }
    function onTouchEnd(e: TouchEvent) {
      const dy = e.changedTouches[0].clientY - startY;
      if (dy > 80 && window.scrollY === 0 && !refreshing) load(true);
    }
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [load, refreshing]);

  return (
    <div className="page-content page-enter" style={{ padding: "0 16px" }}>
      {/* Header */}
      <div style={{ paddingTop: "max(24px, env(safe-area-inset-top))", paddingBottom: 8 }}>
        {refreshing && (
          <div style={{ textAlign: "center", fontSize: 13, color: "#999", marginBottom: 8 }}>
            Refreshing…
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: -0.3 }}>My Courses</h1>
        <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>Pull down to refresh</p>
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16 }}>
        {loading ? (
          <>
            <CourseSkeleton />
            <CourseSkeleton />
          </>
        ) : error ? (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 12px", color: "#dc2626", fontSize: 15 }}>{error}</p>
            <button
              onClick={() => load()}
              style={{
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              Retry
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <p style={{ margin: 0, fontSize: 16 }}>No courses enrolled yet.</p>
            <a
              href="https://www.madrasafree.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 16, color: "#111", fontWeight: 600 }}
            >
              Browse courses →
            </a>
          </div>
        ) : (
          courses.map((course) => <CourseCard key={course.id} course={course} />)
        )}
      </div>
    </div>
  );
}
