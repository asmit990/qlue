import { useState, useRef, useEffect } from "react";

export default function useNodeStats(status: string) {
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [queryDuration, setQueryDuration] = useState<number | null>(null);
  const startRef = useRef<number>(Date.now());
  const queryStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === "thinking" || status === "querying") {
      queryStartRef.current = Date.now();
    }
    if (status === "done" && queryStartRef.current) {
      setQueryDuration(Date.now() - queryStartRef.current);
      queryStartRef.current = null;
    }
  }, [status]);


  useEffect(() => {
    const id = setInterval(() => {
      setUptimeSeconds(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const fmtUptime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return { uptimeSeconds, fmtUptime, queryDuration };
}