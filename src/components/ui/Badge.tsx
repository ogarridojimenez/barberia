import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", children, style, ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: "rgba(161, 161, 170, 0.1)",
        color: "#A1A1AA",
      },
      success: {
        background: "rgba(34, 197, 94, 0.1)",
        color: "#86EFAC",
      },
      warning: {
        background: "rgba(250, 204, 21, 0.1)",
        color: "#FDE047",
      },
      error: {
        background: "rgba(239, 68, 68, 0.1)",
        color: "#FCA5A5",
      },
      info: {
        background: "rgba(59, 130, 246, 0.1)",
        color: "#93C5FD",
      },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: "4px 8px", fontSize: 11 },
      md: { padding: "6px 12px", fontSize: 12 },
    };

    return (
      <span
        ref={ref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontWeight: 600,
          borderRadius: 6,
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
