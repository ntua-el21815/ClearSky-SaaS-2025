const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const {
  login,
  getCurrentUser,
  verifyToken,
  loginWithGoogle,
  loginWithGmail  // ✅ Import added here
} = require("../controllers/authController");

const verifyTokenMiddleware = require("../middlewares/authMiddleware");

router.post("/login", login);
router.post("/login/google", loginWithGoogle); // ✅ Route added correctly
router.get("/me", verifyTokenMiddleware, getCurrentUser);
router.get("/verify-token", verifyTokenMiddleware, verifyToken);
router.post("/login/gmail", loginWithGmail);


// // 🔒 Google OAuth (optional: if you're using passport strategy as well)
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false, failureRedirect: "/" }),
//   (req, res) => {
//     const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({
//       token,
//       user: {
//         id: req.user._id,
//         email: req.user.email,
//         fullName: req.user.fullName,
//         role: req.user.role,
//         userCode: req.user.userCode,
//         institutionId: req.user.institutionId
//       },
//     });
//   }
// );

module.exports = router;
