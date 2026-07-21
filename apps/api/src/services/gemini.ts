import "dotenv/config";

import { GoogleGenerativeAI } from "@google/generative-ai";

import type { ChartType, QueryResponse } from "../types";


const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env");

// genAi  is lil twickes 

const genAI = new GoogleGenerativeAI(apiKey);


export async function generateSQL(userQuery: string, schema: string, rows: any[]): Promise<QueryResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
   
  const prompt = `
   You are a SQL and data visualization expert.
Given this SQLite database schema:
${schema}

For this query: "${userQuery}"
Return ONLY a valid JSON object, nothing else. No explanation, no markdown, no backticks:
{
  "sql": "SELECT ...",
  "chartType": "bar"
}

chartType must be one of:
// bar, line, area, pie, scatter, radar
//
// - bar     → comparisons, rankings
// - line    → trends over time
// - area    → cumulative trends
// - pie     → parts of a whole
// - scatter → correlation between two values
// - radar   → multi-dimension comparison

  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error("The AI returned an invalid query response.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("The AI returned an invalid query response.");
  }

  const { sql, chartType } = parsed as Record<string, unknown>;
  const validChartTypes: ChartType[] = ["bar", "line", "pie", "area", "scatter", "radar"];

  if (typeof sql !== "string" || !sql.trim()) {
    throw new Error("The AI did not generate a SQL query. Please try again.");
  }

  // The browser executes this against a local, read-only dataset. Reject
  // mutating or multi-statement output before it reaches the client.
  if (!/^(?:select|with)\b/i.test(sql.trim()) || /;\s*\S/.test(sql)) {
    throw new Error("The AI generated an unsupported SQL query. Please try again.");
  }

  if (typeof chartType !== "string" || !validChartTypes.includes(chartType as ChartType)) {
    throw new Error("The AI returned an unsupported chart type. Please try again.");
  }

  return { sql: sql.trim(), chartType: chartType as ChartType };
}
