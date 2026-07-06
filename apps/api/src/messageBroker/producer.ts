import { getChannel, QUEUE_NAME } from "./connection";

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
