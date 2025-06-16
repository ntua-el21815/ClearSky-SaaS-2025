const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const passport = require("passport");
require("./config/passport");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(passport.initialize());

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "127.0.0.1", () =>
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`)
);