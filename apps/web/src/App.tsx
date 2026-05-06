import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Landing from "./pages/landing";
import AboutUs from "./pages/aboutUs";
import Ask from "./pages/ask";
import Header from "./components/header";
import RegisterPage from "./pages/register";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="relative min-h-screen w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-auto">
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route
          path="/ask"
          element={
            <ProtectedRoute>
              <Ask />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Navbar />
    </div>
  );
}