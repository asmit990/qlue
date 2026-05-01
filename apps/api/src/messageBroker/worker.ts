import { WebSocketServer } from "ws";
import db from "../services/database";
import { generateSQL } from "../services/gemini";
import { getChannel } from "./connection";



export const startWorker = (wss: WebSocketServer) => {
    const channel = getChannel()

    channel.consume('query_queue', async(msg) => {
        if(!msg) return ;


        const { jobId, question, schema} = JSON.parse(msg.content.toString())
        console.log("job is done: ", jobId)

        const client = [...wss.clients].find((ws: any) => ws.jobId === jobId);

        try {
           client?.send(JSON.stringify({ status: 'thinking' }));

           const { sql, chartType} = await generateSQL(question, schema)

           client?.send(JSON.stringify({status:"querying", sql }))

           const rows = db.prepare(sql).all();

           client?.send(JSON.stringify({ status: 'done', rows, chartType, sql }));
        }
        catch(err: any) {
            client?.send(JSON.stringify({ status: 'error', error: err.message }));

        }

          channel.ack(msg);
    })


    console.log('Worker started — listening for jobs');
}