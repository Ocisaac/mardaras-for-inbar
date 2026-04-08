import { useNavigate } from "react-router-dom";
import { logout } from "../lib/api";

export default function Profile() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="page-content page-enter" style={{ padding: "0 16px" }}>
      <div style={{ paddingTop: "max(24px, env(safe-area-inset-top))", paddingBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: -0.3 }}>Profile</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 16 }}>
        {/* Info section */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <p style={{ margin: 0, fontSize: 15, color: "#555" }}>
            Signed in via <strong>madrasafree.com</strong>
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#999" }}>
            Your progress is saved on madrasafree.com
          </p>
        </div>

        {/* Install hint for iOS */}
        <div
          style={{
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Install on your home screen</p>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#555", lineHeight: 1.5 }}>
            In Safari, tap the Share button <strong>⬆</strong> then choose{" "}
            <strong>Add to Home Screen</strong> for the full app experience.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 16,
            padding: 20,
            textAlign: "left",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
            color: "#dc2626",
            minHeight: 64,
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
