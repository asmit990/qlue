import { Navigate } from "react-router-dom";
import Login from "@/components/login";

export default function LoginPage() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/ask" replace />;
  }

  return <Login />;
}