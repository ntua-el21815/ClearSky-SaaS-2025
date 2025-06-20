const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'grades';

const payload = {
  courseId: 'CS101',
  gradeSheetId: 'final-2025',
  data: [
    {
      studentId: "03184623",
      finalGrade: 6,
      questionsRaw: { Q01: 7, Q02: 4, Q03: 3 },
      questionsNormalized: { Q01: 8, Q02: 5, Q03: 4 }
    },
    {
      studentId: "03184610",
      finalGrade: 8,
      questionsRaw: { Q01: 9, Q02: 7, Q03: 6 },
      questionsNormalized: { Q01: 10, Q02: 8, Q03: 6 }
    }
  ]
};

async function send() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)));
  console.log('Grade message sent to RabbitMQ!');
  await channel.close();
  await conn.close();
}

send();
