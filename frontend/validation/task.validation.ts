import * as z from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  status: z.enum(['To Do', 'In Progress', 'Done'], {
    message: 'Please select a valid task status',
  }),
  priority: z.enum(['Low', 'Medium', 'High'], {
    message: 'Please select a valid task priority',
  }),
  dueDate: z.string().optional(),
  assignee: z.union([
    z.string(),
    z.array(z.string()).max(5, 'Maximum 5 teammates can be assigned to a single task')
  ]).optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
