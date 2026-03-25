"use client";

import { useState, useRef, ChangeEvent } from "react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  error?: string;
}

export function ImageUpload({ value, onChange, label, error }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede ser mayor a 5MB");
      return;
    }

    // Crear preview local
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      // Por ahora usamos data URL. En producción, subir a Supabase Storage
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor arrastra una imagen");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

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

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? "#D4AF37" : error ? "#EF4444" : "#3F3F46"}`,
          borderRadius: 12,
          padding: preview ? 12 : 32,
          textAlign: "center",
          cursor: "pointer",
          background: isDragging ? "rgba(212, 175, 55, 0.1)" : "#27272A",
          transition: "all 0.2s ease",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          aria-label="Seleccionar foto"
        />

        {preview ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #D4AF37",
              }}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              aria-label="Eliminar foto"
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#EF4444",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#71717A"
              strokeWidth="1.5"
              style={{ margin: "0 auto 12px" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p style={{ color: "#71717A", fontSize: 14, margin: 0 }}>
              Arrastra una imagen o <span style={{ color: "#D4AF37" }}>haz clic para seleccionar</span>
            </p>
            <p style={{ color: "#52525B", fontSize: 12, margin: "8px 0 0" }}>
              PNG, JPG o WEBP (máx. 5MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p
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
