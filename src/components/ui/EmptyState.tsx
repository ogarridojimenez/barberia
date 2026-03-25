import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const defaultIcon = (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="8" y="12" width="48" height="40" rx="4" stroke="#3F3F46" strokeWidth="2" fill="none" />
      <path d="M8 20h48" stroke="#3F3F46" strokeWidth="2" />
      <circle cx="16" cy="16" r="2" fill="#3F3F46" />
      <circle cx="24" cy="16" r="2" fill="#3F3F46" />
      <circle cx="32" cy="16" r="2" fill="#3F3F46" />
      <path d="M24 32l4 4 8-8" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div
      role="status"
      aria-label={title}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        textAlign: "center",
      }}
    >
      <div
        style={{
          marginBottom: 16,
          opacity: 0.6,
        }}
      >
        {icon || defaultIcon}
      </div>

      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#FAFAFA",
          margin: 0,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 14,
            color: "#71717A",
            margin: 0,
            maxWidth: 320,
          }}
        >
          {description}
        </p>
      )}

      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

// Iconos predefinidos para estados vacíos comunes
export function EmptyCitasIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="12" y="8" width="40" height="48" rx="4" stroke="#3F3F46" strokeWidth="2" />
      <path d="M12 18h40" stroke="#3F3F46" strokeWidth="2" />
      <path d="M22 4v8M42 4v8" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 32h16M24 40h10" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyUsersIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="20" r="10" stroke="#3F3F46" strokeWidth="2" />
      <path d="M12 52c0-11 9-18 20-18s20 7 20 18" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 36l4 4 8-8" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyServiciosIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="20" height="20" rx="4" stroke="#3F3F46" strokeWidth="2" />
      <rect x="36" y="8" width="20" height="20" rx="4" stroke="#3F3F46" strokeWidth="2" />
      <rect x="8" y="36" width="20" height="20" rx="4" stroke="#3F3F46" strokeWidth="2" />
      <rect x="36" y="36" width="20" height="20" rx="4" stroke="#3F3F46" strokeWidth="2" />
    </svg>
  );
}
