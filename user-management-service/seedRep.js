require("dotenv").config();
const bcrypt    = require("bcryptjs");
const connectDB = require("./config/db");
const User      = require("./models/User");

// Your provided mock users with specific _id values
const mockUsers = [
  {
    _id: "685bda768a59ccd6ddcffefd",
    fullName: "Student 1",
    email: "student1@test.com",
    password: "123456",
    role: "student",
    institutionId: "NTUA",
    userCode: '03185001'
  },
  {
  _id: "685bda768a59ccd6ddcffefe",
  fullName: "Instructor 1",
  email: "instructor1@test.com",
  password: "123456",
  role: "instructor",
  institutionId: "NTUA",
  userCode: "03185002",
  },
  {
    _id: "685bda768a59ccd6ddcffeff",
    fullName: "Representative",
    email: "institution@test.com",
    password: "123456",
    role: "institution_rep",
    institutionId: "NTUA",
    userCode: '03185003'
  },
  {
    _id: "685bda768a59ccd6ddcfff00",
    fullName: "ΘΕΟΔΩΡΟΥ ΓΕΩΡΓΙΑ",
    email: "el80860@mail.ntua.gr",
    password: "123456",
    role: "student",
    institutionId: "NTUA",
    userCode: '03180860'
  },
  {
    _id: "685bda768a59ccd6ddcfff01",
    fullName: "Instructor 2",
    email: "instructor2@test.com",
    password: "123456",
    role: "instructor",
    institutionId: "NTUA",
    userCode: '03185005'
  }
];

(async () => {
  try {
    await connectDB();

    for (const userData of mockUsers) {
      const exists = await User.findOne({ _id: userData._id });
      if (exists) {
        console.log(`ℹ️  User already exists: ${userData.email}`);
        continue;
      }

      const hash = await bcrypt.hash(userData.password, 10);
      await User.create({ ...userData, password: hash });

      console.log(`✅  Created: ${userData.email} (${userData.role})`);
    }

    console.log("🎉 All users seeded with specific IDs.");
    process.exit(0);
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
    process.exit(1);
  }
})();
