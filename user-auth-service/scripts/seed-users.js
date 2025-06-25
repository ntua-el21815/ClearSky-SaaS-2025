const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Changed from 'bcrypt' to 'bcryptjs'
const User = require('../models/User');
require('dotenv').config();

const mockUsers = [
  {
    fullName: 'Student 1',
    email: 'student1@test.com',
    password: '123456',
    role: 'student',
    institutionId: 'NTUA'
  },
  {
    fullName: 'Instructor 1',
    email: 'instructor1@test.com',
    password: '123456',
    role: 'instructor',
    institutionId: 'NTUA'
  },
  {
    fullName: 'Representative',
    email: 'institution@test.com',
    password: '123456',
    role: 'institution_rep',
    institutionId: 'NTUA'
  },
  {
    fullName: 'Student 2',
    email: 'student2@test.com',
    password: '123456',
    role: 'student',
    institutionId: 'NTUA'
  },
  {
    fullName: 'Instructor 2',
    email: 'instructor2@test.com',
    password: '123456',
    role: 'instructor',
    institutionId: 'NTUA'
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');

    // Hash passwords and create users
    for (const userData of mockUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`👤 Created user: ${userData.email} (${userData.role})`);
    }

    console.log('🎉 Mock users seeded successfully!');
    
    // Display credentials for testing
    console.log('\n📋 Test Credentials:');
    mockUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / password123`);
    });

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

seedUsers();