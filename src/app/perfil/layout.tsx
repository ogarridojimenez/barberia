"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 50 }}>
        <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/dashboard">
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>Barbería</span>
          </Link>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <Link href="/citas" style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Citas</Link>
            <Link href="/perfil" style={{ fontSize: 14, color: pathname === "/perfil" ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: pathname === "/perfil" ? 500 : 400 }}>Perfil</Link>
          </div>
        </nav>
      </header>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
}
