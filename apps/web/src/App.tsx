import { Routes, Route, Navigate} from "react-router-dom";
import Navbar from "./components/navbar";
import Landing from "./pages/landing";
import AboutUs from "./pages/aboutUs";
import Ask from "./pages/ask";
import Dashboard from "./pages/dashboard";
import RegisterPage from "./pages/register";
import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgetPasswordPage from "./pages/forgetpassword";
import ResetPassword from "./components/resetPassword";
import OAuthCallback from "./pages/oauthCallback";



export default function App() {
  return (
    <div className="relative min-h-screen w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-auto">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgetpassword" element={<ForgetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* These match the OAuth redirect URIs registered with the providers. */}
        <Route path="/connectors/google/callback" element={<OAuthCallback provider="google" />} />
        <Route path="/connectors/microsoft/callback" element={<OAuthCallback provider="microsoft" />} />
        <Route path="/auth/google/callback" element={<OAuthCallback provider="google" />} />
        <Route path="/auth/microsoft/callback" element={<OAuthCallback provider="microsoft" />} />
        <Route path="/ask" element={
          <ProtectedRoute>
            <Ask />
          </ProtectedRoute>
        } />
       <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Navbar />
    </div>
  );
}
