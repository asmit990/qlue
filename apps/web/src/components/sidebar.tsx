import { useEffect, useRef, useState } from "react";

interface HistoryItem {
  id: number;
  question: string;
  sql: string;
  chart_type: string;
  created_at: string;
}

interface Props {
  onSelect: (item: HistoryItem) => void;
}

export default function QuerySidebar({ onSelect }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchHistory();
    }
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/queryhistory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }

  function groupByDate(items: HistoryItem[]) {
    const groups: Record<string, HistoryItem[]> = {};
    const now = new Date();

    items.forEach((item) => {
      const date = new Date(item.created_at);
      const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );
      let label = "Older";
      if (diffDays === 0) label = "Today";
      else if (diffDays === 1) label = "Yesterday";
      else if (diffDays <= 7) label = "This Week";
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });

    return groups;
  }

  const grouped = groupByDate(history);

  return (
    <div className="flex flex-col h-full">
      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#e0e0e0 transparent" }}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-300">
            <span className="text-2xl">○</span>
            <span className="text-[11px] font-medium">No queries yet</span>
          </div>
        ) : (
          Object.entries(grouped).map(([label, items]) => (
            <div key={label}>
              <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-300 px-5 pt-4 pb-1">
                {label}
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group px-5 py-3 cursor-pointer transition-colors hover:bg-gray-50 flex flex-col gap-1"
                  onClick={() => onSelect(item)}
                >
                  <span className="text-[12px] text-gray-600 group-hover:text-black font-medium leading-snug truncate transition-colors">
                    {item.question}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-bold">
                      {item.chart_type}
                    </span>
                    <span className="text-[9px] text-gray-300">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
