// File: src/models/User.js
// What this does: Defines the Mongoose database schema and model for application Users, including name, email,
// hashed passwords, and role enumeration imported from constants (defaulting to 'Member').
// Used by: auth.controller.js for registration/login, project.controller.js for populating project members, and seed.js.

import mongoose from 'mongoose';
import { ROLES, ROLES_LIST } from '../constants/roles.constant.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: [true, 'Password hash is required'] },
  role: { type: String, enum: ROLES_LIST, default: ROLES.MEMBER }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
