// File: src/models/AuditLog.js
// What this does: Defines the Mongoose schema for task audit logs, recording status change events
// (fromStatus and toStatus), which user made the modification, and timestamp.
// Used by: task.controller.js whenever a task's status is modified or when viewing audit logs, and seed.js.

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromStatus: String,
  toStatus: String,
  changedAt: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', auditLogSchema);
