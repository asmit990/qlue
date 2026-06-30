import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface CSVDataset {
  id: string;
  name: string;
  columns: string[];
  rows: Record<string, any>[];
  schema: string;
  created_at: string;
}

interface AppDB extends DBSchema {
  datasets: {
    key: string;
    value: CSVDataset;
  };
}

let dbInstance: IDBPDatabase<AppDB> | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<AppDB>("csv-query-app", 1, {
    upgrade(db) {
      db.createObjectStore("datasets", { keyPath: "id" });
    },
  });
  return dbInstance;
}

export async function saveDataset(dataset: CSVDataset) {
  const db = await getDB();
  await db.put("datasets", dataset);
}

export async function getDataset(id: string): Promise<CSVDataset | undefined> {
  const db = await getDB();
  return db.get("datasets", id);
}

export async function listDatasets(): Promise<CSVDataset[]> {
  const db = await getDB();
  return db.getAll("datasets");
}

export async function deleteDataset(id: string) {
  const db = await getDB();
  await db.delete("datasets", id);
}

export type { CSVDataset };
