import { useNavigate } from "react-router-dom";
import type { Lesson } from "../lib/api";

const typeLabel: Record<Lesson["type"], string> = {
  video: "Video",
  audio: "Audio",
  text: "Reading",
  exercise: "Exercise",
};

const typeIcon: Record<Lesson["type"], string> = {
  video: "▶",
  audio: "♪",
  text: "≡",
  exercise: "✎",
};

export default function LessonCard({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/lesson/${encodeURIComponent(courseId)}/${encodeURIComponent(lesson.id)}`)}
      disabled={lesson.completed === false && lesson.type === "exercise"} // placeholder; real gating via API
      style={{
        width: "100%",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "14px 16px",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        minHeight: 64,
      }}
    >
      {/* Type icon badge */}
      <div
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          background: lesson.completed ? "#f0fdf4" : "#f3f4f6",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          color: lesson.completed ? "#16a34a" : "#666",
        }}
      >
        {lesson.completed ? "✓" : typeIcon[lesson.type]}
      </div>

      {/* Title + label */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 500,
            color: "#111",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {lesson.title}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#999", marginTop: 2 }}>
          {typeLabel[lesson.type]}
        </p>
      </div>

      {/* Chevron */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
