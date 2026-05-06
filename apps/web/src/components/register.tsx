import React, { useState } from "react";
import { motion } from "framer-motion";

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
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg({ text: "Account created! Redirecting...", type: "success" });
        setTimeout(() => window.location.href = "/login", 1500);
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
    <div className="h-screen w-full bg-[#fafafa] text-[#1a1a1a] font-sans flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#adadad 0.75px, transparent 0.75px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <nav className="relative z-20 h-20 border-b border-gray-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-10">
        <div className="text-3xl font-extrabold tracking-tighter uppercase">Qlue</div>
        <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          <a href="#" className="hover:text-black transition-colors">About</a>
          <a href="/login" className="px-5 py-2 border border-black text-black hover:bg-black hover:text-white transition-all">Sign In</a>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col md:flex-row">
        <section className="hidden md:flex flex-1 flex-col justify-center p-20 border-r border-gray-200">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-8 block">
                Identity Protocol // Join the Collective
              </span>
              <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-[-0.04em] uppercase italic">
                Refining <br />
                <span className="not-italic text-transparent bg-clip-text" style={{ WebkitTextStroke: "1.5px black" }}>
                  Business
                </span> <br />
                Intelligence.
              </h1>
              <p className="mt-10 text-xs font-bold uppercase tracking-widest text-gray-400 max-w-sm leading-loose">
                Establishing a new standard for data interaction. Initialize your secure identity to begin.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-6 sm:p-20 relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="mb-12">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-4">
                Account Initialization
              </h2>
            </div>

            {msg && (
              <div className={`mb-4 p-3 text-[11px] font-bold uppercase tracking-widest ${
                msg.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-0">
              <div className="grid grid-cols-1 border-t border-l border-r border-gray-200">
                <FullPageInput label="Full Name" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange} />
                <FullPageInput label="Username" name="username" placeholder="j_doe_99" value={form.username} onChange={handleChange} />
                <FullPageInput label="Email" name="email" type="email" placeholder="hello@qlue.ai" value={form.email} onChange={handleChange} />
                <div className="grid grid-cols-2">
                  <FullPageInput label="Secret Key" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} className="border-r" />
                  <FullPageInput label="Verify" name="confirm" type="password" placeholder="••••••••" value={form.confirm} onChange={handleChange} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all flex items-center justify-center group"
              >
                {loading ? "Establishing Uplink..." : (
                  <span className="flex items-center gap-2">
                    Create Identity
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Already have an account?{" "}
                <a href="/login" className="text-black underline underline-offset-4">Sign In</a>
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-20 h-14 border-t border-gray-200 bg-white flex items-center justify-between px-10">
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          System Status: <span className="text-green-500">Operational</span>
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
      <input {...props} className="bg-transparent text-sm focus:outline-none placeholder:text-gray-200 font-medium py-1" />
    </div>
  );
}