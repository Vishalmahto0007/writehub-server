const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const getRandomAvatar = require("../utils/getRandomAvatar");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Generate random code
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const isProduction = process.env.NODE_ENV === "production";

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });

  const { name, email, password, gender, dob } = req.body;

  const avatar = getRandomAvatar(gender);

  try {
    const existingUser = await User.findOne({ email });

    const code = generateCode();
    const hashedPw = await bcrypt.hash(password, 12);

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          message: "User already exists and is verified. Please login.",
        });
      } else {
        existingUser.name = name;
        existingUser.password = hashedPw;
        existingUser.gender = gender;
        existingUser.dob = dob;
        existingUser.verificationCode = code;
        existingUser.verificationCodeExpires = Date.now() + 60 * 1000;

        await sendVerificationEmail(email, code);
        await existingUser.save();

        return res.status(200).json({
          message: "Verification code resent. Please verify your account.",
        });
      }
    }

    const user = new User({
      name,
      email,
      password: hashedPw,
      gender,
      dob,
      avatar,
      verificationCode: code,
      verificationCodeExpires: Date.now() + 60 * 1000,
    });

    await sendVerificationEmail(email, code);
    await user.save();

    res.status(201).json({ message: "Verification code sent to email." });
  } catch (err) {
    next(err);
  }
};

// Helper function: Send verification email
const sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    to: email,
    subject: "Verify Your WriteHub Account",
    text: `Your verification code is: ${code}`,
    html: `
      <div style="font-family: Arial; padding: 24px; background: #f9f9f9">
        <h2 style="color: #4f46e5;">Verify your WriteHub Account</h2>
        <p>Hi <b>${email}</b>,</p>
        <p>Use this code to verify your account:</p>
        <h1 style="letter-spacing: 4px; color: #3730a3;">${code}</h1>
        <p style="font-size: 12px; color: gray;">Expires in 1 minute</p>
      </div>
    `,
  });
};

exports.verifyCode = async (req, res, next) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified." });

    if (
      user.verificationCode !== code ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Account verified!" });
  } catch (err) {
    next(err);
  }
};

exports.resendVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res
        .status(400)
        .json({ message: "Invalid or already verified user." });
    }

    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, code);

    res.status(200).json({ message: "Verification code resent." });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified)
      return res.status(401).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Wrong password." });

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      })
      .status(200)
      .json({ message: "Login successful" });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true if deployed with HTTPS
    sameSite: "Lax", // or "None" if you're using cross-origin cookies with HTTPS
    path: "/", // important if the cookie was set with path
  };

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json({ message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const code = generateCode();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 60 * 1000;
    await user.save();

    await transporter.sendMail({
      to: email,
      subject: "Reset Your WriteHub Password",
      text: `Your password reset code is: ${code}`,
      html: `
        <div style="font-family: Arial; padding: 24px; background: #f9f9f9">
          <h2 style="color: #4f46e5;">Reset your WriteHub Password</h2>
          <p>Hi <b>${email}</b>,</p>
          <p>Use this code to reset your password:</p>
          <h1 style="letter-spacing: 4px; color: #3730a3;">${code}</h1>
          <p style="font-size: 12px; color: gray;">Expires in 1 minute</p>
        </div>
      `,
    });

    res.status(200).json({ message: "Reset code sent to email." });
  } catch (err) {
    next(err);
  }
};

exports.verifyResetCode = async (req, res, next) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      user.resetCode !== code ||
      user.resetCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "name email gender dob isVerified createdAt avatar"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
