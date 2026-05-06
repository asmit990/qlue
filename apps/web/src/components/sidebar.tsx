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
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

function handleMouseEnter() {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  setOpen(true);
  if (history.length === 0) fetchHistory(); // ← sirf empty hone pe fetch karo
}

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 300);
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
    <>
      <style>{`
        .qs-trigger {
          position: fixed;
          top: 0;
          left: 0;
          width: 18px;
          height: 100vh;
          z-index: 50;
          cursor: pointer;
        }

        .qs-trigger-indicator {
          position: fixed;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          width: 3px;
          height: 48px;
          background: linear-gradient(180deg, transparent, #d0d0d0, transparent);
          border-radius: 0 2px 2px 0;
          transition: width 0.2s ease, background 0.2s ease;
        }

        .qs-trigger:hover .qs-trigger-indicator {
          width: 4px;
          background: linear-gradient(180deg, transparent, #999, transparent);
        }

        .qs-panel {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 280px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid #e8e8e8;
          z-index: 100;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 24px rgba(0,0,0,0.06);
        }

        .qs-panel.open {
          transform: translateX(0);
        }

        .qs-header {
          padding: 20px 20px 12px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .qs-header-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #111;
          letter-spacing: 0.02em;
        }

        .qs-header-count {
          font-size: 11px;
          color: #aaa;
          font-family: 'DM Sans', sans-serif;
        }

        .qs-body {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
          scrollbar-width: thin;
          scrollbar-color: #e0e0e0 transparent;
        }

        .qs-body::-webkit-scrollbar {
          width: 4px;
        }

        .qs-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .qs-body::-webkit-scrollbar-thumb {
          background: #e0e0e0;
          border-radius: 2px;
        }

        .qs-group-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #bbb;
          padding: 12px 20px 4px;
          font-family: 'DM Sans', sans-serif;
        }

        .qs-item {
          padding: 10px 20px;
          cursor: pointer;
          transition: background 0.15s ease;
          border-radius: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .qs-item:hover {
          background: #f7f7f7;
        }

        .qs-item:hover .qs-item-question {
          color: #000;
        }

        .qs-item-question {
          font-size: 12.5px;
          color: #222;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.15s;
        }

        .qs-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .qs-item-chart {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #bbb;
          font-family: 'DM Sans', sans-serif;
          background: #f0f0f0;
          padding: 1px 6px;
          border-radius: 3px;
        }

        .qs-item-time {
          font-size: 10px;
          color: #ccc;
          font-family: 'DM Sans', sans-serif;
        }

        .qs-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          gap: 8px;
          color: #ccc;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
        }

        .qs-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
        }

        .qs-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #f0f0f0;
          border-top-color: #aaa;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .qs-footer {
          padding: 12px 20px;
          border-top: 1px solid #f0f0f0;
          font-size: 10px;
          color: #ccc;
          font-family: 'DM Sans', sans-serif;
          text-align: center;
        }
      `}</style>

      {/* Hover trigger strip */}
      <div
        className="qs-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="qs-trigger-indicator" />
      </div>

      {/* Sidebar panel */}
      <div
        className={`qs-panel ${open ? "open" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="qs-header">
          <span className="qs-header-title">Query History</span>
          <span className="qs-header-count">{history.length} queries</span>
        </div>

        <div className="qs-body">
          {loading ? (
            <div className="qs-loading">
              <div className="qs-spinner" />
            </div>
          ) : history.length === 0 ? (
            <div className="qs-empty">
              <span style={{ fontSize: 24 }}>○</span>
              <span>No queries yet</span>
            </div>
          ) : (
            Object.entries(grouped).map(([label, items]) => (
              <div key={label}>
                <div className="qs-group-label">{label}</div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="qs-item"
                    onClick={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                  >
                    <span className="qs-item-question">{item.question}</span>
                    <div className="qs-item-meta">
                      <span className="qs-item-chart">{item.chart_type}</span>
                      <span className="qs-item-time">
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

        <div className="qs-footer">hover to open · click to rerun</div>
      </div>
    </>
  );
}
