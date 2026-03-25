import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", children, style, ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: "#18181B",
        border: "1px solid #27272A",
      },
      elevated: {
        background: "#18181B",
        border: "1px solid #27272A",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
    };

    return (
      <div
        ref={ref}
        style={{
          borderRadius: 12,
          padding: 24,
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h3 style={{
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: "-0.01em",
      color: "#FAFAFA",
      margin: 0,
      ...style,
    }}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontSize: 14,
      color: "#71717A",
      margin: 0,
      marginTop: 4,
      ...style,
    }}>
      {children}
    </p>
  );
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ ...style }}>
      {children}
    </div>
  );
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      marginTop: 16,
      paddingTop: 16,
      borderTop: "1px solid #27272A",
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      ...style,
    }}>
      {children}
    </div>
  );
}
