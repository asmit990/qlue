import { useState } from "react"

import axios from "axios"


export function useQuery() {
    const [rows, setRows] = useState([])
    const [chartType, setChartType] = useState("bar");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    async function ask(question: string) {
        setLoading(true)
        setError(null)

        try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/query`, { question})
      setRows(res.data.rows || [])
      setChartType(res.data.chartType || "bar") 

        } catch(err) {
         setError("couldnt found tht vro 😂✌🏼")
        }  finally {
        setLoading(false)
        }

    }

    return {rows, chartType, loading, error, ask}
}