// File: src/utils/generateToken.js
// What this does: Generates a JSON Web Token (JWT) containing user ID and role using JWT_SECRET from Env.js, and delivers it
// directly to the client via an httpOnly, sameSite secure cookie to prevent XSS and CSRF vulnerabilities.
// Used by: auth.controller.js upon successful user registration and authentication login.

import jwt from 'jsonwebtoken';
import { JWT_SECRET, NODE_ENV } from '../config/Env.js';

function generateToken(res, userId, role) {
  const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,                  // JS in browser cannot read or steal token (XSS defense)
    secure: NODE_ENV === 'production', // HTTPS only when deployed in production
    sameSite: 'strict',              // Prevents cross-site cookie transmission (CSRF defense)
    maxAge: 7 * 24 * 60 * 60 * 1000  // Cookie expiration set to 7 days in milliseconds
  });
}

export default generateToken;
