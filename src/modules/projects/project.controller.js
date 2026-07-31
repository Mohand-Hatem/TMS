// File: src/modules/projects/project.controller.js
// What this does: Controller logic for creating, querying, updating, and deleting projects, as well as admin-managed
// team membership, checking against ROLES.ADMIN and project ownership access controls.
// Used by: project.routes.js to process incoming requests targeting project endpoints.

import asyncHandler from 'express-async-handler';
import Project from '../../models/Project.js';
import { ROLES } from '../../constants/roles.constant.js';

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.create({
    name,
    description,
    owner: req.user.id,
    members: [req.user.id]
  });
  res.status(201).json(project);
});

// GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { members: req.user.id }]
  }).populate('owner', 'name email').populate('members', 'name email');

  res.json(projects);
});

// PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (req.user.role !== ROLES.ADMIN && project.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to modify this project');
  }

  Object.assign(project, req.body);
  await project.save();
  res.json(project);
});

// DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (req.user.role !== ROLES.ADMIN && project.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this project');
  }

  await project.deleteOne();
  res.json({ message: 'Project deleted successfully' });
});

// POST /api/projects/:id/members (Admin only)
const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  project.members.addToSet(userId);
  await project.save();
  res.json(project);
});

// DELETE /api/projects/:id/members/:userId (Admin only)
const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  project.members = project.members.filter(m => m.toString() !== req.params.userId);
  await project.save();
  res.json(project);
});

export { createProject, getProjects, updateProject, deleteProject, addMember, removeMember };
