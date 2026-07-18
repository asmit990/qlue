import { useState } from "react";
import { Link, Check } from "lucide-react";

interface ShareChartProps {
  question: string;
  chartType: string;
  chartData: any[]; // The aggregated data passed to Recharts
}

export default function ShareChartButton({ question, chartType, chartData }: ShareChartProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // 1. Create a minimal payload
    const payload = {
      q: question,
      t: chartType,
      d: chartData,
    };

    // 2. Turn it into a string and Base64 encode it so it fits in a URL safely
    const encodedPayload = btoa(encodeURIComponent(JSON.stringify(payload)));
    
    // 3. Create the share link pointing to a new /view route
    const shareUrl = `${window.location.origin}/view?snapshot=${encodedPayload}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = shareUrl;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`
        flex items-center gap-3 px-6 py-3 border border-black 
        text-[10px] font-black uppercase tracking-[0.2em] transition-all
        ${copied ? "bg-green-500 text-black border-green-500" : "bg-white text-black hover:bg-black hover:text-white"}
      `}
    >
      {copied ? <Check size={14} strokeWidth={3} /> : <Link size={14} strokeWidth={3} />}
      {copied ? "Snapshot Copied" : "Share Chart Link"}
    </button>
  );
}
