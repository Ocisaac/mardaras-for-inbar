import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Lesson } from "../lib/api";
import { fetchLessons } from "../lib/api";
import LessonCard from "../components/LessonCard";
import ProgressBar from "../components/ProgressBar";

function LessonSkeleton() {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", gap: 14, alignItems: "center" }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 12, width: "30%" }} />
      </div>
    </div>
  );
}

export default function Course() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    fetchLessons(decodeURIComponent(courseId))
      .then(setLessons)
      .catch(() => setError("Could not load lessons."))
      .finally(() => setLoading(false));
  }, [courseId]);

  const completedCount = lessons.filter((l) => l.completed).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="page-content page-enter" style={{ padding: "0 16px" }}>
      {/* Back button + header */}
      <div style={{ paddingTop: "max(16px, env(safe-area-inset-top))", paddingBottom: 8 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 0",
            fontSize: 15,
            color: "#555",
            display: "flex",
            alignItems: "center",
            gap: 4,
            minHeight: 44,
          }}
        >
          ← Back
        </button>

        <h1 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
          {courseId ? decodeURIComponent(courseId) : "Course"}
        </h1>

        {!loading && lessons.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <ProgressBar percent={progress} />
            </div>
            <span style={{ fontSize: 13, color: "#666", whiteSpace: "nowrap" }}>
              {completedCount}/{lessons.length}
            </span>
          </div>
        )}
      </div>

      {/* Lessons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16 }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <LessonSkeleton key={i} />)
        ) : error ? (
          <div style={{ textAlign: "center", padding: 40, color: "#dc2626" }}>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44 }}
            >
              Retry
            </button>
          </div>
        ) : (
          lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} courseId={courseId ?? ""} />
          ))
        )}
      </div>
    </div>
  );
}
