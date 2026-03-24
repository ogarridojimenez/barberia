"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/auth/client";

interface Usuario {
  id: string;
  email: string;
  user_role: "cliente" | "barbero" | "admin";
  created_at: string;
}

const roleMap: Record<string, { bg: string; text: string; label: string }> = {
  cliente: { bg: "#DBEAFE", text: "#1E40AF", label: "Cliente" },
  barbero: { bg: "#DCFCE7", text: "#166534", label: "Barbero" },
  admin: { bg: "#F3E8FF", text: "#7C3AED", label: "Admin" },
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { fetchUsuarios(); }, []);

  async function fetchUsuarios() {
    try {
      const res = await fetchApi("/api/admin/usuarios");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setUsuarios(data.usuarios || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetchApi(`/api/admin/usuarios/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ user_role: newRole }),
      });
      if (res.ok) { setMensaje({ type: "success", text: "Rol actualizado" }); setTimeout(() => setMensaje(null), 3000); fetchUsuarios(); }
    } catch (err) { setMensaje({ type: "error", text: "Error al actualizar" }); setTimeout(() => setMensaje(null), 3000); }
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 64 }}><span style={{ color: "var(--muted-foreground)" }}>Cargando...</span></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8 }}>Gestión de Usuarios</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: 15 }}>Administra los usuarios y sus roles</p>
      </div>
      {mensaje && <div style={{ padding: 12, borderRadius: 6, fontSize: 14, background: mensaje.type === "success" ? "#DCFCE7" : "#FEE2E2", color: mensaje.type === "success" ? "#166534" : "#991B1B" }}>{mensaje.text}</div>}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{["Email", "Rol", "Fecha de Registro", "Cambiar Rol"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
          <tbody>
            {usuarios.map(usuario => {
              const role = roleMap[usuario.user_role] || roleMap.cliente;
              return (
                <tr key={usuario.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "16px", fontSize: 14 }}>{usuario.email}</td>
                  <td style={{ padding: "16px" }}><span style={{ padding: "4px 10px", borderRadius: 100, fontSize: 12, fontWeight: 500, background: role.bg, color: role.text }}>{role.label}</span></td>
                  <td style={{ padding: "16px", fontSize: 14, color: "var(--muted-foreground)" }}>{new Date(usuario.created_at).toLocaleDateString("es-ES")}</td>
                  <td style={{ padding: "16px" }}>
                    <select value={usuario.user_role} onChange={(e) => handleRoleChange(usuario.id, e.target.value)} style={{ padding: "6px 10px", fontSize: 13, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)" }}>
                      <option value="cliente">Cliente</option>
                      <option value="barbero">Barbero</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {usuarios.length === 0 && <div style={{ padding: 48, textAlign: "center", color: "var(--muted-foreground)" }}>No hay usuarios registrados</div>}
      </div>
    </div>
  );
}
