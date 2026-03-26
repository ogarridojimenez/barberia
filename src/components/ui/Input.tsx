import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div style={{ width: "100%" }}>
        {label && (
          <label
            htmlFor={inputId}
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
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={errorId}
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
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
            ...style,
          }}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
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
