import "dotenv/config";

import { GoogleGenerativeAI } from "@google/generative-ai";

import type { ChartType, QueryResponse } from "../types";


const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env");



const genAI = new GoogleGenerativeAI(apiKey);


export async function generateSQL(userQuery: string, schema: string, rows: any[]): Promise<QueryResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
   
  const prompt = `
   You are a SQL and data visualization expert.
Given this database schema:
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

  `
const result = await model.generateContent(prompt)
const text = result.response.text().trim()
const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
return parsed;
}

