export type ChartType = "bar" | "line" | "pie";

export interface QueryResponse {
  answer: null;
  rows: Record<string, any>[];
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