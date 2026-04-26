import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);



const DB_SCHEMA =  `
Tables:

 - sales(id, product_name, region, revenue, sale_date, category)
 - employees(id, employee_name, salary, domain)
 - domain(id, budget_allocation, domain_name)
 
`;

export async function generateSQL(userQuery: string) {
    
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const prompt = `
You are a SQL expert. Given this database schema:
${DB_SCHEMA}

Convert this natural language query to SQLite SQL:
"${userQuery}"

Return ONLY the SQL query, nothing else. No explanation, no markdown.
`;


const result = await model.generateContent(prompt)
const sql = result.response.text().trim();
return sql;
}
