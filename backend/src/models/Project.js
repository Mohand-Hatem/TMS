// File: src/models/Project.js
// What this does: Defines the Mongoose database schema for Projects, storing name, description, owner reference,
// and an array of user ObjectIds representing authorized project members.
// Used by: project.controller.js for project CRUD and member management, task.controller.js for access validation, and seed.js.

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Project name is required'], trim: true },
  description: { type: String, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
