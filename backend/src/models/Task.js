// File: src/models/Task.js
// What this does: Defines the Mongoose schema for Tasks, importing enum constants for status and priority, and managing
// relational references to project, creator, and assignee user IDs.
// Used by: task.controller.js for task creation, updates, and filtered queries, and seed.js.

import mongoose from 'mongoose';
import { TASK_STATUS, TASK_STATUS_LIST, TASK_PRIORITY, TASK_PRIORITY_LIST } from '../constants/task.constant.js';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Task title is required'], trim: true },
  description: { type: String, trim: true },
  status: { type: String, enum: TASK_STATUS_LIST, default: TASK_STATUS.TO_DO },
  priority: { type: String, enum: TASK_PRIORITY_LIST, default: TASK_PRIORITY.MEDIUM },
  dueDate: Date,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignee: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    validate: [v => v.length <= 5, 'Maximum 5 members allowed per task']
  }
}, { timestamps: true });

// Enterprise performance indexes for high-speed querying & text search
taskSchema.index({ project: 1, status: 1, priority: 1, createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Task', taskSchema);
