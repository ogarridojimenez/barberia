"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/auth/client";

interface Barbero {
  id: string;
  nombre: string;
  especialidad: string;
  telefono: string;
  foto_url: string;
  activo: boolean;
}

export default function BarberosPage() {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBarbero, setEditingBarbero] = useState<Barbero | null>(null);
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    especialidad: "",
    telefono: "",
    foto_url: "",
  });

  useEffect(() => {
    fetchBarberos();
  }, []);

  async function fetchBarberos() {
    try {
      const res = await fetchApi("/api/admin/barberos");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setBarberos(data.barberos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingBarbero(null);
    setFormData({ nombre: "", especialidad: "", telefono: "", foto_url: "" });
    setShowModal(true);
  }

  function openEditModal(barbero: Barbero) {
    setEditingBarbero(barbero);
    setFormData({
      nombre: barbero.nombre,
      especialidad: barbero.especialidad || "",
      telefono: barbero.telefono || "",
      foto_url: barbero.foto_url || "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = editingBarbero ? `/api/admin/barberos/${editingBarbero.id}` : "/api/admin/barberos";
      const method = editingBarbero ? "PUT" : "POST";
      const res = await fetchApi(url, { method, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error("Error al guardar");
      setMensaje({ type: "success", text: editingBarbero ? "Barbero actualizado" : "Barbero creado" });
      setTimeout(() => setMensaje(null), 3000);
      setShowModal(false);
      fetchBarberos();
    } catch (err) {
      setMensaje({ type: "error", text: "Error al guardar" });
      setTimeout(() => setMensaje(null), 3000);
    }
  }

  async function handleToggleActivo(barbero: Barbero) {
    try {
      const res = await fetchApi(`/api/admin/barberos/${barbero.id}`, {
        method: "PUT",
        body: JSON.stringify({ activo: !barbero.activo }),
      });
      if (res.ok) { setMensaje({ type: "success", text: "Estado actualizado" }); setTimeout(() => setMensaje(null), 3000); fetchBarberos(); }
    } catch (err) { setMensaje({ type: "error", text: "Error al actualizar" }); setTimeout(() => setMensaje(null), 3000); }
  }

  async function handleDelete(barbero: Barbero) {
    if (!confirm(`¿Eliminar a ${barbero.nombre}?`)) return;
    try {
      const res = await fetchApi(`/api/admin/barberos/${barbero.id}`, { method: "DELETE" });
      if (res.ok) { setMensaje({ type: "success", text: "Barbero eliminado" }); setTimeout(() => setMensaje(null), 3000); fetchBarberos(); }
    } catch (err) { setMensaje({ type: "error", text: "Error al eliminar" }); setTimeout(() => setMensaje(null), 3000); }
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 64 }}><span style={{ color: "var(--muted-foreground)" }}>Cargando...</span></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8 }}>Gestión de Barberos</h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: 15 }}>Administra el personal de la barbería</p>
        </div>
        <button onClick={openCreateModal} style={{ padding: "10px 16px", fontSize: 14, fontWeight: 500, color: "var(--accent-foreground)", background: "var(--accent)", border: "none", borderRadius: 6, cursor: "pointer" }}>+ Nuevo Barbero</button>
      </div>

      {mensaje && <div style={{ padding: 12, borderRadius: 6, fontSize: 14, background: mensaje.type === "success" ? "#DCFCE7" : "#FEE2E2", color: mensaje.type === "success" ? "#166534" : "#991B1B" }}>{mensaje.text}</div>}

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{["Nombre", "Especialidad", "Teléfono", "Estado", "Acciones"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
          <tbody>
            {barberos.map(barbero => (
              <tr key={barbero.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "16px", fontSize: 14, fontWeight: 500 }}>{barbero.nombre}</td>
                <td style={{ padding: "16px", fontSize: 14, color: "var(--muted-foreground)" }}>{barbero.especialidad || "-"}</td>
                <td style={{ padding: "16px", fontSize: 14, color: "var(--muted-foreground)" }}>{barbero.telefono || "-"}</td>
                <td style={{ padding: "16px" }}><span style={{ padding: "4px 10px", borderRadius: 100, fontSize: 12, fontWeight: 500, background: barbero.activo ? "#DCFCE7" : "#FEE2E2", color: barbero.activo ? "#166534" : "#991B1B" }}>{barbero.activo ? "Activo" : "Inactivo"}</span></td>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => openEditModal(barbero)} style={{ fontSize: 13, color: "var(--foreground)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Editar</button>
                    <button onClick={() => handleToggleActivo(barbero)} style={{ fontSize: 13, color: "#CA8A04", background: "none", border: "none", cursor: "pointer", padding: 0 }}>{barbero.activo ? "Desactivar" : "Activar"}</button>
                    <button onClick={() => handleDelete(barbero)} style={{ fontSize: 13, color: "#991B1B", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {barberos.length === 0 && <div style={{ padding: 48, textAlign: "center", color: "var(--muted-foreground)" }}>No hay barberos registrados</div>}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "var(--surface)", borderRadius: 8, padding: 24, width: "100%", maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{editingBarbero ? "Editar Barbero" : "Nuevo Barbero"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Nombre</label><input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)" }} /></div>
              <div><label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Especialidad</label><input type="text" value={formData.especialidad} onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)" }} /></div>
              <div><label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Teléfono</label><input type="text" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)" }} /></div>
              <div><label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>URL Foto</label><input type="url" value={formData.foto_url} onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)" }} /></div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 16px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", cursor: "pointer" }}>Cancelar</button>
                <button type="submit" style={{ padding: "10px 16px", fontSize: 14, fontWeight: 500, color: "var(--accent-foreground)", background: "var(--accent)", border: "none", borderRadius: 6, cursor: "pointer" }}>{editingBarbero ? "Guardar" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
