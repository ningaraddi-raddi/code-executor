
// index.js (Corrected and Complete)
const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
const Redis = require('ioredis'); // ---> 1. Import new libraries
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';
const REDIS_URL = 'redis://redis:6379';
const QUEUE_NAME = 'code_execution_queue';

let channel;
const redis = new Redis(REDIS_URL); // ---> 2. Connect to Redis

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
        setTimeout(connectToRabbitMQ, 5000);
    }
}

app.post('/execute', async (req, res) => {
    const { language, code, stdin } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required.' });
    if (!channel) return res.status(500).json({ error: 'Queue is not ready.' });

    const jobId = uuidv4(); // ---> 3. Generate a unique Job ID
    const job = { jobId, language, code, stdin };

    // Store the initial job status in Redis
    await redis.set(jobId, JSON.stringify({ status: 'pending' }));

    // Send the full job object (including jobId) to the queue
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(job)), { persistent: true });
    
    console.log(`Job ${jobId} sent to queue.`);
    // ---> 4. Return the jobId to the frontend
    res.status(202).json({ message: 'Submission received!', jobId });
});

// ---> 5. Add the new endpoint for polling results
app.get('/results/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const result = await redis.get(jobId);

    if (result === null) {
        return res.status(404).json({ error: 'Job not found.' });
    }

    res.json(JSON.parse(result));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
    connectToRabbitMQ();
});










// // index.js (The Producer)
// const express = require('express');
// const amqp = require('amqplib');

// const app = express();
// app.use(express.json());
// const cors = require('cors');

// app.use(cors()); 

// const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';
// const QUEUE_NAME = 'code_execution_queue';

// let channel, connection;

// // Connect to RabbitMQ
// async function connectToRabbitMQ() {
//     try {
//         connection = await amqp.connect(RABBITMQ_URL);
//         channel = await connection.createChannel();
//         await channel.assertQueue(QUEUE_NAME, { durable: true });
//         console.log('Connected to RabbitMQ and queue is asserted');
//     } catch (error) {
//         console.error('Failed to connect to RabbitMQ', error);
//         // Retry connection after a delay
//         setTimeout(connectToRabbitMQ, 5000);
//     }
// }

// app.post('/execute', (req, res) => {
//     const { language, code,stdin } = req.body;

//     if (!code) {
//         return res.status(400).json({ error: 'Code is required.' });
//     }
//     if (!channel) {
//         return res.status(500).json({ error: 'RabbitMQ channel is not available.' });
//     }

    

//     const job = { language, code ,stdin};
    
//     // Send the job to the queue
//     channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(job)), { persistent: true });

//     console.log(`Job sent to queue for language: ${language}`);
//     res.status(202).json({ message: 'Your code submission has been received and is being processed.' });
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`API server listening on http://localhost:${PORT}`);
//     connectToRabbitMQ();
// });