const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        institutionId: user.institutionId,
        userCode: user.userCode
      },
    });
  } catch (err) {
  console.error("🔥 Login Error:", err);
  res.status(500).json({ message: "Server error" });
}
};

exports.getCurrentUser = (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
};

exports.verifyToken = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      valid: true,
      user: {
        id: decoded.id,
        role: decoded.role
      }
    });
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

exports.loginWithGoogle = async (req, res) => {
  const { googleId, gmail } = req.body;

  if (!googleId || !gmail) {
    return res.status(400).json({ message: "Missing googleId or gmail" });
  }

  try {
    const user = await User.findOne({ googleId, gmail });
    if (!user) {
      return res.status(404).json({ message: "No user found with provided Google credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        institutionId: user.institutionId,
        userCode: user.userCode
      },
    });
  } catch (err) {
    console.error("🔥 Google Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.loginWithGmail = async (req, res) => {
  const { gmail } = req.body;

  if (!gmail || !gmail.endsWith("@gmail.com")) {
    return res.status(400).json({ message: "Valid Gmail address required" });
  }

  try {
    const user = await User.findOne({ gmail });

    if (!user || !user.googleId) {
      return res.status(404).json({ message: "User not found or not linked with Google" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        userCode: user.userCode,
        institutionId: user.institutionId
      }
    });

  } catch (err) {
    console.error("🔥 Gmail login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};