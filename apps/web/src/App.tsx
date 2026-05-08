import { Routes, Route, Router } from "react-router-dom";
import Navbar from "./components/navbar";
import Landing from "./pages/landing";
import AboutUs from "./pages/aboutUs";
import Ask from "./pages/ask";
import Dashboard from "./pages/dashboard";
import RegisterPage from "./pages/register";
import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <div className="relative min-h-screen w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-auto">
     
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/ask"
          element={
         //   <ProtectedRoute>
              <Ask />
       //    </ProtectedRoute>
          }
        />
      </Routes>
      <Navbar />
    </div>
  );
}