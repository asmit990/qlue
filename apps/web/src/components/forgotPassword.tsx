import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username) {
      setMessage("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgetpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset link sent to your email.");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setMessage("Could not connect to server.");
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
          backgroundSize: '32px 32px' 
        }}
      />

      {/* Top Navigation Bar */}
      <nav className="relative z-20 border-b border-black bg-white flex items-center justify-between p-4 md:px-10 md:h-20">
        <div className="flex items-center gap-4 md:gap-6">
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">Qlue</span>
          <div className="h-6 w-px bg-black/10 hidden md:block" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hidden md:block">
            System Interface // Reset
          </span>
        </div>
        <a 
          href="/login" 
          className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-black px-4 md:px-5 py-2 hover:bg-black hover:text-white transition-all whitespace-nowrap"
        >
          Back to Login
        </a>
      </nav>

      {/* Main Content Split */}
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
                Access Protocol // Recovery
              </span>

              <h1 className="text-6xl lg:text-8xl font-black leading-[0.85] tracking-[-0.04em] uppercase italic">
                Protocol <br /> 
                <span className="not-italic text-transparent bg-clip-text" style={{ WebkitTextStroke: '1.5px black' }}>
                  Override 
                </span> <br />
                Initiated.
              </h1>

              <p className="mt-10 text-xs font-bold uppercase tracking-widest text-gray-500 max-w-sm leading-loose">
                Provide your registered credentials to initiate a secure system access recovery sequence.
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
                Recovery Interface
              </h2>
            </div>

            {/* Status Message Block */}
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-8 p-4 text-[10px] font-black uppercase tracking-[0.2em] border border-black ${
                  message.includes("sent")
                    ? "bg-black text-white"
                    : "bg-red-500 text-black"
                }`}
              >
                {message}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-0 bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col">
                
                {/* Username Input */}
                <div className="group border-b border-black flex flex-col p-6 hover:bg-gray-50 transition-colors">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-black transition-colors mb-2">
                    System Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ENTER USERNAME..."
                    className="bg-transparent text-sm md:text-base font-bold uppercase tracking-widest text-black focus:outline-none placeholder:text-gray-200"
                  />
                </div>

                {/* Email Input */}
                <div className="group border-b border-black flex flex-col p-6 hover:bg-gray-50 transition-colors">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-black transition-colors mb-2">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER EMAIL..."
                    className="bg-transparent text-sm md:text-base font-bold uppercase tracking-widest text-black focus:outline-none placeholder:text-gray-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-20 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gray-800 transition-colors flex items-center justify-center group"
              >
                {loading ? "Transmitting..." : (
                  <span className="flex items-center gap-3">
                    Send Reset Protocol
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </span>
                )}
              </button>
            </form>

            <div className="mt-12 flex justify-center">
              <a href="/register" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors underline underline-offset-4">
                Need a new node? Request Access
              </a>
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