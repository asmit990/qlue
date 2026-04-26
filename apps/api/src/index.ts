import express, { Request, Response } from "express";
import { generateSQL } from "../src/services/gemini";


const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
 
});

app.post("/ask", (req: Request, res: Response) => {

})

app.patch("/history", (req: Request, res:Response) => {
    

})

app.post("/api/query", async (req, res) => {
  const { question } = req.body;

  const sql = await generateSQL(question);
  console.log("Generated SQL:", sql); // pehle bas yahi dekh

  res.json({ sql }); // frontend pe bhej
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});