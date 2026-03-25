import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, children, style, disabled, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      fontWeight: 600,
      borderRadius: 8,
      border: "none",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled || loading ? 0.6 : 1,
      transition: "all 0.15s ease",
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
        color: "#18181B",
        boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
      },
      secondary: {
        background: "#27272A",
        color: "#FAFAFA",
        border: "1px solid #3F3F46",
      },
      danger: {
        background: "rgba(239, 68, 68, 0.1)",
        color: "#FCA5A5",
        border: "1px solid rgba(239, 68, 68, 0.2)",
      },
      ghost: {
        background: "transparent",
        color: "#A1A1AA",
        border: "1px solid #3F3F46",
      },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: "8px 12px", fontSize: 12 },
      md: { padding: "12px 20px", fontSize: 14 },
      lg: { padding: "14px 28px", fontSize: 15 },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      >
        {loading ? "Cargando..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
