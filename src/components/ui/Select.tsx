import { SelectHTMLAttributes, forwardRef, useId } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, style, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div style={{ width: "100%" }}>
        {label && (
          <label
            htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
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
            cursor: "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2371717A' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            ...style,
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = "Select";
