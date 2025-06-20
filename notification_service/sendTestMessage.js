const amqp = require('amqplib');
const { getMaxListeners } = require('nodemailer/lib/xoauth2');

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'notifications';

const testMessage1 = {
  type: 'REVIEW_REQUESTED',
  userId: '03184623',
  //email: 'el21815@mail.ntua.gr' 
  email: 'liaskentzou@gmail.com'
};

const testMessage2 = {
  type: 'GRADE_POSTED',
  userId: '03184623',
  //email: 'el21815@mail.ntua.gr' 
  email: 'liaskentzou@gmail.com'
};


const testMessage3 = {
  type: 'REVIEW_REPLIED',
  userId: '03184623',
  //email: 'el21815@mail.ntua.gr' 
  email: 'fotakisandreas@gmail.com'
};

async function sendMessage() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(testMessage3)));

    console.log('📨 Test message sent to queue!');
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('❌ Failed to send test message:', error);
  }
}

sendMessage();
