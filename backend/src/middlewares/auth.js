// File: src/middlewares/auth.js
// What this does: Verifies the JWT stored in the httpOnly cookie (req.cookies.token) and attaches
// the decoded user ID and role to req.user. Also exports an `authorize` function to gate routes by roles.
// Used by: Any route that requires authenticated access or admin-only authorization (project and task routes).

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    res.status(401);
    throw new Error('Not authenticated - no token found in cookies');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
  req.user = decoded; // { id, role }
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized for this action');
  }
  next();
};

export { authenticate, authorize };
