"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/admin/citas", label: "Citas", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/admin/barberos", label: "Barberos", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { href: "/admin/servicios", label: "Servicios", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#1a1a1a" }}>
      <aside style={{ width: 260, background: "#18181B", borderRight: "1px solid #27272A", position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #27272A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181B" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <Link href="/admin" style={{ fontSize: 16, fontWeight: 600, color: "#FAFAFA", letterSpacing: "-0.02em", textDecoration: "none" }}>
                Gentleman&apos;s Cut
              </Link>
              <span style={{ display: "block", fontSize: 11, color: "#D4AF37", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Panel Admin</span>
            </div>
          </div>
        </div>
        
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <div style={{ marginBottom: 8, padding: "0 12px", fontSize: 11, color: "#71717A", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Menú</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  background: isActive ? "#27272A" : "transparent",
                  color: isActive ? "#FAFAFA" : "#A1A1AA",
                  marginBottom: 2,
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#D4AF37" : "#71717A"} strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div style={{ padding: "16px 12px", borderTop: "1px solid #27272A" }}>
          <Link
            href="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 8, fontSize: 14, color: "#A1A1AA", textDecoration: "none", marginBottom: 8 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Vista cliente
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px",
              borderRadius: 8,
              fontSize: 14,
              color: "#EF4444",
              background: "rgba(239, 68, 68, 0.1)",
              border: "none",
              width: "100%",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
