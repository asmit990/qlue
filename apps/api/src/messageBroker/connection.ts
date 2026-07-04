import amqp from 'amqplib';

let connection: amqp.ChannelModel;
let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    connection = await amqp.connect(
        process.env.RABBITMQ_URL!
    );

    channel = await connection.createChannel();

    await channel.assertQueue('query_queue', {
        durable: true,
    });

    console.log('Connected to RabbitMQ');
};

export const getChannel = () => channel;

export const closeRabbitMQ = async () => {
    try {
        await channel?.close();
    } catch {
        // channel may already be closed
    }
    try {
        await connection?.close();
    } catch {
        // connection may already be closed
    }
    console.log('RabbitMQ connection closed');
};