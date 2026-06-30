import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { saveDataset, type CSVDataset } from "./db";

export async function parseAndStoreCSV(file: File): Promise<CSVDataset> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as Record<string, any>[];
          if (rows.length === 0) {
            return reject(new Error("CSV is empty"));
          }

          const columns = Object.keys(rows[0]);
          const schema = `Tables:\n- data(${columns.join(", ")})\n`;

          const dataset: CSVDataset = {
            id: uuidv4(),
            name: file.name,
            columns,
            rows,
            schema,
            created_at: new Date().toISOString(),
          };

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
