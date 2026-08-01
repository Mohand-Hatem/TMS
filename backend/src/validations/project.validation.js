// File: src/validations/project.validation.js
// What this does: Defines Zod validation schemas for project lifecycle operations (creation, updates, and membership changes).
// Used by: project.routes.js to validate API input payloads before executing project domain operations.

import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty').optional(),
  description: z.string().optional()
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
});

export default { createProjectSchema, updateProjectSchema, addMemberSchema };
