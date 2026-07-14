import { getChannel, QUEUE_NAME } from "./connection";
import { randomUUID } from "crypto";

export const publishQuery = (
  jobId: string,
  question: string,
  schema: string,
  datasetId: string,
  userId: number
): boolean => {
  const channel = getChannel();

  if (!channel) {
    console.error("Cannot publish, RabbitMQ channel not ready for job:", jobId);
    return false;
  }

  const payload = JSON.stringify({ jobId, question, schema, datasetId, userId });

  channel.sendToQueue(QUEUE_NAME, Buffer.from(payload), { persistent: true });

  console.log("Job established: ", jobId);
  return true;
};


export const publishImportJob = (
  provider: "google" | "microsoft",
  fileId: string,
  name: string,
  userId: number,
  providedJobId?: string
): { jobId: string; ok: boolean } => {
  const channel = getChannel();
  const jobId = providedJobId || randomUUID();


   if (!channel) {
    console.error("Cannot publish, RabbitMQ channel not ready for import job:", jobId);
    return { jobId, ok: false };
  }


  const payload = JSON.stringify({
    type: "import_file",
    jobId,
    provider,
    fileId,
    name,
    userId,
  });


  channel.sendToQueue(QUEUE_NAME, Buffer.from(payload), { persistent: true });

  console.log("Import job established: ", jobId);
  return { jobId, ok: true };
};
