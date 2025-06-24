const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Changed from 'bcrypt' to 'bcryptjs'
const User = require('../models/User');
require('dotenv').config();

const mockUsers = [
  {
    fullName: 'John Student',
    email: 'student@test.com',
    password: 'password123',
    role: 'student',
    institutionId: 'inst-001'
  },
  {
    fullName: 'Jane Instructor',
    email: 'instructor@test.com',
    password: 'password123',
    role: 'instructor',
    institutionId: 'inst-001'
  },
  {
    fullName: 'Bob Representative',
    email: 'institution@test.com',
    password: 'password123',
    role: 'institution_rep',
    institutionId: 'inst-001'
  },
  {
    fullName: 'Alice Student Two',
    email: 'student2@test.com',
    password: 'password123',
    role: 'student',
    institutionId: 'inst-002'
  },
  {
    fullName: 'Charlie Instructor Two',
    email: 'instructor2@test.com',
    password: 'password123',
    role: 'instructor',
    institutionId: 'inst-002'
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