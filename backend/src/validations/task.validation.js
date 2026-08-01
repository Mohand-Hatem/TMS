// File: src/validations/task.validation.js
// What this does: Defines Zod validation schemas for task creation and updates, importing constant enum lists to ensure valid status and priority entries.
// Used by: task.routes.js to sanitize and validate requests targeting task endpoints.

import { z } from 'zod';
import { TASK_STATUS_LIST, TASK_PRIORITY_LIST } from '../constants/task.constant.js';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(TASK_STATUS_LIST).optional(),
  priority: z.enum(TASK_PRIORITY_LIST).optional(),
  dueDate: z.string().or(z.date()).optional(),
  assignee: z.union([
    z.string(),
    z.array(z.string()).max(5, 'Maximum 5 members allowed per task')
  ]).optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(TASK_STATUS_LIST).optional(),
  priority: z.enum(TASK_PRIORITY_LIST).optional(),
  dueDate: z.string().or(z.date()).optional(),
  assignee: z.union([
    z.string(),
    z.array(z.string()).max(5, 'Maximum 5 members allowed per task')
  ]).optional()
});

export default { createTaskSchema, updateTaskSchema };
