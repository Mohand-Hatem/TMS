// File: src/constants/task.constant.js
// What this does: Defines reusable constants and enum lists for Task status states and priority levels across the application.
// Used by: Task.js Mongoose schema, task.validation.js Zod schemas, and database seeder scripts.

export const TASK_STATUS = {
  TO_DO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done'
};

export const TASK_STATUS_LIST = Object.values(TASK_STATUS); // ['To Do', 'In Progress', 'Done']

export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

export const TASK_PRIORITY_LIST = Object.values(TASK_PRIORITY); // ['Low', 'Medium', 'High']

export default {
  TASK_STATUS,
  TASK_STATUS_LIST,
  TASK_PRIORITY,
  TASK_PRIORITY_LIST
};
