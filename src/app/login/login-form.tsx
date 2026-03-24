"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Email y contraseña son requeridos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // Dar tiempo al browser para procesar la cookie antes de navegar
      await new Promise((r) => setTimeout(r, 200));
      window.location.replace(data.redirectUrl || "/dashboard");
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18181B" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8, color: "#FAFAFA" }}>Gentleman&apos;s Cut</h1>
          <p style={{ color: "#71717A", fontSize: 14 }}>Inicia sesión en tu cuenta</p>
        </div>

        <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 16, padding: 32 }}>
          {error && (
            <div style={{ padding: 14, marginBottom: 20, background: "#450A0A", color: "#FCA5A5", borderRadius: 8, fontSize: 14, border: "1px solid #EF4444" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label htmlFor="login-email" style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 8, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "#27272A", color: "#FAFAFA", outline: "none" }}
              />
            </div>
            <div>
              <label htmlFor="login-password" style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 8, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contraseña</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "#27272A", color: "#FAFAFA", outline: "none" }}
              />
            </div>
          </div>

          <button
            id="login-btn"
            type="button"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", marginTop: 28, padding: "14px", fontSize: 14, fontWeight: 600, color: "#18181B", background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)" }}
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a href="/register" style={{ fontSize: 14, color: "#71717A", textDecoration: "none" }}>¿No tienes cuenta? <span style={{ color: "#D4AF37", fontWeight: 500 }}>Regístrate</span></a>
        </div>
      </div>
    </div>
  );
}
