import { HTMLAttributes, forwardRef } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width, height, rounded = false, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: width || "100%",
          height: height || 20,
          borderRadius: rounded ? "50%" : 8,
          background: "linear-gradient(90deg, #27272A 25%, #3F3F46 50%, #27272A 75%)",
          backgroundSize: "200% 100%",
          animation: "skeleton 1.5s ease-in-out infinite",
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Componentes de skeleton predefinidos para patrones comunes
export function SkeletonCard() {
  return (
    <div style={{
      padding: 24,
      background: "#18181B",
      border: "1px solid #27272A",
      borderRadius: 12,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={24} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{
      background: "#18181B",
      border: "1px solid #27272A",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid #27272A",
        background: "#27272A",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
      }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="80%" height={12} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "16px",
            borderBottom: "1px solid #27272A",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          <Skeleton width="90%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="50%" height={14} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div style={{
      padding: 24,
      background: "#18181B",
      border: "1px solid #27272A",
      borderRadius: 12,
      display: "flex",
      flexDirection: "column",
      gap: 20,
    }}>
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <Skeleton width="30%" height={12} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={44} />
        </div>
      ))}
      <Skeleton width={140} height={44} />
    </div>
  );
}

// CSS para la animación (agregar a globals.css o inline)
export const skeletonStyles = `
  @keyframes skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
