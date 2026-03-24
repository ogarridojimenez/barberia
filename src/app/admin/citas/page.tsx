"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/auth/client";

interface Barbero {
  id: string;
  nombre: string;
}

interface Cita {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: "activa" | "cancelada" | "completada";
  notas: string;
  usuario: { email: string };
  barbero: { nombre: string };
  servicio: { nombre: string; precio: number };
}

const estadoMap: Record<string, { bg: string; text: string; label: string }> = {
  activa: { bg: "#14532D", text: "#86EFAC", label: "Activa" },
  cancelada: { bg: "#450A0A", text: "#FCA5A5", label: "Cancelada" },
  completada: { bg: "#1E3A5F", text: "#93C5FD", label: "Completada" },
};

export default function AdminCitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroBarbero, setFiltroBarbero] = useState("");
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchBarberos();
  }, []);

  useEffect(() => {
    fetchCitas();
  }, [filtroFecha, filtroEstado, filtroBarbero]);

  async function fetchBarberos() {
    try {
      const res = await fetchApi("/api/admin/barberos");
      const data = await res.json();
      setBarberos(data.barberos || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCitas() {
    try {
      let url = "/api/admin/citas?";
      if (filtroFecha) url += `fecha=${filtroFecha}&`;
      if (filtroEstado) url += `estado=${filtroEstado}&`;
      if (filtroBarbero) url += `barbero_id=${filtroBarbero}&`;

      const res = await fetchApi(url);
      if (!res.ok) throw new Error("Error al cargar");

      const data = await res.json();
      setCitas(data.citas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateEstado(citaId: string, nuevoEstado: string) {
    try {
      const res = await fetchApi(`/api/citas/${citaId}`, {
        method: "PUT",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        setMensaje({ type: "success", text: "Cita actualizada" });
        setTimeout(() => setMensaje(null), 3000);
        fetchCitas();
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error al actualizar" });
      setTimeout(() => setMensaje(null), 3000);
    }
  }

  function limpiarFiltros() {
    setFiltroFecha("");
    setFiltroEstado("");
    setFiltroBarbero("");
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <span style={{ color: "#71717A" }}>Cargando...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8, color: "#FAFAFA" }}>
          Gestión de Citas
        </h1>
        <p style={{ color: "#71717A", fontSize: 15 }}>
          Administra todas las citas de la barbería
        </p>
      </div>

      {mensaje && (
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            fontSize: 14,
            background: mensaje.type === "success" ? "#14532D" : "#450A0A",
            color: mensaje.type === "success" ? "#86EFAC" : "#FCA5A5",
            border: `1px solid ${mensaje.type === "success" ? "#22C55E" : "#EF4444"}`,
          }}
        >
          {mensaje.text}
        </div>
      )}

      <div style={{ padding: 20, background: "#18181B", border: "1px solid #27272A", borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#FAFAFA" }}>Filtros</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#A1A1AA", marginBottom: 6, fontWeight: 500 }}>Fecha</label>
            <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "#27272A", color: "#FAFAFA", outline: "none" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#A1A1AA", marginBottom: 6, fontWeight: 500 }}>Barbero</label>
            <select value={filtroBarbero} onChange={(e) => setFiltroBarbero(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "#27272A", color: "#FAFAFA", outline: "none" }}>
              <option value="">Todos los barberos</option>
              {barberos.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#A1A1AA", marginBottom: 6, fontWeight: 500 }}>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "#27272A", color: "#FAFAFA", outline: "none" }}>
              <option value="">Todos</option>
              <option value="activa">Activa</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={limpiarFiltros} style={{ padding: "10px 16px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "transparent", color: "#A1A1AA", cursor: "pointer" }}>Limpiar filtros</button>
          </div>
        </div>
      </div>

      <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #27272A", background: "#27272A" }}>
              {["Cliente", "Fecha / Hora", "Barbero", "Servicio", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => {
              const est = estadoMap[cita.estado] || estadoMap.activa;
              return (
                <tr key={cita.id} style={{ borderBottom: "1px solid #27272A" }}>
                  <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA" }}>{cita.usuario.email}</td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA" }}>
                    <div style={{ fontWeight: 500 }}>{new Date(cita.fecha).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}</div>
                    <div style={{ fontSize: 12, color: "#71717A" }}>{cita.hora_inicio} - {cita.hora_fin}</div>
                  </td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#18181B" }}>{cita.barbero.nombre.charAt(0)}</div>
                      {cita.barbero.nombre}
                    </div>
                  </td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA" }}>
                    <div>{cita.servicio.nombre}</div>
                    <div style={{ fontSize: 12, color: "#D4AF37", fontWeight: 500 }}>${Number(cita.servicio.precio).toLocaleString()}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: est.bg, color: est.text }}>{est.label}</span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {cita.estado === "activa" && (
                        <>
                          <button onClick={() => handleUpdateEstado(cita.id, "completada")} style={{ fontSize: 12, color: "#93C5FD", background: "rgba(147, 197, 253, 0.1)", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 6 }}>Completar</button>
                          <button onClick={() => handleUpdateEstado(cita.id, "cancelada")} style={{ fontSize: 12, color: "#FCA5A5", background: "rgba(252, 165, 165, 0.1)", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 6 }}>Cancelar</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {citas.length === 0 && <div style={{ padding: 48, textAlign: "center", color: "#71717A" }}>No hay citas para mostrar</div>}
      </div>
    </div>
  );
}
