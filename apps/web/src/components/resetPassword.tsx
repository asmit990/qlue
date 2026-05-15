import React, { useState } from "react";
import {  useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Qlue Full-Page Password Reset
 * Aesthetic: Square Editorial / Modular Grid
 */
export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirm) {
      setMessage("All fields are required.");
      return;
    }



    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Security protocol updated. Re-establishing link...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch {
      setMessage("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#fafafa] text-[#1a1a1a] font-sans flex flex-col overflow-hidden">
      {/* 1. Global Background (Dot Grid) */}
      <div 
        className="absolute inset-0 opacity-[0.6] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`, 
          backgroundSize: '32px 32px' 
        }}
      ></div>

      {/* 2. Top Navigation Bar */}
      <nav className="relative z-20 h-20 border-b border-gray-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-10">
        <div className="text-3xl font-extrabold tracking-tighter uppercase">Qlue</div>
        <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          <button 
            onClick={() => navigate("/login")}
            className="px-5 py-2 border border-black text-black hover:bg-black hover:text-white transition-all uppercase tracking-[0.2em] font-black text-[10px]"
          >
            Abort Protocol
          </button>
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
              {/* The Eyebrow: Pure Data-Style Label */}
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-8 block">
                Security Node // Update
              </span>

              {/* The Headline: Heavy Sans-Serif */}
              <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-[-0.04em] uppercase italic">
                Credentials <br /> 
                <span className="not-italic text-transparent bg-clip-text" style={{ WebkitTextStroke: '1.5px black' }}>
                  Cleared.
                </span> <br />
                Awaiting Input.
              </h1>

              {/* The Subtext: Minimalist and Sharp */}
              <p className="mt-10 text-xs font-bold uppercase tracking-widest text-gray-400 max-w-sm leading-loose">
                Establish a new secure passphrase to restore your system access and synchronize your node.
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
                Encryption Configuration
              </h2>
            </div>

            {/* Status Message Block */}
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 text-[10px] font-black uppercase tracking-widest border ${
                  message.includes("updated")
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] bg-white">
              <div className="grid grid-cols-1 border-t border-l border-r border-gray-200">
                
                {/* New Password Input */}
                <div className="group border-b border-gray-200 flex flex-col p-4 hover:bg-gray-50 transition-colors">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300 group-focus-within:text-black transition-colors mb-1">
                    New Passphrase
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent text-sm focus:outline-none placeholder:text-gray-200 font-medium py-1"
                  />
                </div>

                {/* Confirm Password Input */}
                <div className="group border-b border-gray-200 flex flex-col p-4 hover:bg-gray-50 transition-colors">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300 group-focus-within:text-black transition-colors mb-1">
                    Verify Passphrase
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent text-sm focus:outline-none placeholder:text-gray-200 font-medium py-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all flex items-center justify-center group border border-black"
              >
                {loading ? "Encrypting..." : (
                  <span className="flex items-center gap-2">
                    Execute Overwrite
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                )}
              </button>
            </form>
          </motion.div>
        </section>
      </main>

      {/* 4. Bottom Grid Status Bar */}
      <footer className="relative z-20 h-14 border-t border-gray-200 bg-white flex items-center justify-between px-10">
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          System Status: <span className="text-amber-500">Awaiting Input</span>
        </div>
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          © 2026 Qlue. Intelligence for All.
        </div>
      </footer>
    </div>
  );
}