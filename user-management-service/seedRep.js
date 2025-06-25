require("dotenv").config();
const bcrypt    = require("bcryptjs");
const connectDB = require("./config/db");
const User      = require("./models/User");

// Your provided mock users
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

(async () => {
  try {
    await connectDB();

    for (const userData of mockUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`ℹ️  User already exists: ${userData.email}`);
        continue;
      }

      const hash = await bcrypt.hash(userData.password, 10);
      await User.create({ ...userData, password: hash });

      console.log(`✅  Created: ${userData.email} (${userData.role})`);
    }

    console.log("🎉 All users seeded.");
    process.exit(0);
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
    process.exit(1);
  }
})();
