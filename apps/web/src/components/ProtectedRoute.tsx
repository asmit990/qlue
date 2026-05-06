import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isRegistered = localStorage.getItem("user"); // or your auth state/token

  if (!isRegistered) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
}
