"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { maxWidth: 400 },
    md: { maxWidth: 560 },
    lg: { maxWidth: 720 },
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={(e) => {
        if (e.target === overlayRef.current && onClose) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          ...sizeStyles[size],
          background: "#18181B",
          border: "1px solid #27272A",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          animation: "modalIn 0.2s ease-out",
        }}
      >
        {title && (
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #27272A",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 id="modal-title" style={{ fontSize: 18, fontWeight: 600, color: "#FAFAFA", margin: 0 }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                background: "transparent",
                border: "none",
                color: "#71717A",
                cursor: "pointer",
                padding: 8,
                borderRadius: 8,
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

export function ModalFooter({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 16,
        borderTop: "1px solid #27272A",
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
