import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { createDataset } from "./datasets";

type DatasetSourceType = "csv";

interface DatasetColumn {
  name: string;
  type: "string" | "number";
}

interface Dataset {
  id: string;
  name: string;
  sourceType: DatasetSourceType;
  columns: DatasetColumn[];
  rows: Record<string, any>[];
  schema: string;
  created_at: string;
}

interface AppDB extends DBSchema {
  datasets: {
    key: string;
    value: Dataset;
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

export async function saveDataset(dataset: Dataset) {
  const db = await getDB();
  await db.put("datasets", normalizeStoredDataset(dataset));
}

export async function getDataset(id: string): Promise<Dataset | undefined> {
  const db = await getDB();
  const dataset = await db.get("datasets", id);
  return dataset ? normalizeStoredDataset(dataset) : undefined;
}

export async function listDatasets(): Promise<Dataset[]> {
  const db = await getDB();
  const datasets = await db.getAll("datasets");
  return datasets.map(normalizeStoredDataset);
}

export async function deleteDataset(id: string) {
  const db = await getDB();
  await db.delete("datasets", id);
}

function normalizeStoredDataset(dataset: any): Dataset {
  return createDataset({
    id: dataset.id,
    name: dataset.name,
    sourceType: dataset.sourceType || "csv",
    columns: dataset.columns,
    rows: dataset.rows || [],
    created_at: dataset.created_at,
  });
}

export type { Dataset, DatasetColumn, DatasetSourceType };
