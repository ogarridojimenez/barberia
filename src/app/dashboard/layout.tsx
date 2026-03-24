"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  }

  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a" }}>
      <header
        style={{
          borderBottom: "1px solid #27272A",
          background: "#18181B",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <nav
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/dashboard">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18181B" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "#FAFAFA",
                }}
              >
                Gentleman&apos;s Cut
              </span>
            </div>
          </Link>

          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <Link
              href="/citas"
              style={{
                fontSize: 14,
                color: "#A1A1AA",
                transition: "color 0.15s",
              }}
            >
              Citas
            </Link>
            <Link
              href="/perfil"
              style={{
                fontSize: 14,
                color: "#A1A1AA",
                transition: "color 0.15s",
              }}
            >
              Perfil
            </Link>
            <button
              onClick={handleLogout}
              style={{
                fontSize: 14,
                color: "#EF4444",
                background: "rgba(239, 68, 68, 0.1)",
                border: "none",
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: 6,
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
}
