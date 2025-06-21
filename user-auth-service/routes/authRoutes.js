const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {
  login,
  getCurrentUser,
  verifyToken,
} = require("../controllers/authController");

const verifyTokenMiddleware = require("../middlewares/authMiddleware"); // <-- άλλαξε το όνομα

router.post("/login", login);
router.get("/me", verifyTokenMiddleware, getCurrentUser);
router.get("/verify-token", verifyTokenMiddleware, verifyToken);

module.exports = router;

const passport = require("passport");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    // Δημιουργία JWT token
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Επιστροφή token στον client (εναλλακτικά redirect με query string)
    res.json({
      token,
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
      },
    });
  }
);