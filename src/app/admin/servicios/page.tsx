"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/auth/client";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  precio: number;
  activo: boolean;
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    duracion_minutos: 30,
    precio: 0,
  });

  useEffect(() => {
    fetchServicios();
  }, []);

  async function fetchServicios() {
    try {
      const res = await fetchApi("/api/admin/servicios");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setServicios(data.servicios || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreateModal() {
    setEditingServicio(null);
    setFormData({ nombre: "", descripcion: "", duracion_minutos: 30, precio: 0 });
    setShowModal(true);
  }

  function openEditModal(servicio: Servicio) {
    setEditingServicio(servicio);
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || "",
      duracion_minutos: servicio.duracion_minutos,
      precio: servicio.precio,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = editingServicio ? `/api/admin/servicios/${editingServicio.id}` : "/api/admin/servicios";
      const method = editingServicio ? "PUT" : "POST";
      const res = await fetchApi(url, { method, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error("Error al guardar");
      setMensaje({ type: "success", text: editingServicio ? "Servicio actualizado" : "Servicio creado" });
      setTimeout(() => setMensaje(null), 3000);
      setShowModal(false);
      fetchServicios();
    } catch (err) {
      setMensaje({ type: "error", text: "Error al guardar" });
      setTimeout(() => setMensaje(null), 3000);
    }
  }

  async function handleToggleActivo(servicio: Servicio) {
    try {
      const res = await fetchApi(`/api/admin/servicios/${servicio.id}`, {
        method: "PUT",
        body: JSON.stringify({ activo: !servicio.activo }),
      });
      if (res.ok) { setMensaje({ type: "success", text: "Estado actualizado" }); setTimeout(() => setMensaje(null), 3000); fetchServicios(); }
    } catch (err) { setMensaje({ type: "error", text: "Error al actualizar" }); setTimeout(() => setMensaje(null), 3000); }
  }

  async function handleDelete(servicio: Servicio) {
    if (!confirm(`¿Eliminar "${servicio.nombre}"?`)) return;
    try {
      const res = await fetchApi(`/api/admin/servicios/${servicio.id}`, { method: "DELETE" });
      if (res.ok) { setMensaje({ type: "success", text: "Servicio eliminado" }); setTimeout(() => setMensaje(null), 3000); fetchServicios(); }
    } catch (err) { setMensaje({ type: "error", text: "Error al eliminar" }); setTimeout(() => setMensaje(null), 3000); }
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 64 }}><span style={{ color: "var(--muted-foreground)" }}>Cargando...</span></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8 }}>Gestión de Servicios</h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: 15 }}>Administra los servicios ofrecidos</p>
        </div>
        <button onClick={openCreateModal} style={{ padding: "10px 16px", fontSize: 14, fontWeight: 500, color: "var(--accent-foreground)", background: "var(--accent)", border: "none", borderRadius: 6, cursor: "pointer" }}>+ Nuevo Servicio</button>
      </div>
      {mensaje && <div style={{ padding: 12, borderRadius: 6, fontSize: 14, background: mensaje.type === "success" ? "#DCFCE7" : "#FEE2E2", color: mensaje.type === "success" ? "#166534" : "#991B1B" }}>{mensaje.text}</div>}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{["Nombre", "Descripción", "Duración", "Precio", "Estado", "Acciones"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
          <tbody>
            {servicios.map(servicio => (
              <tr key={servicio.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "16px", fontSize: 14, fontWeight: 500 }}>{servicio.nombre}</td>
                <td style={{ padding: "16px", fontSize: 14, color: "var(--muted-foreground)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{servicio.descripcion || "-"}</td>
                <td style={{ padding: "16px", fontSize: 14 }}>{servicio.duracion_minutos} min</td>
                <td style={{ padding: "16px", fontSize: 14, fontWeight: 500 }}>${Number(servicio.precio).toLocaleString()}</td>
                <td style={{ padding: "16px" }}><span style={{ padding: "4px 10px", borderRadius: 100, fontSize: 12, fontWeight: 500, background: servicio.activo ? "#DCFCE7" : "#FEE2E2", color: servicio.activo ? "#166534" : "#991B1B" }}>{servicio.activo ? "Activo" : "Inactivo"}</span></td>
                <td style={{ padding: "16px" }}><div style={{ display: "flex", gap: 12 }}><button onClick={() => openEditModal(servicio)} style={{ fontSize: 13, color: "var(--foreground)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Editar</button><button onClick={() => handleToggleActivo(servicio)} style={{ fontSize: 13, color: "#CA8A04", background: "none", border: "none", cursor: "pointer", padding: 0 }}>{servicio.activo ? "Desactivar" : "Activar"}</button><button onClick={() => handleDelete(servicio)} style={{ fontSize: 13, color: "#991B1B", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Eliminar</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {servicios.length === 0 && <div style={{ padding: 48, textAlign: "center", color: "var(--muted-foreground)" }}>No hay servicios registrados</div>}
      </div>
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "var(--surface)", borderRadius: 8, padding: 24, width: "100%", maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{editingServicio ? "Editar Servicio" : "Nuevo Servicio"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Nombre</label><input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)" }} /></div>
              <div><label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Descripción</label><textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={3} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)" }} /></div>
              <div><label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Duración (min)</label><input type="number" required min={5} value={formData.duracion_minutos} onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) })} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)" }} /></div>
              <div><label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Precio</label><input type="number" required min={0} step="0.01" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--background)" }} /></div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 16px", fontSize: 14, border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", cursor: "pointer" }}>Cancelar</button>
                <button type="submit" style={{ padding: "10px 16px", fontSize: 14, fontWeight: 500, color: "var(--accent-foreground)", background: "var(--accent)", border: "none", borderRadius: 6, cursor: "pointer" }}>{editingServicio ? "Guardar" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
