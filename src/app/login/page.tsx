import { Suspense } from "react";
import LoginForm from "./login-form";

function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a1a",
        padding: 24,
      }}
    >
      <div style={{ color: "#71717A" }}>Cargando...</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  );
}
