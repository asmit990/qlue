import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isRegistered = localStorage.getItem("user"); // or your auth state/token
 const isLogin = localStorage.getItem("user"); // or your auth state/token
  if (!isRegistered || !isLogin) {
   return <Navigate to={isRegistered ? "/login" : "/register"} replace />;
  }

  return <>{children}</>;
}
