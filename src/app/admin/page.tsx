"use client";

import { fetchApi } from "@/lib/auth/client";
import { useEffect, useState } from "react";

interface Stats {
  totalCitas: number;
  citasHoy: number;
  citasPendientes: number;
  citasCompletadas: number;
  totalBarberos: number;
  totalServicios: number;
  totalUsuarios: number;
  ingresosTotales: number;
  ingresosHoy: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats on mount and revalidate every 5 minutes
  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <span style={{ color: "#71717A" }}>Cargando estadísticas...</span>
      </div>
    );
  }

  const metricCards = [
    { label: "Citas hoy", value: stats?.citasHoy ?? 0, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "#D4AF37" },
    { label: "Pendientes", value: stats?.citasPendientes ?? 0, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "#FCD34D" },
    { label: "Completadas", value: stats?.citasCompletadas ?? 0, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "#22C55E" },
    { label: "Ingresos hoy", value: `$${(stats?.ingresosHoy ?? 0).toLocaleString()}`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "#D4AF37" },
    { label: "Total citas", value: stats?.totalCitas ?? 0, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "#A1A1AA" },
    { label: "Barberos", value: stats?.totalBarberos ?? 0, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "#A1A1AA" },
    { label: "Servicios", value: stats?.totalServicios ?? 0, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", color: "#A1A1AA" },
    { label: "Usuarios", value: stats?.totalUsuarios ?? 0, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "#A1A1AA" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8, color: "#FAFAFA" }}>
          Dashboard
        </h1>
        <p style={{ color: "#71717A", fontSize: 15 }}>
          Resumen general de la barbería
        </p>
      </div>

      {error && (
        <div style={{ padding: 14, background: "#450A0A", color: "#FCA5A5", borderRadius: 8, fontSize: 14, border: "1px solid #EF4444" }}>
          {error}
        </div>
      )}

      <div className="grid-admin-stats">
        {metricCards.map((card) => (
          <div
            key={card.label}
            style={{
              padding: 20,
              background: "#18181B",
              border: "1px solid #27272A",
              borderRadius: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ display: "block", fontSize: 12, color: "#71717A", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {card.label}
              </span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(212, 175, 55, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
            <span
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.04em",
                color: "#FAFAFA",
              }}
            >
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {stats && (
        <div
          style={{
            padding: 28,
            background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
            borderRadius: 16,
            color: "#18181B",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ display: "block", fontSize: 13, opacity: 0.7, marginBottom: 4, fontWeight: 500 }}>
                Ingresos Totales
              </span>
              <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.04em" }}>
                ${stats.ingresosTotales.toLocaleString()}
              </span>
              <span style={{ display: "block", fontSize: 13, opacity: 0.7, marginTop: 4, fontWeight: 500 }}>
                De todas las citas completadas
              </span>
            </div>
            <div style={{ padding: 20, background: "rgba(0,0,0,0.15)", borderRadius: 12 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#18181B" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
