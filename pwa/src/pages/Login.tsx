import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate("/", { replace: true });
    } else {
      setError(result.error ?? "Login failed");
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 24px calc(24px + env(safe-area-inset-bottom))",
        background: "#fafafa",
      }}
    >
      {/* Logo / wordmark */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🌙</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Madrasa</h1>
        <p style={{ margin: "8px 0 0", color: "#666", fontSize: 15 }}>Arabic learning, made for your phone</p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #e5e7eb",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Sign in</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
          Use your madrasafree.com account
        </p>

        {error && (
          <div
            role="alert"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={{
              height: 52,
              padding: "0 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 16,
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={{
              height: 52,
              padding: "0 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 16,
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            height: 52,
            background: loading ? "#999" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p style={{ margin: 0, fontSize: 13, color: "#999", textAlign: "center" }}>
          No account?{" "}
          <a
            href="https://www.madrasafree.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#111", fontWeight: 500 }}
          >
            Register on madrasafree.com
          </a>
        </p>
      </form>
    </div>
  );
}
