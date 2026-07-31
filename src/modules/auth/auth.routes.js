// File: src/modules/auth/auth.routes.js
// What this does: Express router defining endpoint routes for authentication actions (/register, /login, and /logout),
// integrating external Zod validation schemas before delegating requests to corresponding controller actions.
// Used by: src/app.js where it is mounted on the /api/auth path prefix.

import express from 'express';
import validate from '../../middlewares/validate.js';
import { registerSchema, loginSchema } from '../../validations/auth.validation.js';
import { register, login, logout } from './auth.controller.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

export default router;
