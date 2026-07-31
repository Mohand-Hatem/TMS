// File: src/config/Env.js
// What this does: Centralizes environment variable loading via dotenv and exports cleanly structured configuration constants
// so that other application modules do not need to repeatedly import dotenv or access process.env directly.
// Used by: server.js, db.js, generateToken.js, app.js, and seed.js across the entire backend architecture.

import 'dotenv/config';

export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

export default {
  MONGO_URI,
  JWT_SECRET,
  PORT,
  NODE_ENV,
  CLIENT_URL
};
