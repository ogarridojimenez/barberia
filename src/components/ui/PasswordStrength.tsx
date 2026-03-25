"use client";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const getStrength = (): { score: number; label: string; color: string } => {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Débil", color: "#EF4444" };
    if (score <= 4) return { score, label: "Media", color: "#F59E0B" };
    return { score, label: "Fuerte", color: "#22C55E" };
  };

  const strength = getStrength();
  const percentage = Math.min(100, (strength.score / 6) * 100);

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          height: 4,
          background: "#27272A",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: strength.color,
            borderRadius: 2,
            transition: "all 0.2s ease",
          }}
        />
      </div>
      <p
        style={{
          marginTop: 6,
          fontSize: 12,
          color: strength.color,
          fontWeight: 500,
        }}
      >
        Fortaleza: {strength.label}
      </p>
      <ul
        style={{
          marginTop: 4,
          fontSize: 11,
          color: "#71717A",
          paddingLeft: 16,
          margin: 0,
        }}
      >
        <li style={{ color: password.length >= 8 ? "#22C55E" : "#71717A" }}>
          Mínimo 8 caracteres
        </li>
        <li style={{ color: /[A-Z]/.test(password) ? "#22C55E" : "#71717A" }}>
          Una mayúscula
        </li>
        <li style={{ color: /[0-9]/.test(password) ? "#22C55E" : "#71717A" }}>
          Un número
        </li>
        <li style={{ color: /[^a-zA-Z0-9]/.test(password) ? "#22C55E" : "#71717A" }}>
          Un carácter especial
        </li>
      </ul>
    </div>
  );
}
