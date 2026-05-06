import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";



/**
 * Qlue Full-Page Login
 * Aesthetic: Square Editorial / Modular Grid
 */
export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.username || !form.password) {
      return setMsg({ text: "All fields are required.", type: "error" });
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg({ text: "Access granted. Initializing...", type: "success" });
        // Redirect to dashboard or home after successful login
        setTimeout(() => window.location.href = "/dashboard", 1500);
      } else {
        setMsg({ text: data.error || "Authentication failed.", type: "error" });
      }
    } catch {
      setMsg({ text: "Could not connect to server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#fafafa] text-[#1a1a1a] font-sans flex flex-col overflow-hidden">
      {/* 1. Global Background (Dot Grid) */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(#adadad 0.75px, transparent 0.75px)`, 
          backgroundSize: '24px 24px' 
        }}
      ></div>

      {/* 2. Top Navigation Bar */}
      <nav className="relative z-20 h-20 border-b border-gray-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-10">
        <span
  onClick={() => navigate("/")}
  className="text-3xl font-extrabold tracking-tighter uppercase"
>
  Qlue
</span>
        <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          <a href="/" className="hover:text-black transition-colors">About</a>
          <a href="/register" className="px-5 py-2 border border-black text-black hover:bg-black hover:text-white transition-all">
            Register
          </a>
        </div>
      </nav>

      {/* 3. Main Content Split */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row">
        
        {/* Left Side: Editorial Context */}
        <section className="hidden md:flex flex-1 flex-col justify-center p-20 border-r border-gray-200">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-8 block">
                Access Protocol // Authentication
              </span>

              <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-[-0.04em] uppercase italic">
                System <br /> 
                <span className="not-italic text-transparent bg-clip-text" style={{ WebkitTextStroke: '1.5px black' }}>
                  Access 
                </span> <br />
                Required.
              </h1>

              <p className="mt-10 text-xs font-bold uppercase tracking-widest text-gray-400 max-w-sm leading-loose">
                Authenticate your identity to resume data operations and interactive dashboard access.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Right Side: The Form Canvas */}
        <section className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-6 sm:p-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-12">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-4">
                Authentication Interface
              </h2>
            </div>

            {msg && (
              <div className={`mb-6 text-[10px] font-bold uppercase tracking-widest p-4 border ${
                msg.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
              }`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-0">
              <div className="grid grid-cols-1 border-t border-l border-r border-gray-200">
                <FullPageInput 
                  label="Username"
                  name="username"
                  type="text"
                  placeholder="hello@qlue.ai"
                  value={form.username}
                  onChange={handleChange}
                />
                <FullPageInput 
                  label="Secret Key"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all flex items-center justify-center group disabled:bg-gray-400"
              >
                {loading ? "Authenticating..." : (
                  <span className="flex items-center gap-2">
                    Initialize Session
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                )}
              </button>
            </form>

            <div className="mt-12 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest">
              <a href="#" className="hover:text-black transition-colors underline underline-offset-4">Forgot Protocol?</a>
              <a href="/register" className="hover:text-black transition-colors">Request Access</a>
            </div>
          </motion.div>
        </section>
      </main>

      {/* 4. Bottom Grid Status Bar */}
      <footer className="relative z-20 h-14 border-t border-gray-200 bg-white flex items-center justify-between px-10">
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          System Status: <span className={loading ? "text-yellow-500" : "text-green-500"}>
            {loading ? "Verifying..." : "Awaiting Auth"}
          </span>
        </div>
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          © 2026 Qlue. Intelligence for All.
        </div>
      </footer>
    </div>
  );
}

function FullPageInput({ label, className = "", ...props }: any) {
  return (
    <div className={`group border-b border-gray-200 flex flex-col p-4 bg-white hover:bg-gray-50 transition-colors ${className}`}>
      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300 group-focus-within:text-black transition-colors mb-1">
        {label}
      </label>
      <input
        {...props}
        className="bg-transparent text-sm focus:outline-none placeholder:text-gray-200 font-medium py-1"
      />
    </div>
  );
}