Build a complete backend project for a Task Management App with the exact stack and rules below. Do not add any package, library, feature, or file that isn't explicitly listed here — no Swagger, no seed-script alternatives, no extra bonus features, no extra middleware "just in case."

## Stack
- Node.js + Express.js
- MongoDB + Mongoose
- Auth: JWT stored in an httpOnly cookie (NOT Bearer header, NOT localStorage)
- cookie-parser for reading the cookie
- bcrypt for password hashing
- express-async-handler on every controller function (no manual try/catch anywhere)
- Zod for request validation
- Jest + Supertest + mongodb-memory-server for testing
- Docs: Postman collection only (no Swagger, no other doc tool)
- dotenv for environment variables
- cors, configured with credentials: true (required for cookies to work)

## Global rule for every file you create
At the very top of every file, add a short comment block explaining:
1. What this file does
2. How it fits into the rest of the app (what calls it / what it depends on)

Example style:
```js
// File: src/middlewares/auth.js
// What this does: verifies the JWT stored in the httpOnly cookie and attaches
// the decoded user (id, role) to req.user. Also exports an `authorize` function
// to gate routes by role.
// Used by: any route that needs a logged-in user (projects, tasks routes).
```

## Data models (only these 4 — no extra fields, no extra collections)
1. **User**: name, email (unique), passwordHash, role (enum: Admin, Member, default Member)
2. **Project**: name, description, owner (ref User), members (array of ref User)
3. **Task**: title, description, status (enum: To Do, In Progress, Done), priority (enum: Low, Medium, High), dueDate, project (ref Project), creator (ref User), assignee (ref User)
4. **AuditLog**: task (ref Task), changedBy (ref User), fromStatus, toStatus, changedAt (default now)

## Auth requirements
- POST /api/auth/register — hash password with bcrypt, save user, role always defaults to Member, set JWT as httpOnly cookie on success
- POST /api/auth/login — verify with bcrypt.compare, set JWT as httpOnly cookie on success
- POST /api/auth/logout — clears the cookie
- Cookie settings: httpOnly: true, sameSite: 'strict', secure: true only when NODE_ENV is production, 7 day expiry
- authenticate middleware reads the token from req.cookies.token (not headers)
- authorize(...roles) middleware checks req.user.role

## Projects module (only these routes)
- POST /api/projects — creates project, creator becomes owner and first member
- GET /api/projects — returns only projects where the logged-in user is owner OR in members
- PUT /api/projects/:id — owner or Admin only
- DELETE /api/projects/:id — owner or Admin only
- POST /api/projects/:id/members — Admin only, adds a user to members
- DELETE /api/projects/:id/members/:userId — Admin only, removes a user from members

## Tasks module (only these routes)
- POST /api/projects/:projectId/tasks — creates a task, must verify the user has access to that project first
- GET /api/projects/:projectId/tasks — supports query params: status, priority, assignee, search (partial match on title, case-insensitive), page, limit, sort. Build this as ONE query using these params together — do not build separate endpoints for filtering vs pagination vs search.
- PUT /api/tasks/:id — updates a task; if status is changed, create an AuditLog entry for the change (fromStatus, toStatus, changedBy, task) in the same request
- DELETE /api/tasks/:id
- GET /api/tasks/:id/audit-log — returns all AuditLog entries for that task, newest first

## Bonus features (only these two — do not add anything beyond them)
1. Pagination, sorting, and search on the GET tasks endpoint (as described above)
2. Audit log for task status changes (as described above)

## Validation & error handling
- Validate request bodies with Zod before they hit Mongoose (at minimum: register, login, create project, create task, update task)
- One centralized Express error-handling middleware, mounted last, that returns this exact JSON shape:
```json
{ "success": false, "message": "...", "statusCode": 400 }
```
- Handle these cases specifically in that middleware: Mongoose ValidationError (400), duplicate key error code 11000 (400), JsonWebTokenError (401), and a generic fallback (500)
- Every controller must use express-async-handler so thrown errors reach this middleware automatically — no manual try/catch blocks anywhere in the codebase

## Testing (write exactly these, using mongodb-memory-server so no real DB is touched)
1. Registering a user stores a hashed password, not plaintext
2. Logging in with the wrong password returns 401
3. Hitting a protected route with no cookie returns 401
4. A user who is not a project member cannot view/edit that project (403)
5. Changing a task's status creates a matching AuditLog entry

## Seed script
Create src/seed.js, runnable via `npm run seed`. It must:
- Connect directly via Mongoose (not through the API)
- Wipe existing Users, Projects, Tasks, and AuditLogs first (so re-running doesn't create duplicates)
- Create one Admin (admin@test.com / password123, password properly hashed with bcrypt)
- Create one Member (member@test.com / password123, password properly hashed with bcrypt)
- Create one Project owned by Admin, with both Admin and Member in members
- Create 3 Tasks in that project with varied status/priority/assignee so pagination/search/filter have real data to work against
- Log the test credentials to the console when done

## Folder structure (use exactly this — no extra top-level folders)
```
project-root/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── AuditLog.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── projects/
│   │   └── tasks/
│   ├── utils/
│   │   └── generateToken.js
│   ├── seed.js
│   └── app.js
├── tests/
├── .env.example
├── .gitignore
├── postman_collection.json
├── README.md
├── package.json
└── server.js
```

## README requirements
Must include: architecture overview + folder tree, setup steps (npm install, .env setup, npm run seed, npm start), explanation of each env var, how to run tests, the seeded test credentials, a note that auth uses httpOnly cookies so testing must be done through Postman (which handles cookies automatically) rather than manually attaching a header, and a short explanation of how audit log and pagination/search/sort work.

## Postman collection
Build postman_collection.json with folders: Auth, Projects, Tasks, Audit Log — one request per route listed above.

## Final instructions for you (the AI)
- Build every file listed in the folder structure — nothing more, nothing less
- Every file starts with the explanatory comment block described above
- Do not include Swagger, alternate auth strategies, extra bonus features, extra npm packages, or placeholder/example code that isn't part of the actual app
- After creating the project, tell me exactly which commands to run to install dependencies, seed the database, start the server, and run the tests
