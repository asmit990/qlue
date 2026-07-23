import "dotenv/config"
import { GoogleGenerativeAI} from "@google/generative-ai"
import type { ChartType, QueryResponse } from "../types"


const apiKey = process.env.GEMINI_API_KEY;



if(!apiKey) throw new Error("GEMINI_KEY is missing in .env")




  const genAI = new GoogleGenerativeAI(apiKey)



  export async function generateSQL(userQuery: string, schema: string): Promise<QueryResponse> {
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"})


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

chartType must be one of: bar, line, area, pie, scatter, radar
  `;


  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();


  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

  } catch {
    throw new Error("The AI returned an invalid query response.");

  }


  const { sql, chartType} = parsed as Record<string, unknown>;

  const validChartTypes: ChartType[] = ["bar", "line", "pie", "area", "scatter", "radar"]


   if (typeof sql !== "string" || !sql.trim()) {
    throw new Error("The AI did not generate a SQL query.");
  }
  
  if (!/^(?:select|with)\b/i.test(sql.trim()) || /;\s*\S/.test(sql)) {
    throw new Error("The AI generated an unsupported SQL query.");
  }

  if (typeof chartType !== "string" || !validChartTypes.includes(chartType as ChartType)) {
    throw new Error("The AI returned an unsupported chart type.");
  }

  return { sql: sql.trim(), chartType: chartType as ChartType };

  }

  export async function generateWorkflowNodeSQL(userQuery: string, schemaContext?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
   
  const prompt = `
You are an expert SQLite data engineer writing a Common Table Expression (CTE) subquery.

CRITICAL RULES:
1. You are writing a query that will be used INSIDE a larger pipeline.
2. ALWAYS use the exact string "{{input}}" as your FROM table name. Do NOT use the real table names.
3. Use standard SQLite syntax.
4. Output ONLY the raw SQL query. No JSON, no markdown, no explanations.

${schemaContext ? `AVAILABLE INCOMING COLUMNS:\n${schemaContext}` : ''}

USER INSTRUCTION: "${userQuery}"
  `;

  const result = await model.generateContent(prompt);
  let sql = result.response.text().trim();
  
  // Strip formatting just in case Gemini disobeys the "no markdown" rule
  sql = sql.replace(/^```sql\n?/i, '').replace(/\n?```$/i, '').trim();

  if (!/^(?:select|with)\b/i.test(sql)) {
    throw new Error("Generated SQL must start with SELECT or WITH.");
  }

  return sql;
}

 