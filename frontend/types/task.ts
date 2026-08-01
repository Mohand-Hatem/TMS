import { ProjectMember } from './project';

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  project: string;
  creator: string | ProjectMember;
  assignee?: string | ProjectMember | (string | ProjectMember)[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskFilters {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  assignee?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TaskPaginatedResponse {
  tasks: Task[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignee?: string | string[];
}

export interface UpdateTaskInput {
  taskId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignee?: string | string[];
}

export interface TaskAuditLog {
  _id: string;
  id?: string;
  task: string;
  changedBy: string | ProjectMember;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  changedAt?: string;
  createdAt?: string;
}
