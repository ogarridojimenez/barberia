"use client";

import { useEffect, useState, FormEvent } from "react";
import { fetchApi, apiGet } from "@/lib/auth/client";

interface User {
  id: string;
  email: string;
  created_at?: string;
}

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const data = await apiGet<{ user: User }>("/api/me");
      setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Mínimo 8 caracteres" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetchApi("/api/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Contraseña actualizada" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "Error al cambiar contraseña" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      window.location.replace("/login");
    });
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <span style={{ color: "var(--muted-foreground)" }}>Cargando...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 600 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8 }}>
          Mi Perfil
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: 15 }}>
          Gestiona tu información personal
        </p>
      </div>

      <div
        style={{
          padding: 24,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Información de cuenta</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "var(--muted-foreground)", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--background)",
                color: "var(--muted-foreground)",
              }}
            />
          </div>

          {user?.created_at && (
            <div>
              <label style={{ display: "block", fontSize: 13, color: "var(--muted-foreground)", marginBottom: 6 }}>
                Miembro desde
              </label>
              <input
                type="text"
                value={new Date(user.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                disabled
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 14,
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: "var(--background)",
                  color: "var(--muted-foreground)",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          padding: 24,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Cambiar contraseña</h2>
        
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "var(--muted-foreground)", marginBottom: 6 }}>
              Contraseña actual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--background)",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, color: "var(--muted-foreground)", marginBottom: 6 }}>
              Nueva contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--background)",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, color: "var(--muted-foreground)", marginBottom: 6 }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--background)",
              }}
            />
          </div>

          {message && (
            <div
              style={{
                padding: 12,
                borderRadius: 6,
                fontSize: 14,
                background: message.type === "success" ? "#DCFCE7" : "#FEE2E2",
                color: message.type === "success" ? "#166534" : "#991B1B",
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 20px",
              background: "var(--accent)",
              color: "var(--accent-foreground)",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
              alignSelf: "flex-start",
            }}
          >
            {saving ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>

      <div style={{ paddingTop: 16 }}>
        <button
          onClick={handleLogout}
          style={{
            fontSize: 14,
            color: "#991B1B",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
