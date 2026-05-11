import Login from "@/components/login";
import { useNavigate } from "react-router-dom";




 export default function LoginPage() {
  const navi = useNavigate();
  
  if (localStorage.getItem("token")) {
    navi("/ask");
    return null;
  }

  return <Login />;
}
