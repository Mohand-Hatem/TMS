// File: src/validations/auth.validation.js
// What this does: Defines Zod validation schemas for user authentication payloads (registration and login).
// Used by: auth.routes.js to validate request bodies prior to reaching auth controllers or Mongoose database schemas.

import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export default { registerSchema, loginSchema };
