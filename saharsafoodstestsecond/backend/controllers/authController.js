import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT
const generateToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate Register ID
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let registerId = '';
  for (let i = 0; i < 6; i++) {
    registerId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    registerId,
    password: hashedPassword,
    phone,
    address
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user.id, user.tokenVersion),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Invalidate previous sessions
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      profileImage: user.profileImage,
      token: generateToken(user.id, user.tokenVersion),
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// ... existing imports

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
      html: `<p>You requested a password reset</p><p>Click this link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid token');
  }

  // Set new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  res.status(200).json({
    success: true,
    data: 'Password updated success',
    token: generateToken(user.id, user.tokenVersion),
  });
});

// @desc    Update Password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user && (await bcrypt.compare(req.body.currentPassword, user.password))) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid current password');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    
    if (req.file) {
      user.profileImage = req.file.path;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser.id, updatedUser.tokenVersion),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Google Auth Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const token = generateToken(user.id, user.tokenVersion);
  
  // Calculate expiry date (30 days)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Redirect to frontend with token
  // Use /#/oauth-success for HashRouter
  res.redirect(`${process.env.FRONTEND_URL}/#/oauth-success?token=${token}&expiresAt=${expiresAt}`);
});

export { registerUser, loginUser, getMe, forgotPassword, resetPassword, updatePassword, updateProfile, googleAuthCallback };
