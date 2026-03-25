import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, ...props }, ref) => {
    return (
      <div style={{ width: "100%" }}>
        {label && (
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 8,
              color: "#A1A1AA",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 14,
            border: `1px solid ${error ? "#EF4444" : "#3F3F46"}`,
            borderRadius: 8,
            background: "#27272A",
            color: "#FAFAFA",
            outline: "none",
            transition: "border-color 0.15s ease",
            ...style,
          }}
          {...props}
        />
        {error && (
          <p
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#FCA5A5",
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
