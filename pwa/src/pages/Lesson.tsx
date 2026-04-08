import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { LessonContent } from "../lib/api";
import { fetchLessonContent } from "../lib/api";
import AudioPlayer from "../components/AudioPlayer";

function LessonSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="skeleton" style={{ height: 28, width: "80%" }} />
      <div className="skeleton" style={{ height: 200 }} />
      <div className="skeleton" style={{ height: 16 }} />
      <div className="skeleton" style={{ height: 16, width: "90%" }} />
      <div className="skeleton" style={{ height: 16, width: "75%" }} />
    </div>
  );
}

export default function Lesson() {
  const { lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Swipe-right to go back
  useEffect(() => {
    let startX = 0;
    function onTouchStart(e: TouchEvent) { startX = e.touches[0].clientX; }
    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > 80 && startX < 60) navigate(-1);
    }
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [navigate]);

  useEffect(() => {
    if (!lessonId) return;
    fetchLessonContent(decodeURIComponent(lessonId))
      .then(setContent)
      .catch(() => setError("Could not load this lesson."))
      .finally(() => setLoading(false));
  }, [lessonId]);

  return (
    <div className="page-content page-enter" style={{ padding: "0 16px" }}>
      {/* Nav */}
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
      </div>

      {loading ? (
        <LessonSkeleton />
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
      ) : content ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>
            {content.title}
          </h1>

          {/* Video player — native iOS HLS */}
          {content.videoUrl && (
            <video
              src={content.videoUrl}
              controls
              playsInline
              style={{
                width: "100%",
                borderRadius: 12,
                background: "#000",
                maxHeight: "55vw",
              }}
            />
          )}

          {/* Audio player */}
          {content.audioUrl && (
            <AudioPlayer src={content.audioUrl} title="Listen" />
          )}

          {/* Lesson body */}
          {content.bodyHtml && (
            <div
              ref={contentRef}
              dir="auto"
              dangerouslySetInnerHTML={{ __html: content.bodyHtml }}
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: "#111",
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
