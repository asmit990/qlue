import Register from "@/components/register";
import { useNavigate } from "react-router-dom";



  export default  function RegisterPage() {
    const navi = useNavigate()
    if (localStorage.getItem("user")) {
       () => {navi("/ask")}
      return null; // Render nothing while redirecting
    }
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Register />
    </div>
  );
}