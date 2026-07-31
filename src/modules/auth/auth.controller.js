// File: src/modules/auth/auth.controller.js
// What this does: Controller logic for user registration, authentication (login), and terminating sessions (logout),
// integrating bcrypt password hashing, ROLES defaults, and JWT delivery via httpOnly cookies.
// Used by: auth.routes.js to handle requests matching /api/auth endpoints.

import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import User from '../../models/User.js';
import generateToken from '../../utils/generateToken.js';
import { ROLES } from '../../constants/roles.constant.js';

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: ROLES.MEMBER });

  generateToken(res, user._id, user.role);
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  generateToken(res, user._id, user.role);
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export { register, login, logout };
