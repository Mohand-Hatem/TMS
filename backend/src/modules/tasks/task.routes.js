// File: src/modules/tasks/task.routes.js
// What this does: Express router defining task endpoints, applying authentication and modular Zod request body validations from the
// validations directory for task creation and status updates. Configured with mergeParams to receive :projectId.
// Used by: Mounted at /api/projects/:projectId/tasks via project.routes.js and directly at /api/tasks in src/app.js.

import express from "express";
import validate from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/auth.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../../validations/task.validation.js";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getAuditLog,
} from "./task.controller.js";

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Matches when mounted at /api/projects/:projectId/tasks
router.route("/").post(validate(createTaskSchema), createTask).get(getTasks);

// Matches when mounted directly at /api/tasks
router
  .route("/:id")
  .put(validate(updateTaskSchema), updateTask)
  .delete(deleteTask);
router.route("/:id/audit-log").get(getAuditLog);

export default router;
