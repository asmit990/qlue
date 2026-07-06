import amqp from 'amqplib';

// Queue name is env-overridable so local dev and prod don't fight over the
// same (exclusive) consumer on a shared CloudAMQP instance. Set QUEUE_NAME in
// your local .env (e.g. "query_queue_dev") to keep environments isolated.
export const QUEUE_NAME = process.env.QUEUE_NAME || 'query_queue';

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;
let connecting = false;
let stopped = false;
let onReady: ((channel: amqp.Channel) => void) | null = null;

async function establish() {
    if (stopped || connecting || channel) return;
    connecting = true;
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL!);

        // Without these listeners an async AMQP failure (e.g. a 403 when the
        // queue is held exclusively elsewhere) is emitted as an 'error' event
        // with no handler, which crashes the entire process.
        connection.on('error', (err) => {
            console.error('RabbitMQ connection error:', err.message);
        });
        connection.on('close', () => {
            console.error('RabbitMQ connection closed; will reconnect');
            connection = null;
            channel = null;
        });

        const ch = await connection.createChannel();
        ch.on('error', (err) => {
            console.error('RabbitMQ channel error:', err.message);
        });
        ch.on('close', () => {
            console.error('RabbitMQ channel closed; will reconnect');
            channel = null;
        });

        await ch.assertQueue(QUEUE_NAME, { durable: true });
        channel = ch;
        console.log('Connected to RabbitMQ');
        onReady?.(ch);
    } catch (err: any) {
        console.error('RabbitMQ connect failed:', err.message);
        try {
            await connection?.close();
        } catch {
            // ignore
        }
        connection = null;
        channel = null;
    } finally {
        connecting = false;
    }
}

// Keep a live connection + channel, reconnecting whenever either drops. The
// `ready` callback fires on every (re)connect so the worker can (re)register
// its consumer against the fresh channel.
export const startRabbitMQ = (ready: (channel: amqp.Channel) => void) => {
    stopped = false;
    onReady = ready;
    establish();
    setInterval(() => {
        if (!channel) establish();
    }, 5000).unref();
};

export const getChannel = () => channel;

export const isChannelReady = () => channel !== null;

export const closeRabbitMQ = async () => {
    stopped = true;
    onReady = null;
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
    channel = null;
    connection = null;
    console.log('RabbitMQ connection closed');
};
