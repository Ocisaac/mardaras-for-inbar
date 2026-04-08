interface ProgressBarProps {
  percent: number; // 0–100
  height?: number;
  color?: string;
}

export default function ProgressBar({ percent, height = 6, color = "#111" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: "100%",
        height,
        background: "#e5e7eb",
        borderRadius: height,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          background: color,
          borderRadius: height,
          transition: "width 400ms ease",
        }}
      />
    </div>
  );
}
