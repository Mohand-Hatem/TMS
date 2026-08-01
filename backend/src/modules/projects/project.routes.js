// File: src/modules/projects/project.routes.js
// What this does: Defines Express routing for project lifecycle and member management by Admins (via ROLES.ADMIN constant),
// integrating external Zod schemas and forwarding nested /:projectId/tasks requests to the task router.
// Used by: Mounted on /api/projects inside src/app.js.

import express from 'express';
import validate from '../../middlewares/validate.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../../validations/project.validation.js';
import { createProject, getProjects, updateProject, deleteProject, addMember, removeMember } from './project.controller.js';
import { ROLES } from '../../constants/roles.constant.js';
import taskRoutes from '../tasks/task.routes.js';

const router = express.Router();

// Forward nested task routes to task router
router.use('/:projectId/tasks', taskRoutes);

router.use(authenticate);

router.route('/')
  .post(validate(createProjectSchema), createProject)
  .get(getProjects);

router.route('/:id')
  .put(validate(updateProjectSchema), updateProject)
  .delete(deleteProject);

router.route('/:id/members')
  .post(authorize(ROLES.ADMIN), validate(addMemberSchema), addMember);

router.route('/:id/members/:userId')
  .delete(authorize(ROLES.ADMIN), removeMember);

export default router;
