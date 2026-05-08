import { create } from "zustand"

type Status = "thinking" | "querying" | "done" | "error" | ""


interface ChartState {
  rows: any[];
  chartType: "bar" | "line" | "pie";
  status: Status;

  setRows: (rows: any[]) => void;
  setChartType: (type: "bar" | "line" | "pie") => void;
  setStatus: (status: Status) => void;
}


export const useChartStore = create<ChartState>((set) => ({
  rows: [],
  chartType: "bar",
  status: "",

  setRows: (rows) => set({ rows }),
  setChartType: (chartType) => set({ chartType }),
  setStatus: (status) => set({ status }),
}));