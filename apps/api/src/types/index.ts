export type ChartType = "bar" | "line" | "pie";

export interface QueryResponse {
  chartType: ChartType;
  sql: string;
}

export interface UploadResponse {
  success: boolean;
  tableName: string;
  columns: string[];
  rowCount: number;
  schema: string;
}

export interface QueryHistoryEntry {
  question: string;
  sql: string;
  chartType: string;
  created_at: string;
}