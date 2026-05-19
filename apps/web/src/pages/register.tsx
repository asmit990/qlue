import { Navigate } from "react-router-dom";
import Register from "@/components/register";

export default function RegisterPage() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/ask" replace />;
  }

  return <Register />;
}