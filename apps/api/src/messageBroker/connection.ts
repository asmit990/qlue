import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('query_queue', { durable: true });
    console.log('Connected to RabbitMQ');
    return channel;
};

export const getChannel = () => channel;