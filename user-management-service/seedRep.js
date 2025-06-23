/**
 * Δημιουργεί έναν default institution representative
 * ώστε το πρώτο sign-up να δουλέψει χωρίς χειροκίνητη παρέμβαση.
 *
 *   email : rep@ntua.gr
 *   pass  : rep12345         (SHA-256 hash στον κώδικα πιο κάτω)
 *   role  : institution_rep
 *   institutionId : NTUA     (ταιριάζει με το seed της Institution-DB)
 */

require("dotenv").config();
const bcrypt   = require("bcryptjs");
const connectDB = require("./config/db");
const User      = require("./models/User");

const REP = {
  _id          : "rep-ntua",
  email        : "rep@ntua.gr",
  fullName     : "NTUA Representative",
  password     : "rep12345",
  role         : "institution_rep",
  institutionId: "NTUA",
};

(async () => {
  try {
    await connectDB();

    const exists = await User.findOne({ email: REP.email });
    if (exists) {
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