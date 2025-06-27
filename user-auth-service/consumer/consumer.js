const amqp = require('amqplib');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'user.signup';
const SIGNUP_QUEUE = 'user.auth.queue';
const GOOGLE_QUEUE = 'google.info'; // 👈 new queue

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const initConsumer = async () => {
  await connectDB();

  let retries = 5;
  while (retries) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      // 1️⃣ Set up user signup queue (fanout)
      await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });
      const signupQueue = await channel.assertQueue(SIGNUP_QUEUE, { durable: true });
      await channel.bindQueue(signupQueue.queue, EXCHANGE_NAME, '');

      console.log('✅ Listening for user signup messages...');

      channel.consume(signupQueue.queue, async (message) => {
        if (!message) return;
        try {
          const userData = JSON.parse(message.content.toString());
          console.log('📥 [Signup] Received:', userData.email);
          await processUserSignup(userData);
          channel.ack(message);
        } catch (err) {
          console.error('❌ Error processing signup:', err.message);
          channel.nack(message, false, false);
        }
      });

      // 2️⃣ Set up google.info queue
      await channel.assertQueue(GOOGLE_QUEUE, { durable: false });
      console.log('✅ Listening for Google info messages...');

      channel.consume(GOOGLE_QUEUE, async (message) => {
        if (!message) return;
        try {
          const { userCode, gmail, googleId } = JSON.parse(message.content.toString());
          console.log('📥 [Google Info] Received for:', userCode);
          await processGoogleLink({ userCode, gmail, googleId });
          channel.ack(message);
        } catch (err) {
          console.error('❌ Error processing Google info:', err.message);
          channel.nack(message, false, false);
        }
      });

      return;
    } catch (err) {
      retries--;
      console.error(`❌ RabbitMQ not ready. Retrying in 5s... (${retries} attempts left)`);
      await sleep(5000);
    }
  }

  console.error('❌ Failed to connect to RabbitMQ after retries.');
  process.exit(1);
};

const processUserSignup = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    console.log(`⚠️ User already exists: ${userData.email}`);
    return;
  }

  let hashedPassword = userData.password;
  if (userData.password && !userData.password.startsWith('$2a$')) {
    hashedPassword = await bcrypt.hash(userData.password, 10);
  }

  const newUser = new User({
    _id: new mongoose.Types.ObjectId(userData.userId),
    fullName: userData.fullName,
    email: userData.email,
    password: hashedPassword,
    role: userData.role,
    institutionId: userData.institutionId || null,
    userCode: userData.userCode
  });

  await newUser.save();
  console.log(`👤 Created user in auth DB: ${userData.email}`);
};

const processGoogleLink = async ({ userCode, gmail, googleId }) => {
  const user = await User.findOne({ userCode });

  if (!user) {
    console.warn(`⚠️ No user found with code: ${userCode}`);
    return;
  }

  user.googleId = googleId;
  user.gmail = gmail;

  await user.save();
  console.log(`🔗 Linked Google account to user ${userCode}: ${gmail}`);
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down consumer...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Shutting down consumer...');
  process.exit(0);
});

initConsumer().catch(console.error);
