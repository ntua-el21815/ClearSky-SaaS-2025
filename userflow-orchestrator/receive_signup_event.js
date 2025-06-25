// receive_signup_event.js
const amqp = require('amqplib');

const queueName = process.argv[2] || 'test-service'; // Use CLI arg for flexibility
const exchange = 'user.signup';

(async () => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'fanout', { durable: false });
  const q = await channel.assertQueue(queueName, { durable: false });
  await channel.bindQueue(q.queue, exchange, '');

  console.log(`[✅ ${queueName}] Waiting for messages...`);
  channel.consume(q.queue, msg => {
    if (msg.content) {
      console.log(`[📩 ${queueName}] Received:`, msg.content.toString());
    }
  }, { noAck: true });
})();
