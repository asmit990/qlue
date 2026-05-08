import Login from "@/components/login";
import { useNavigate } from "react-router-dom";




  export default  function LoginPage() {
        const navi = useNavigate()
    if (localStorage.getItem("user")) {
       () => {navi("/ask")}
      return null; // Render nothing while redirecting
    }
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Login />
    </div>
  );
}