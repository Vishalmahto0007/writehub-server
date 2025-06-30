const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/authController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().notEmpty(),
    body("gender").isIn(["Male", "Female", "Other"]),
    body("dob").isISO8601(),
  ],
  authController.signup
);

router.post("/verify", authController.verifyCode);

router.post("/verify-reset", authController.verifyResetCode);

router.post("/resend-verification-code", authController.resendVerificationCode);

router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.verifyResetCode);

router.get("/me", isAuth, authController.getMe);

router.post("/logout", isAuth, authController.logout);

module.exports = router;
