const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const mockUsers = [
  {
    _id: "685bda768a59ccd6ddcffefd",
    fullName: 'Student 1',
    email: 'student1@test.com',
    password: '123456',
    role: 'student',
    institutionId: 'NTUA'
  },
  {
    _id: "685bda768a59ccd6ddcffefe",
    fullName: 'Instructor 1',
    email: 'instructor1@test.com',
    password: '123456',
    role: 'instructor',
    institutionId: 'NTUA'
  },
  {
    _id: "685bda768a59ccd6ddcffeff",
    fullName: 'Representative',
    email: 'institution@test.com',
    password: '123456',
    role: 'institution_rep',
    institutionId: 'NTUA'
  },
  {
    _id: "685bda768a59ccd6ddcfff00",
    fullName: 'Student 2',
    email: 'student2@test.com',
    password: '123456',
    role: 'student',
    institutionId: 'NTUA'
  },
  {
    _id: "685bda768a59ccd6ddcfff01",
    fullName: 'Instructor 2',
    email: 'instructor2@test.com',
    password: '123456',
    role: 'instructor',
    institutionId: 'NTUA'
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');

    for (const userData of mockUsers) {
      const exists = await User.findOne({ _id: userData._id });
      if (exists) {
        console.log(`ℹ️  User already exists: ${userData.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({ ...userData, password: hashedPassword });

      await user.save();
      console.log(`👤 Created user: ${user.email} (${user.role})`);
    }

    console.log('\n🎉 Mock users seeded successfully!');
    console.log('\n📋 Test Credentials:');
    mockUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / 123456`);
    });

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

seedUsers();
