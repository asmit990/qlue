import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
        localStorage.setItem("token", data.token);
        setMsg({ text: "Access granted. Initializing...", type: "success" });
        setTimeout(() => window.location.href = "/ask", 1500);
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
    // CHANGED: min-h-[100dvh] for mobile, pure white bg, selection colors
    <div className="min-h-[100dvh] w-full bg-white text-black font-sans flex flex-col selection:bg-black selection:text-white">
      
      {/* 1. Global Background (Dot Grid) */}
      <div 
        className="fixed inset-0 opacity-[0.6] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`, 
          backgroundSize: '32px 32px' 
        }}
      />

      {/* 2. Top Navigation Bar */}
      <nav className="relative z-20 border-b border-black bg-white flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-10 md:h-20 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <span 
            onClick={() => navigate("/")} 
            className="text-xl md:text-2xl font-black tracking-tighter uppercase cursor-pointer hover:opacity-50 transition-opacity"
          >
            Qlue
          </span>
          <div className="h-6 w-px bg-black/10 hidden md:block" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hidden md:block">
            System Interface // Auth
          </span>
        </div>
        <div className="flex items-center gap-6 text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase">
          <a href="/about" className="text-gray-400 hover:text-black transition-colors">About</a>
          <a href="/register" className="border border-black px-4 md:px-5 py-2 hover:bg-black hover:text-white transition-all whitespace-nowrap">
            Register Node
          </a>
        </div>
      </nav>

      {/* 3. Main Content Split */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row">
        
        {/* Left Side: Editorial Context (Hidden on Mobile) */}
        <section className="hidden md:flex flex-1 flex-col justify-center p-10 lg:p-20 border-r border-black bg-white/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 block">
                Access Protocol // Authentication
              </span>

              <h1 className="text-6xl lg:text-8xl font-black leading-[0.85] tracking-[-0.04em] uppercase italic">
                System <br /> 
                <span className="not-italic text-transparent bg-clip-text" style={{ WebkitTextStroke: '1.5px black' }}>
                  Access 
                </span> <br />
                Required.
              </h1>

              <p className="mt-10 text-xs font-bold uppercase tracking-widest text-gray-500 max-w-sm leading-loose">
                Authenticate your identity to resume data operations and interactive dashboard access.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Right Side: The Form Canvas */}
        <section className="flex-[1.2] bg-gray-50/50 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b-2 border-black pb-4 inline-block">
                Authentication Interface
              </h2>
            </div>

            {msg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-8 p-4 text-[10px] font-black uppercase tracking-[0.2em] border border-black ${
                  msg.type === 'error' ? 'bg-red-500 text-black' : 'bg-black text-white'
                }`}
              >
                {msg.text}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-0 bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col">
                <FullPageInput 
                  label="System Username"
                  name="username"
                  type="text"
                  placeholder="ENTER USERNAME..."
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-20 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gray-800 transition-all flex items-center justify-center group disabled:bg-gray-400"
              >
                {loading ? "Authenticating..." : (
                  <span className="flex items-center gap-3">
                    Initialize Session
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </span>
                )}
              </button>
            </form>

            {/* FIX: Moved Forget Password OUT of the form and removed type="submit" */}
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/forgetpassword")}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors underline underline-offset-4"
              >
                Forget Password? Request Override
              </button>
            </div>
            
          </motion.div>
        </section>
      </main>

      {/* 4. Bottom Grid Status Bar */}
      <footer className="relative z-20 border-t border-black bg-white flex flex-col sm:flex-row items-center justify-between p-4 md:px-10 md:h-12 gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em]">
        <div className="flex gap-4 md:gap-8">
          <span className="text-gray-400">Node: Local</span>
          <span className={loading ? "text-yellow-500" : "text-green-500"}>
            {loading ? "Verifying..." : "Awaiting Auth"}
          </span>
        </div>
        <div className="text-gray-400">© 2026 Qlue Systems</div>
      </footer>
    </div>
  );
}

// Updated Input Component for Brutalist styling
function FullPageInput({ label, className = "", ...props }: any) {
  return (
    <div className={`group border-b border-black flex flex-col p-6 bg-white hover:bg-gray-50 transition-colors ${className}`}>
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-black transition-colors mb-2">
        {label}
      </label>
      <input
        {...props}
        className="bg-transparent text-sm md:text-base font-bold uppercase tracking-widest text-black focus:outline-none placeholder:text-gray-200 py-1"
      />
    </div>
  );
}