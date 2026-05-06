import Login from "@/components/login";





  export default  function LoginPage() {
    if (localStorage.getItem("user")) {
      window.location.href = "/ask"; // Redirect to /ask if already registered
      return null; // Render nothing while redirecting
    }
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Login />
    </div>
  );
}