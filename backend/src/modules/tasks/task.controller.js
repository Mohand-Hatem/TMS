// File: src/modules/tasks/task.controller.js
// What this does: Controller logic for creating, querying (with combined pagination/search/sorting), updating, and deleting tasks.
// Utilizes ROLES.ADMIN for authorization checking and triggers AuditLog creation upon task status transitions.
// Used by: task.routes.js to execute business logic for endpoints targeting task operations.

import asyncHandler from 'express-async-handler';
import Task from '../../models/Task.js';
import Project from '../../models/Project.js';
import AuditLog from '../../models/AuditLog.js';
import { ROLES } from '../../constants/roles.constant.js';

// Helper function to verify user is Admin, project owner, or project member
const verifyProjectAccess = async (projectId, userId, userRole, res) => {
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some(m => m.toString() === userId);
  if (userRole !== ROLES.ADMIN && !isOwner && !isMember) {
    res.status(403);
    throw new Error('Not authorized - you are not a member of this project');
  }
  return project;
};

// POST /api/projects/:projectId/tasks
const createTask = asyncHandler(async (req, res) => {
  await verifyProjectAccess(req.params.projectId, req.user.id, req.user.role, res);

  const { title, description, status, priority, dueDate, assignee } = req.body;
  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    project: req.params.projectId,
    creator: req.user.id,
    assignee
  });

  res.status(201).json(task);
});

// GET /api/projects/:projectId/tasks
const getTasks = asyncHandler(async (req, res) => {
  await verifyProjectAccess(req.params.projectId, req.user.id, req.user.role, res);

  const { status, priority, assignee, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const filter = { project: req.params.projectId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;
  if (search) filter.title = { $regex: search, $options: 'i' }; // Case-insensitive partial match

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const tasks = await Task.find(filter)
    .sort(sort)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate('creator', 'name email')
    .populate('assignee', 'name email');

  const total = await Task.countDocuments(filter);

  res.json({
    tasks,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  });
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await verifyProjectAccess(task.project, req.user.id, req.user.role, res);

  const oldStatus = task.status;

  Object.assign(task, req.body);
  await task.save();

  // Trigger AuditLog creation in same request if status transitioned
  if (req.body.status && req.body.status !== oldStatus) {
    await AuditLog.create({
      task: task._id,
      changedBy: req.user.id,
      fromStatus: oldStatus,
      toStatus: req.body.status
    });
  }

  res.json(task);
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const project = await verifyProjectAccess(task.project, req.user.id, req.user.role, res);

  // Enforce deletion restriction: Only System Admins or Project Owners can delete deliverables
  const isOwner = project.owner.toString() === req.user.id;
  if (req.user.role !== ROLES.ADMIN && !isOwner) {
    res.status(403);
    throw new Error('Forbidden: Only an Admin or Project Owner can delete tasks');
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted successfully' });
});

// GET /api/tasks/:id/audit-log
const getAuditLog = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await verifyProjectAccess(task.project, req.user.id, req.user.role, res);

  const logs = await AuditLog.find({ task: req.params.id })
    .sort('-changedAt')
    .populate('changedBy', 'name email');

  res.json(logs);
});

export { createTask, getTasks, updateTask, deleteTask, getAuditLog };
