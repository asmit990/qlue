import { v4 as uuidv4 } from "uuid";
import type { Dataset, DatasetColumn, DatasetSourceType } from "./db";

type DatasetColumnInput = DatasetColumn | string;

interface CreateDatasetInput {
  id?: string;
  name: string;
  sourceType: DatasetSourceType;
  columns?: DatasetColumnInput[];
  rows: Record<string, unknown>[];
  created_at?: string;
}

export function quoteSqlIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, `""`)}"`;
}

export function inferColumns(rows: Record<string, unknown>[]): DatasetColumn[] {
  if (rows.length === 0) {
    return [];
  }

  return Object.keys(rows[0]).map((name) => ({
    name,
    type: inferColumnType(rows, name),
  }));
}

export function normalizeColumns(
  columns: DatasetColumnInput[] | undefined,
  rows: Record<string, unknown>[]
): DatasetColumn[] {
  if (!columns || columns.length === 0) {
    return inferColumns(rows);
  }

  return columns.map((column) => {
    const columnName = typeof column === "string" ? column : column.name;
    const inferredType = inferColumnType(rows, columnName);

    if (typeof column === "string") {
      return {
        name: columnName,
        type: inferredType,
      };
    }

    return {
      name: columnName,
      type: column.type === "number" || inferredType === "number" ? "number" : "string",
    };
  });
}

export function buildDatasetSchema(id: string, columns: DatasetColumn[]): string {
  const columnList = columns.map((column) => column.name).join(", ");
  return `Tables:\n- ${quoteSqlIdentifier(id)}(${columnList})\n`;
}

export function coerceRows(
  rows: Record<string, unknown>[],
  columns: DatasetColumn[]
): Record<string, unknown>[] {
  return rows.map((row) =>
    Object.fromEntries(
      columns.map((column) => [
        column.name,
        coerceValueForColumn(row[column.name], column.type),
      ])
    )
  );
}

export function createDataset({
  id = uuidv4(),
  name,
  sourceType,
  columns,
  rows,
  created_at = new Date().toISOString(),
}: CreateDatasetInput): Dataset {
  const normalizedColumns = normalizeColumns(columns, rows);
  const normalizedRows = coerceRows(rows, normalizedColumns);

  return {
    id,
    name,
    sourceType,
    columns: normalizedColumns,
    rows: normalizedRows,
    schema: buildDatasetSchema(id, normalizedColumns),
    created_at,
  };
}

function inferColumnType(
  rows: Record<string, unknown>[],
  columnName: string
): DatasetColumn["type"] {
  const values = rows
    .map((row) => row[columnName])
    .filter((value) => value !== null && value !== undefined && `${value}`.trim() !== "");

  if (values.length === 0) {
    return "string";
  }

  const allNumeric = values.every((value) => isNumericValue(value));
  return allNumeric ? "number" : "string";
}

function coerceValueForColumn(value: unknown, type: DatasetColumn["type"]): unknown {
  if (type !== "number") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }

    const numericValue = Number(trimmed);
    return Number.isFinite(numericValue) ? numericValue : value;
  }

  return value;
}

function isNumericValue(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return false;
  }

  return Number.isFinite(Number(trimmed));
}
