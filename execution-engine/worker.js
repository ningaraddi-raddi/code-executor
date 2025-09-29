// // worker.js (The Consumer)
// const amqp = require('amqplib');
// const { executeCode } = require('./execute'); // We'll reuse our secure execution logic

// const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';
// const QUEUE_NAME = 'code_execution_queue';

// async function startWorker() {
//     console.log('Worker is starting...');
//     try {
//         const connection = await amqp.connect(RABBITMQ_URL);
//         const channel = await connection.createChannel();
//         await channel.assertQueue(QUEUE_NAME, { durable: true });

//         // This ensures the worker only processes one message at a time
//         channel.prefetch(1);

//         console.log(`[*] Waiting for jobs in ${QUEUE_NAME}. To exit press CTRL+C`);

//         channel.consume(QUEUE_NAME, async (msg) => {
//             if (msg !== null) {
//                 const job = JSON.parse(msg.content.toString());
//                 console.log(`[.] Received job for language: ${job.language}`);

//                 try {
                    
//                     const output = await executeCode(job.language, job.code,job.stdin);
//                     console.log(`[x] Job finished. Output: ${output.stdout}`);
//                     // In a real app, you would save this output to a database or send it via WebSocket.
//                 } catch (error) {
//                     console.error(`[!] Job failed for language: ${job.language}`);
//                     console.error(error);
//                 } finally {
//                     // Acknowledge the message so RabbitMQ removes it from the queue
//                     channel.ack(msg);
//                 }
//             }
//         }, { noAck: false });
//     } catch (error) {
//         console.error('Failed to connect to RabbitMQ or start worker', error);
//         // Retry connection after a delay
//         setTimeout(startWorker, 5000);
//     }
// }

// startWorker();






// execution-engine/worker.js
const amqp = require('amqplib');
const Redis = require('ioredis');
const { executeCode } = require('./execute');

const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';
const REDIS_URL = 'redis://redis:6379';
const QUEUE_NAME = 'code_execution_queue';
const redis = new Redis(REDIS_URL);

async function startWorker() {
    console.log('Worker is starting...');
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1);
        console.log(`[*] Waiting for jobs in ${QUEUE_NAME}.`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const job = JSON.parse(msg.content.toString());
                const { jobId, language, code, stdin } = job; // Destructure all parts of the job

                console.log(`[.] Received job ${jobId}`);
                await redis.set(jobId, JSON.stringify({ status: 'processing' }));

                try {
                    // Pass stdin to the executeCode function
                    const output = await executeCode(language, code, stdin);
                    
                    // On success, update Redis with the final output
                    await redis.set(jobId, JSON.stringify({ status: 'completed', output: output.stdout }));
                    console.log(`[x] Job ${jobId} finished.`);

                } catch (error) {
                    // On failure, update Redis with the error message
                    await redis.set(jobId, JSON.stringify({ status: 'failed', error: error.stderr || error.message }));
                    console.error(`[!] Job ${jobId} failed.`);

                } finally {
                    channel.ack(msg);
                }
            }
        }, { noAck: false });
    } catch (error) {
        console.error('Failed to start worker', error);
        setTimeout(startWorker, 5000);
    }
}

startWorker();