import { useNavigate } from "react-router-dom";
import type { Course } from "../lib/api";
import ProgressBar from "./ProgressBar";

export default function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/course/${encodeURIComponent(course.id)}`)}
      style={{
        width: "100%",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 44,
      }}
    >
      {course.thumbnailUrl && (
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          style={{
            width: "100%",
            height: 160,
            objectFit: "cover",
            borderRadius: 10,
          }}
          loading="lazy"
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, lineHeight: 1.3, color: "#111" }}>
          {course.title}
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <ProgressBar percent={course.progressPercent} />
          </div>
          <span style={{ fontSize: 13, color: "#666", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
            {course.progressPercent}%
          </span>
        </div>

        <span
          style={{
            display: "inline-block",
            alignSelf: "flex-end",
            fontSize: 14,
            fontWeight: 600,
            color: "#111",
            background: "#f3f4f6",
            borderRadius: 8,
            padding: "6px 14px",
            minHeight: 44,
            lineHeight: "32px",
          }}
        >
          {course.progressPercent > 0 ? "Continue" : "Start"}
        </span>
      </div>
    </button>
  );
}
