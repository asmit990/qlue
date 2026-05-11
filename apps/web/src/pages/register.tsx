import Register from "@/components/register";
import { useNavigate } from "react-router-dom";



export default function RegisterPage() {
  const navi = useNavigate();
  
  if (localStorage.getItem("token")) {
    navi("/ask");
    return null;
  }

  return <Register />;
}
