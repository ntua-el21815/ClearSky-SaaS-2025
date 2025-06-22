const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/users", userRoutes); // base route

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 User Management Service running on ${PORT}`)
);
