// File: src/config/swagger.js
// What this does: Defines the exhaustive OpenAPI 3.0 (Swagger) interactive specification object covering authentication,
// projects, tasks, pagination/search, audit logs, and security cookie schema configurations.
// Used by: src/app.js to render the interactive web testing UI on the /api-docs endpoint via swagger-ui-express.

import { PORT } from './Env.js';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management App — REST API Documentation',
    version: '1.0.0',
    description: 'Interactive OpenAPI 3.0 (Swagger) documentation for the **Task Management App Backend**. Built with Node.js, Express (ES Modules), MongoDB Atlas, Mongoose, Zod request body validation, Helmet security headers, Morgan logging, automated task status transition Audit Logging, and robust **httpOnly cookie JWT authentication**.',
    contact: {
      name: 'Mohand & Antigravity Backend Team',
      url: 'http://localhost:5000'
    }
  },
  servers: [
    {
      url: '/',
      description: 'Default Server (Relative Path)'
    },
    {
      url: `http://localhost:${PORT || 5000}`,
      description: 'Local Development & Live API Engine'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT authentication delivered and persisted automatically in browser httpOnly cookies via /api/auth/login or /api/auth/register.'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description message' },
          statusCode: { type: 'integer', example: 400 }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '659b8a8b27f1a3f01c2d3b41' },
          name: { type: 'string', example: 'Admin User' },
          email: { type: 'string', example: 'admin@test.com' },
          role: { type: 'string', enum: ['Admin', 'Member'], example: 'Admin' }
        }
      },
      Project: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '659b8a8b27f1a3f01c2d3b42' },
          name: { type: 'string', example: 'Demo Task Management Project' },
          description: { type: 'string', example: 'A fully seeded demo project ready for evaluation.' },
          owner: { type: 'string', example: '659b8a8b27f1a3f01c2d3b41' },
          members: {
            type: 'array',
            items: { type: 'string', example: '659b8a8b27f1a3f01c2d3b41' }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Task: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '659b8a8b27f1a3f01c2d3b43' },
          title: { type: 'string', example: 'Set up login and register pages' },
          description: { type: 'string', example: 'Implement authentication UI forms.' },
          status: { type: 'string', enum: ['To Do', 'In Progress', 'Done'], example: 'To Do' },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'High' },
          project: { type: 'string', example: '659b8a8b27f1a3f01c2d3b42' },
          creator: { type: 'string', example: '659b8a8b27f1a3f01c2d3b41' },
          assignee: { type: 'string', example: '659b8a8b27f1a3f01c2d3b50' },
          dueDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      AuditLog: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '659b8a8b27f1a3f01c2d3b99' },
          task: { type: 'string', example: '659b8a8b27f1a3f01c2d3b43' },
          changedBy: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          },
          fromStatus: { type: 'string', example: 'To Do' },
          toStatus: { type: 'string', example: 'In Progress' },
          changedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  tags: [
    { name: 'Auth', description: 'Account Registration, Authentication Login, and Session Termination' },
    { name: 'Projects', description: 'Project Lifecycle Management & Admin Team Membership Controls' },
    { name: 'Tasks & Audit Logs', description: 'Combined Search/Pagination Task Queries & Automated Status Change Audit Trail' }
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new Member account',
        description: 'Creates a hashed bcrypt password and attaches a live JWT to an httpOnly cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Account successfully created and authenticated.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
          },
          400: { description: 'Validation error or duplicate email registered.' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in to an existing account',
        description: 'Authenticates user via email and password, returning account details and setting the httpOnly JWT session cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@test.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentication successful; cookie attached.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
          },
          401: { description: 'Invalid credentials provided.' }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Terminate user session',
        description: 'Clears the httpOnly token cookie from the client browser.',
        responses: {
          200: { description: 'Session cleanly terminated.' }
        }
      }
    },
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Get all authorized projects',
        description: 'Fetches projects where the authenticated user is either the owner or an approved team member.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'List of authorized projects.',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } }
          },
          401: { description: 'Not authenticated; token missing from cookies.' }
        }
      },
      post: {
        tags: ['Projects'],
        summary: 'Create a new project',
        description: 'Establishes a new project owned by the caller and adds them to the initial members list.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Mobile Banking Release' },
                  description: { type: 'string', example: 'Backend microservice architecture development' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Project created.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } }
          }
        }
      }
    },
    '/api/projects/{id}': {
      put: {
        tags: ['Projects'],
        summary: 'Update an existing project',
        description: 'Modifies project title or description (Owner or Admin authorization required).',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '659b8a8b27f1a3f01c2d3b42' }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Upgraded Project Title' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Project successfully updated.' },
          403: { description: 'Not authorized to edit this project.' },
          404: { description: 'Project not found.' }
        }
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete a project',
        description: 'Permanently removes project from database (Owner or Admin authorization required).',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project deleted successfully.' },
          403: { description: 'Not authorized to delete this project.' }
        }
      }
    },
    '/api/projects/{id}/members': {
      post: {
        tags: ['Projects'],
        summary: 'Add team member to project (Admin Only)',
        description: 'Appends a user ID to the project members array.',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Target Project ID' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string', example: '659b8a8b27f1a3f01c2d3b50', description: 'User ObjectId to add' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Member added successfully.' },
          403: { description: 'Forbidden: Requires Admin role.' }
        }
      }
    },
    '/api/projects/{id}/members/{userId}': {
      delete: {
        tags: ['Projects'],
        summary: 'Remove member from project (Admin Only)',
        description: 'Removes a user ID from the project members array.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Project ID' },
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' }, description: 'Member User ID to remove' }
        ],
        responses: {
          200: { description: 'Member removed successfully.' },
          403: { description: 'Forbidden: Requires Admin role.' }
        }
      }
    },
    '/api/projects/{projectId}/tasks': {
      post: {
        tags: ['Tasks & Audit Logs'],
        summary: 'Create a new task under a project',
        description: 'Creates a task within the target project (requires project membership or Admin role).',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Implement debounce search logic' },
                  description: { type: 'string', example: 'Add 400ms debounce across search inputs.' },
                  status: { type: 'string', enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
                  priority: { type: 'string', enum: ['Low', 'Medium', 'High'], default: 'Medium' },
                  dueDate: { type: 'string', format: 'date', example: '2026-08-15' },
                  assignee: { type: 'string', description: 'User ID of assignee (optional)' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Task created.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } }
          },
          403: { description: 'Forbidden: Not a member of this project.' }
        }
      },
      get: {
        tags: ['Tasks & Audit Logs'],
        summary: 'Query tasks with combined Search, Filtering, Sorting, and Pagination (Bonus 1)',
        description: 'Fetches paginated tasks matching optional regex keyword searches and status/priority filters.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'search', in: 'query', description: 'Case-insensitive keyword search against task titles (Debounce recommended in UI)', schema: { type: 'string' }, example: 'login' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['To Do', 'In Progress', 'Done'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['Low', 'Medium', 'High'] } },
          { name: 'sort', in: 'query', schema: { type: 'string', default: '-createdAt' }, description: 'Sort syntax (e.g. -createdAt or priority)' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          200: {
            description: 'Paginated results and item counts.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    total: { type: 'integer', example: 3 },
                    page: { type: 'integer', example: 1 },
                    pages: { type: 'integer', example: 1 }
                  }
                }
              }
            }
          },
          403: { description: 'Forbidden: Not a member of this project.' }
        }
      }
    },
    '/api/tasks/{id}': {
      put: {
        tags: ['Tasks & Audit Logs'],
        summary: 'Update task attributes and trigger Audit Log on status changes (Bonus 2)',
        description: 'Modifies task data. If status transitions (e.g., To Do -> In Progress), an automated AuditLog entry is generated.',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['To Do', 'In Progress', 'Done'], example: 'In Progress' },
                  priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
                  title: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Task updated successfully; AuditLog triggered if status modified.' }
        }
      },
      delete: {
        tags: ['Tasks & Audit Logs'],
        summary: 'Delete a task',
        description: 'Permanently deletes task document (requires project membership or Admin role).',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task deleted successfully.' }
        }
      }
    },
    '/api/tasks/{id}/audit-log': {
      get: {
        tags: ['Tasks & Audit Logs'],
        summary: 'View chronological status transition history for a task (Bonus 2)',
        description: 'Fetches immutable audit tracking documents showing who changed the task status, when, and what states transitioned.',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Target Task ID' }],
        responses: {
          200: {
            description: 'Chronological timeline of status edits.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AuditLog' } }
              }
            }
          },
          403: { description: 'Forbidden: Not authorized to view project task history.' }
        }
      }
    }
  }
};

export default swaggerDocument;
