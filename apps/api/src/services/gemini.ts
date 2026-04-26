import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"
import type { ChartType, QueryResponse } from "../types";

dotenv.config()

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env");



const genAI = new GoogleGenerativeAI(apiKey);


export async function generateSQL(userQuery: string, schema: string): Promise<QueryResponse> {
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

chartType rules:
- "bar"  → comparisons, rankings, categories
- "line" → trends over time, dates
- "pie"  → percentages, parts of a whole

  `
const result = await model.generateContent(prompt)
const text = result.response.text().trim()
const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
return parsed;
}

