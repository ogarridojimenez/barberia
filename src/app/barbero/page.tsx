"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/auth/client";

interface Cita {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  notas: string;
  usuario: { email: string };
  servicio: { nombre: string; precio: number };
}

const estadoMap: Record<string, { bg: string; text: string; label: string }> = {
  activa: { bg: "#14532D", text: "#86EFAC", label: "Activa" },
  cancelada: { bg: "#450A0A", text: "#FCA5A5", label: "Cancelada" },
  completada: { bg: "#1E3A5F", text: "#93C5FD", label: "Completada" },
};

export default function BarberoPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");

  useEffect(() => {
    fetchCitas();
  }, []);

  async function fetchCitas() {
    try {
      const res = await fetchApi("/api/barberos/citas");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setCitas(data.citas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleActualizarEstado(citaId: string, nuevoEstado: string) {
    try {
      const res = await fetchApi(`/api/citas/${citaId}`, {
        method: "PUT",
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) fetchCitas();
    } catch (err) {
      console.error(err);
    }
  }

  const fechasUnicas = [...new Set(citas.map(c => c.fecha))].sort();
  const citasPorFecha = citas.reduce((acc, cita) => {
    if (!acc[cita.fecha]) acc[cita.fecha] = [];
    acc[cita.fecha].push(cita);
    return acc;
  }, {} as Record<string, Cita[]>);

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
          Mis Citas
        </h1>
        <p style={{ color: "#71717A", fontSize: 15 }}>
          Citas programadas organizadas por fecha
        </p>
      </div>

      {citas.length === 0 ? (
        <div style={{ padding: 48, background: "#18181B", border: "1px solid #27272A", borderRadius: 12, textAlign: "center" }}>
          <p style={{ color: "#71717A" }}>No hay citas programadas</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {fechasUnicas.map(fecha => {
            const citasFecha = citasPorFecha[fecha] || [];
            const fechaDate = new Date(fecha);
            const esHoy = new Date().toISOString().split("T")[0] === fecha;
            
            return (
              <div key={fecha} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ 
                    fontSize: 16, 
                    fontWeight: 600,
                    color: esHoy ? "#D4AF37" : "#FAFAFA"
                  }}>
                    {fechaDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                  {esHoy && (
                    <span style={{ padding: "4px 10px", background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)", color: "#18181B", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                      Hoy
                    </span>
                  )}
                  <span style={{ fontSize: 14, color: "#71717A" }}>
                    ({citasFecha.length} {citasFecha.length === 1 ? "cita" : "citas"})
                  </span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {citasFecha.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)).map(cita => {
                    const est = estadoMap[cita.estado] || estadoMap.activa;
                    return (
                      <div
                        key={cita.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: 16,
                          background: "#18181B",
                          border: "1px solid #27272A",
                          borderRadius: 12,
                        }}
                      >
                        <div style={{ width: 80, flexShrink: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#D4AF37" }}>
                            {cita.hora_inicio} - {cita.hora_fin}
                          </span>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#FAFAFA" }}>{cita.servicio.nombre}</div>
                          <div style={{ fontSize: 13, color: "#A1A1AA" }}>{cita.usuario.email}</div>
                          {cita.notas && (
                            <div style={{ fontSize: 12, color: "#71717A", marginTop: 4, fontStyle: "italic" }}>
                              &quot;{cita.notas}&quot;
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <span style={{ 
                            padding: "6px 12px", 
                            borderRadius: 6, 
                            fontSize: 12, 
                            fontWeight: 600,
                            background: est.bg,
                            color: est.text,
                          }}>
                            {est.label}
                          </span>
                          
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#D4AF37" }}>
                            ${Number(cita.servicio.precio).toLocaleString()}
                          </span>
                          
                          {cita.estado === "activa" && (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => handleActualizarEstado(cita.id, "completada")}
                                style={{ fontSize: 12, color: "#93C5FD", background: "rgba(147, 197, 253, 0.1)", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 6 }}
                              >
                                Completar
                              </button>
                              <button
                                onClick={() => handleActualizarEstado(cita.id, "cancelada")}
                                style={{ fontSize: 12, color: "#FCA5A5", background: "rgba(252, 165, 165, 0.1)", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 6 }}
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
