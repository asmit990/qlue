import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const navi = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!form.username || !form.password || !form.confirm) {
      return setMsg({ text: "All fields are required.", type: "error" });
    }

    if (form.password !== form.confirm) {
      return setMsg({ text: "Passwords do not match.", type: "error" });
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          username: form.username,
          password: form.password,
          confirm: form.confirm,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg({ text: "Account created! Redirecting...", type: "success" });
        setTimeout(() => window.location.href = "/login", 1500); // Usually safer to route to login to get the JWT token
      } else {
        setMsg({ text: data.error || "Registration failed.", type: "error" });
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
      
      {/* Background Dot Grid */}
      <div
        className="fixed inset-0 opacity-[0.6] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Navigation Bar */}
      <nav className="relative z-20 border-b border-black bg-white flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-10 md:h-20 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <span 
            onClick={() => navi("/")} 
            className="text-xl md:text-2xl font-black tracking-tighter  cursor-pointer hover:opacity-50 transition-opacity"
          >
            Qlue
          </span>
          <div className="h-6 w-px bg-black/10 hidden md:block" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hidden md:block">
            System Interface // Node Init
          </span>
        </div>
        <div className="flex items-center gap-6 text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase">
          <a onClick={() => navi("/about")} className="text-gray-400 hover:text-black transition-colors cursor-pointer">About</a>
          <a href="/login" className="border border-black px-4 md:px-5 py-2 hover:bg-black hover:text-white transition-all whitespace-nowrap">
            Sign In
          </a>
        </div>
      </nav>

      {/* Main Content Split */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row">
        
        {/* Left Side: Editorial Context (Hidden on Mobile) */}
        <section className="hidden md:flex flex-1 flex-col justify-center p-10 lg:p-20 border-r border-black bg-white/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 block">
                Identity Protocol // Join the Collective
              </span>
              <h1 className="text-6xl lg:text-8xl font-black leading-[0.85] tracking-[-0.04em] uppercase italic">
                Refining <br />
                <span className="not-italic text-transparent bg-clip-text" style={{ WebkitTextStroke: "1.5px black" }}>
                  Business
                </span> <br />
                Intelligence.
              </h1>
              <p className="mt-10 text-xs font-bold uppercase tracking-widest text-gray-500 max-w-sm leading-loose">
                Establishing a new standard for data interaction. Initialize your secure identity to begin.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Right Side: The Form Canvas */}
        <section className="flex-[1.2] bg-gray-50/50 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b-2 border-black pb-4 inline-block">
                Account Initialization
              </h2>
            </div>

            {msg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-8 p-4 text-[10px] font-black uppercase tracking-[0.2em] border border-black ${
                  msg.type === "error"
                    ? "bg-red-500 text-black"
                    : "bg-black text-white"
                }`}
              >
                {msg.text}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-0 bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col">
                <FullPageInput 
                  label="Full Name" 
                  name="fullName" 
                  placeholder="ENTER NAME..." 
                  value={form.fullName} 
                  onChange={handleChange} 
                  className="border-b border-black"
                />
                <FullPageInput 
                  label="System Username" 
                  name="username" 
                  placeholder="ENTER USERNAME..." 
                  value={form.username} 
                  onChange={handleChange} 
                  className="border-b border-black"
                />
                <FullPageInput 
                  label="Registered Email" 
                  name="email" 
                  type="email" 
                  placeholder="ENTER EMAIL..." 
                  value={form.email} 
                  onChange={handleChange} 
                  className="border-b border-black"
                />
                
                {/* Responsive Grid for Passwords */}
                <div className="flex flex-col sm:flex-row border-b border-black">
                  <FullPageInput 
                    label="Secret Key" 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={handleChange} 
                    className="flex-1 border-b sm:border-b-0 sm:border-r border-black" 
                  />
                  <FullPageInput 
                    label="Verify Key" 
                    name="confirm" 
                    type="password" 
                    placeholder="••••••••" 
                    value={form.confirm} 
                    onChange={handleChange} 
                    className="flex-1 border-b sm:border-b-0 sm:border-r border-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-20 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gray-800 transition-colors flex items-center justify-center group disabled:bg-gray-400"
              >
                {loading ? "Establishing Uplink..." : (
                  <span className="flex items-center gap-3">
                    Create Identity
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </span>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Already have a node?{" "}
                <a href="/login" className="text-black hover:text-gray-500 transition-colors underline underline-offset-4">
                  Sign In
                </a>
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-black bg-white flex flex-col sm:flex-row items-center justify-between p-4 md:px-10 md:h-12 gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em]">
        <div className="flex gap-4 md:gap-8">
          <span className="text-gray-400">Node: Local</span>
          <span className="text-green-500">Uplink Stable</span>
        </div>
        <div className="text-gray-400">© 2026 Qlue Systems</div>
      </footer>
    </div>
  );
}


function FullPageInput({ label, className = "", ...props }: any) {
  const isPassword = props.type === "password";
  
  return (
    <div className={`group flex flex-col p-6 bg-white hover:bg-gray-50 transition-colors ${className}`}>
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-black transition-colors mb-2">
        {label}
      </label>
      <input 
        {...props} 
 
        autoComplete={isPassword ? "new-password" : "off"}
        className={`bg-transparent w-full text-sm md:text-base font-bold text-black focus:outline-none placeholder:text-gray-200 py-1 ${
          !isPassword ? "uppercase tracking-widest" : "tracking-normal font-mono text-xl"
        }`} 
      />
    </div>
  );
}