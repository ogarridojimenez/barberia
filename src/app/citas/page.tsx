"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/auth/client";

interface Cita {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  barbero: { nombre: string };
  servicio: { nombre: string; precio: number };
}

const estadoMap: Record<string, { bg: string; text: string; label: string }> = {
  activa: { bg: "#14532D", text: "#86EFAC", label: "Activa" },
  cancelada: { bg: "#450A0A", text: "#FCA5A5", label: "Cancelada" },
};

export default function CitasPage() {
  const [citasActivas, setCitasActivas] = useState<Cita[]>([]);
  const [citasCanceladas, setCitasCanceladas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchCitas();
  }, []);

  async function fetchCitas() {
    try {
      const res = await fetchApi("/api/citas");
      if (!res.ok) throw new Error("Error al cargar");

      const data = await res.json();
      const todas = data.citas || [];
      setCitasActivas(todas.filter((c: Cita) => c.estado === "activa"));
      setCitasCanceladas(todas.filter((c: Cita) => c.estado === "cancelada"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  function puedeCancelar(cita: Cita): boolean {
    if (cita.estado === "cancelada") return false;
    
    const ahora = new Date();
    const fechaCita = new Date(`${cita.fecha}T${cita.hora_inicio}:00`);
    const diffHoras = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    return diffHoras >= 2;
  }

  async function handleCancelar(citaId: string) {
    try {
      const res = await fetchApi(`/api/citas/${citaId}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "cancelada" }),
      });

      if (res.ok) {
        setMensaje({ type: "success", text: "Cita cancelada correctamente" });
        setTimeout(() => setMensaje(null), 3000);
        fetchCitas();
      } else {
        setMensaje({ type: "error", text: "Error al cancelar la cita" });
        setTimeout(() => setMensaje(null), 3000);
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error al cancelar" });
      setTimeout(() => setMensaje(null), 3000);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <span style={{ color: "#71717A" }}>Cargando...</span>
      </div>
    );
  }

  const todasLasCitas = [...citasActivas, ...citasCanceladas];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: "#FAFAFA" }}>
          Mis Citas
        </h1>
        <Link
          href="/citas/nueva"
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
            color: "#18181B",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Nueva Cita
        </Link>
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

      {error && (
        <div
          style={{
            padding: 14,
            background: "#450A0A",
            color: "#FCA5A5",
            borderRadius: 8,
            fontSize: 14,
            border: "1px solid #EF4444",
          }}
        >
          {error}
        </div>
      )}

      {todasLasCitas.length === 0 ? (
        <div
          style={{
            padding: 48,
            background: "#18181B",
            border: "1px solid #27272A",
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          <p style={{ color: "#71717A", marginBottom: 16 }}>
            No tienes citas programadas
          </p>
          <Link
            href="/citas/nueva"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#D4AF37",
            }}
          >
            Agendar tu primera cita →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {citasActivas.length > 0 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#FAFAFA", marginBottom: 16 }}>
                Citas Activas ({citasActivas.length})
              </h2>
              <div
                style={{
                  background: "#18181B",
                  border: "1px solid #27272A",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #27272A", background: "#27272A" }}>
                      {["Fecha", "Hora", "Barbero", "Servicio", "Estado", "Acción"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "14px 16px",
                            textAlign: "left",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#A1A1AA",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {citasActivas.map((cita) => {
                      const est = estadoMap[cita.estado] || estadoMap.activa;
                      const puede = puedeCancelar(cita);
                      return (
                        <tr
                          key={cita.id}
                          style={{ borderBottom: "1px solid #27272A" }}
                        >
                          <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA" }}>
                            {new Date(cita.fecha).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td style={{ padding: "16px", fontSize: 14, color: "#D4AF37", fontWeight: 500 }}>
                            {cita.hora_inicio} - {cita.hora_fin}
                          </td>
                          <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA" }}>
                            {cita.barbero?.nombre}
                          </td>
                          <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA" }}>
                            <div>{cita.servicio?.nombre}</div>
                            <div style={{ fontSize: 12, color: "#D4AF37" }}>${Number(cita.servicio?.precio).toLocaleString()}</div>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span
                              style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                background: est.bg,
                                color: est.text,
                              }}
                            >
                              {est.label}
                            </span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            {puede ? (
                              <button
                                onClick={() => handleCancelar(cita.id)}
                                style={{
                                  fontSize: 12,
                                  color: "#FCA5A5",
                                  background: "rgba(252, 165, 165, 0.1)",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "8px 12px",
                                  borderRadius: 6,
                                }}
                              >
                                Cancelar
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, color: "#71717A" }}>
                                No cancelable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {citasCanceladas.length > 0 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#71717A", marginBottom: 16 }}>
                Citas Canceladas ({citasCanceladas.length})
              </h2>
              <div
                style={{
                  background: "#18181B",
                  border: "1px solid #27272A",
                  borderRadius: 12,
                  overflow: "hidden",
                  opacity: 0.7,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #27272A", background: "#27272A" }}>
                      {["Fecha", "Hora", "Barbero", "Servicio", "Estado"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "14px 16px",
                            textAlign: "left",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#71717A",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {citasCanceladas.map((cita) => {
                      const est = estadoMap[cita.estado] || estadoMap.cancelada;
                      return (
                        <tr
                          key={cita.id}
                          style={{ borderBottom: "1px solid #27272A" }}
                        >
                          <td style={{ padding: "16px", fontSize: 14, color: "#71717A" }}>
                            {new Date(cita.fecha).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td style={{ padding: "16px", fontSize: 14, color: "#71717A" }}>
                            {cita.hora_inicio} - {cita.hora_fin}
                          </td>
                          <td style={{ padding: "16px", fontSize: 14, color: "#71717A" }}>
                            {cita.barbero?.nombre}
                          </td>
                          <td style={{ padding: "16px", fontSize: 14, color: "#71717A" }}>
                            {cita.servicio?.nombre}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span
                              style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                background: est.bg,
                                color: est.text,
                              }}
                            >
                              {est.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
