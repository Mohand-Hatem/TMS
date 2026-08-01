import * as z from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const addMemberSchema = z.object({
  userId: z.string().min(1, 'Please provide a valid User ID to add'),
});

export type AddMemberFormValues = z.infer<typeof addMemberSchema>;
