const amqp = require('amqplib');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'user.signup';
const QUEUE_NAME = 'user.auth.queue';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const initConsumer = async () => {
  // Connect to database first
  await connectDB();

  let retries = 10;
  while (retries) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      
      // Declare the exchange
      await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });
      
      // Declare and bind queue to exchange
      const queue = await channel.assertQueue(QUEUE_NAME, { durable: true });
      await channel.bindQueue(queue.queue, EXCHANGE_NAME, '');
      
      console.log('✅ Connected to RabbitMQ, waiting for user signup messages...');
      
      // Consume messages
      channel.consume(queue.queue, async (message) => {
        if (message) {
          try {
            const userData = JSON.parse(message.content.toString());
            console.log('📥 Received message:', userData);
            
            await processUserSignup(userData);
            
            // Acknowledge message
            channel.ack(message);
            console.log('✅ User processed successfully:', userData.email);
            
          } catch (error) {
            console.error('❌ Error processing user signup:', error.message);
            // Reject message and don't requeue to avoid infinite loops
            channel.nack(message, false, false);
          }
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
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`⚠️ User already exists: ${userData.email}`);
      return;
    }
    
    // Hash password if not already hashed
    let hashedPassword = userData.password;
    console.log(`Password : ${userData.password}`);
    if (userData.password && !userData.password.startsWith('$2a$')) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }

    console.log("Creating user with ID:", userData.id);
    
    // Create new user
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
    console.log(`👤 Created user in auth database: ${userData.email} (${userData.role})`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    throw error;
  }
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

// Start the consumer
initConsumer().catch(console.error);