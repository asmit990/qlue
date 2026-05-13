
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { exportCSV, exportJSON } from "../components/essential";

interface ExportDropdownProps {
  rows: Record<string, any>[];
  question: string;
}


export default function ExportDropdown({ rows, question }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const slug = question.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
  const filename = `qlue-${slug}-${Date.now()}`;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCopy = async () => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]).join("\t");
    const body = rows.map((r) => Object.values(r).join("\t")).join("\n");
    await navigator.clipboard.writeText(`${headers}\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={!rows.length}
        className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 hover:invert transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
      >
        Export
        <span className="text-[8px]">{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-44 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden"
          >
            {[
              {
                label: "Download CSV",
                sub: "Spreadsheet-ready",
                icon: "⬇",
                action: () => { exportCSV(rows, filename); setOpen(false); },
              },
              {
                label: "Download JSON",
                sub: "Raw structured data",
                icon: "⬇",
                action: () => { exportJSON(rows, filename); setOpen(false); },
              },
              {
                label: copied ? "Copied!" : "Copy as TSV",
                sub: "Paste into Excel / Sheets",
                icon: copied ? "✓" : "⎘",
                action: handleCopy,
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-black hover:text-white transition-colors text-left group border-b border-black/10 last:border-b-0"
              >
                <span className="text-base leading-none mt-0.5">{item.icon}</span>
                <span className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
                  <span className="text-[8px] font-bold uppercase text-gray-400 group-hover:text-white/60">{item.sub}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}