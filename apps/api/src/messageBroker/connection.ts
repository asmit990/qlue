import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    const connection = await amqp.connect(
        process.env.RABBITMQ_URL!
    );

    channel = await connection.createChannel();

    await channel.assertQueue('query_queue', {
        durable: true,
    });

    console.log('Connected to RabbitMQ');
};

export const getChannel = () => channel;