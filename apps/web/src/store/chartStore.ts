import { create } from "zustand"

type Status =
  | "thinking"
  | "querying"
  | "generated"
  | "ready_for_local_execution"
  | "done"
  | "error"
  | ""

export type ChartType = "bar" | "line" | "pie" | "area" | "scatter" | "radar";

interface ChartState {
  rows: any[];
  chartType: ChartType;
  status: Status;

  setRows: (rows: any[]) => void;
  setChartType: (type: ChartType) => void;
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
