import { getChannel } from "./connection";



export const publishQuery = (jobId:string, question: string, schema:string) => {
     const channel = getChannel()

     const payload = JSON.stringify({jobId, question, schema})

     channel.sendToQueue('query_queue', Buffer.from(payload), {persistent: true})

     console.log("Job established: ", jobId)
}


