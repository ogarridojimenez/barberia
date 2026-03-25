"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/auth/client";
import { Skeleton, SkeletonCard } from "@/components/ui";

interface User {
  id: string;
  email: string;
}

interface DashboardStats {
  citasProximas: number;
  citasCompletadas: number;
  totalCitas: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [userData, statsData] = await Promise.all([
        apiGet<{ user: User }>("/api/me"),
        apiGet<DashboardStats>("/api/dashboard/stats"),
      ]);
      setUser(userData.user);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Skeleton para saludo */}
        <div>
          <Skeleton width="40%" height={28} style={{ marginBottom: 8 }} />
          <Skeleton width="30%" height={15} />
        </div>

        {/* Skeleton para stats cards */}
        <div className="grid-stats">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Skeleton para acciones rápidas */}
        <div>
          <Skeleton width="20%" height={16} style={{ marginBottom: 16 }} />
          <div className="grid-quick-actions">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    { label: "Citas próximas", value: String(stats?.citasProximas ?? 0), href: "/citas" },
    { label: "Citas completadas", value: String(stats?.citasCompletadas ?? 0), href: "/citas" },
    { label: "Total citas", value: String(stats?.totalCitas ?? 0), href: "/citas" },
  ];

  const quickActions = [
    {
      title: "Mis Citas",
      description: "Ver y gestionar tus reservas",
      href: "/citas",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      title: "Nueva Cita",
      description: "Agendar una nueva reserva",
      href: "/citas/nueva",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      ),
    },
    {
      title: "Mi Perfil",
      description: "Editar tu información",
      href: "/perfil",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginBottom: 8,
            color: "#FAFAFA",
          }}
        >
          Hola{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p style={{ color: "#71717A", fontSize: 15 }}>
         Bienvenido a tu panel de barbería
        </p>
      </div>

      <div className="grid-stats">
        {statsCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            style={{
              display: "block",
              padding: 24,
              background: "#18181B",
              border: "1px solid #27272A",
              borderRadius: 12,
              transition: "border-color 0.15s",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 12,
                color: "#71717A",
                marginBottom: 8,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {stat.label}
            </span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 600,
                letterSpacing: "-0.04em",
                color: "#FAFAFA",
              }}
            >
              {stat.value}
            </span>
          </Link>
        ))}
      </div>

      <div>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 16,
            letterSpacing: "-0.01em",
            color: "#FAFAFA",
          }}
        >
          Acciones rápidas
        </h2>
        <div className="grid-quick-actions">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              style={{
                display: "block",
                padding: 24,
                background: "#18181B",
                border: "1px solid #27272A",
                borderRadius: 12,
                transition: "border-color 0.15s",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  padding: 10,
                  borderRadius: 8,
                  background: "rgba(212, 175, 55, 0.1)",
                  marginBottom: 16,
                  color: "#D4AF37",
                }}
              >
                {action.icon}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 15,
                  fontWeight: 500,
                  marginBottom: 4,
                  color: "#FAFAFA",
                }}
              >
                {action.title}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#71717A",
                }}
              >
                {action.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
