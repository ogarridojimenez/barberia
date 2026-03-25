"use client";

import { useEffect, useState, FormEvent } from "react";
import { fetchApi, apiGet } from "@/lib/auth/client";

interface User {
  id: string;
  email: string;
  nombre?: string;
  telefono?: string;
  created_at?: string;
}

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Campos de perfil
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  // Campos de contraseña
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
      setNombre(data.user.nombre || "");
      setTelefono(data.user.telefono || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetchApi("/api/me", {
        method: "PUT",
        body: JSON.stringify({ nombre, telefono }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setMessage({ type: "success", text: "Perfil actualizado" });
      } else {
        setMessage({ type: "error", text: data.error || "Error al actualizar" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setSaving(false);
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

    setSavingPassword(true);
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
      setSavingPassword(false);
    }
  }

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      window.location.replace("/login");
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #3F3F46",
    borderRadius: 6,
    background: "#27272A",
    color: "#FAFAFA",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    color: "#A1A1AA",
    marginBottom: 6,
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <span style={{ color: "#71717A" }}>Cargando...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 600 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8, color: "#FAFAFA" }}>
          Mi Perfil
        </h1>
        <p style={{ color: "#71717A", fontSize: 15 }}>
          Gestiona tu información personal
        </p>
      </div>

      {/* Información de cuenta */}
      <div style={{ padding: 24, background: "#18181B", border: "1px solid #27272A", borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#FAFAFA" }}>
          Información personal
        </h2>

        <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={user?.email || ""} disabled style={{ ...inputStyle, color: "#71717A" }} />
          </div>

          <div>
            <label style={labelStyle}>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+1 234 567 8900"
              style={inputStyle}
            />
          </div>

          {user?.created_at && (
            <div>
              <label style={labelStyle}>Miembro desde</label>
              <input
                type="text"
                value={new Date(user.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                disabled
                style={{ ...inputStyle, color: "#71717A" }}
              />
            </div>
          )}

          {message && (
            <div
              style={{
                padding: 12,
                borderRadius: 6,
                fontSize: 14,
                background: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: message.type === "success" ? "#86EFAC" : "#FCA5A5",
                border: `1px solid ${message.type === "success" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
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
              background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
              color: "#18181B",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
              alignSelf: "flex-start",
            }}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div style={{ padding: 24, background: "#18181B", border: "1px solid #27272A", borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#FAFAFA" }}>
          Cambiar contraseña
        </h2>

        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            style={{
              padding: "10px 20px",
              background: "#27272A",
              color: "#FAFAFA",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              border: "1px solid #3F3F46",
              cursor: savingPassword ? "not-allowed" : "pointer",
              opacity: savingPassword ? 0.6 : 1,
              alignSelf: "flex-start",
            }}
          >
            {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>

      {/* Cerrar sesión */}
      <div style={{ paddingTop: 16 }}>
        <button
          onClick={handleLogout}
          style={{
            fontSize: 14,
            color: "#FCA5A5",
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
