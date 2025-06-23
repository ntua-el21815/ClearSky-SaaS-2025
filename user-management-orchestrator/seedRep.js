require("dotenv").config();
const bcrypt    = require("bcryptjs");
const connectDB = require("./config/db");
const User      = require("./models/User");

const REP = {
  name : "rep",
  email: "rep@ntua.gr",
  role : "institution_rep",
  password: "rep12345"
};

(async () => {
  try {
    await connectDB();

    // υπάρχει ήδη;
    if (await User.findOne({ email: REP.email })) {
      console.log("ℹ️  Representative already seeded.");
      return process.exit(0);
    }

    const hash = await bcrypt.hash(REP.password, 10);
    await User.create({ ...REP, password: hash });

    console.log("✅  Institution representative seeded.");
    process.exit(0);
  } catch (err) {
    console.error("❌  Seed rep failed:", err.message);
    process.exit(1);
  }
})();