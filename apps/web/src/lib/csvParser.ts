import Papa from "papaparse";
import { saveDataset, type Dataset } from "./db";
import { createDataset } from "./datasets";
import { loadDatasetIntoSqlJs } from "./sqlExecutor";

export async function parseAndStoreCSV(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as Record<string, unknown>[];
          if (rows.length === 0) {
            return reject(new Error("CSV is empty"));
          }

          const dataset = createDataset({
            name: file.name,
            sourceType: "csv",
            rows,
          });

          await loadDatasetIntoSqlJs(dataset);
          await saveDataset(dataset);
          resolve(dataset);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}
