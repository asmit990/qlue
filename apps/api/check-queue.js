const amqp = require('amqplib');
require('dotenv').config();

async function main() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const q = await channel.assertQueue('query_queue', { durable: true });
    console.log('Queue info:', q);
    process.exit(0);
}
main().catch(console.error);
