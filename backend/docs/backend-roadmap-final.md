# Task Management App — Backend Roadmap (FINAL, Updated)

**Stack:** Node.js + Express.js + MongoDB + Mongoose
**Auth:** JWT stored in an `httpOnly` cookie (not Bearer header)
**Error handling:** `express-async-handler` + centralized error middleware
**Bonus features (only these two):** Pagination/Sorting/Search · Audit Log for task status changes
**Docs:** Postman Collection (no Swagger)
**Seed data:** Yes — a seed script creates Admin, Member, a Project, and sample Tasks

This document reflects every decision made and changed during planning. Nothing here is exploratory — this is the version to actually build.

---

## Updated Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Express.js | Minimal, fast to build a REST API with, no boilerplate overhead. |
| Database | MongoDB | Document model fits Users/Projects/Tasks well; no migrations needed. |
| ODM | Mongoose | Gives you schemas, validation, and `.populate()` for relations. |
| Auth | JWT + bcrypt, delivered via **httpOnly cookie** | bcrypt hashes passwords; JWT is the token; cookie delivery avoids exposing the token to JS (XSS-safer than localStorage). |
| Cookie parsing | `cookie-parser` | Lets Express read `req.cookies`. |
| Async error handling | `express-async-handler` | Removes the need for `try/catch` in every controller. |
| Validation | Zod | Validates/sanitizes request bodies before they hit Mongoose. |
| Testing | Jest + Supertest + `mongodb-memory-server` | Runs real Mongo queries against a temporary, in-memory database — no risk to real data. |
| Docs | Postman Collection | Satisfies the "API docs" submission requirement without Swagger overhead. |

---

## Folder Structure

```
project-root/
├── src/
│   ├── config/
│   │   └── db.js                 # mongoose.connect()
│   ├── middlewares/
│   │   ├── auth.js               # authenticate + authorize
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── AuditLog.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   └── auth.routes.js
│   │   ├── users/
│   │   ├── projects/
│   │   │   ├── project.controller.js
│   │   │   └── project.routes.js
│   │   └── tasks/
│   │       ├── task.controller.js
│   │       └── task.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── seed.js                   # seed script
│   └── app.js
├── tests/
├── .env.example
├── .gitignore
├── postman_collection.json
└── server.js
```

**Why this structure:** each module (`auth`, `projects`, `tasks`) owns its own controller + routes. Models are separate from business logic. This is "separation of concerns" — directly graded under architecture and code quality.

---

## Phase 0 — Project Setup
**Time estimate:** 30–45 min

### What we do
Initialize the repo, install dependencies, create the folder layout, set up `.env`.

### Dependencies
```bash
npm init -y
npm install express mongoose bcrypt jsonwebtoken dotenv zod cookie-parser express-async-handler cors
npm install -D nodemon jest supertest mongodb-memory-server
```

### `.env.example`
```
MONGO_URI=mongodb://localhost:27017/taskapp
JWT_SECRET=supersecretkey
PORT=5000
NODE_ENV=development
```

### `server.js`
```js
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
```

### `src/app.js`
```js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // credentials: true is REQUIRED for cookies to work cross-origin

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/projects', require('./modules/projects/project.routes'));
app.use('/api/tasks', require('./modules/tasks/task.routes'));

app.use(errorHandler); // must be last

module.exports = app;
```

### Why this matters
Graded under **"Backend architecture & API quality" (25%)** and **"Code quality" (15%)**. `cors({ credentials: true })` is not optional here — since we switched to cookie-based auth, the browser will silently refuse to send/receive cookies cross-origin without it.

---

## Phase 1 — Database Design (Mongoose Schemas)
**Time estimate:** 1 hour

### `src/models/User.js`
```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

### `src/models/Project.js`
```js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
```

*Why an array of ObjectIds instead of a join table:* Mongo doesn't need a separate `ProjectMember` table like SQL would. Storing `members` directly on the `Project` document is the native way to represent many-to-many here, and it's what `.populate('members')` is built for.

### `src/models/Task.js`
```js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: Date,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
```

### `src/models/AuditLog.js` (bonus feature)
```js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromStatus: String,
  toStatus: String,
  changedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

### Why this matters
Graded under **"Database design" (15%)**. The reviewer checks for correct relationships and no redundant data — `ref` + `.populate()` is how you avoid duplicating user info inside every task/project.

---

## Phase 2 — Authentication & Authorization (Cookie-Based)
**Time estimate:** 2.5–3 hours

### What changed from the original plan
The token is no longer returned in the JSON body and read from an `Authorization: Bearer <token>` header. Instead:
- Login sets the JWT as an `httpOnly` cookie on the response.
- The browser/Postman automatically resends that cookie on every future request — nothing manually attached.
- `authenticate` reads `req.cookies.token` instead of a header.
- A real `POST /api/auth/logout` route now exists, since there's nothing for the client to "just delete" anymore — the server must clear the cookie.

### `src/utils/generateToken.js`
```js
const jwt = require('jsonwebtoken');

function generateToken(res, userId, role) {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,          // JS in the browser can't read/steal it (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',      // browser won't send it on cross-site requests (CSRF protection)
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

module.exports = generateToken;
```

### `src/modules/auth/auth.controller.js`
```js
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const User = require('../../models/User');
const generateToken = require('../../utils/generateToken');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: 'Member' });

  generateToken(res, user._id, user.role);
  res.status(201).json({ id: user._id, name: user.name, role: user.role });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  generateToken(res, user._id, user.role);
  res.json({ id: user._id, name: user.name, role: user.role });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

module.exports = { register, login, logout };
```

**Notice:** no `try/catch` anywhere — `asyncHandler` catches any thrown error and forwards it to the centralized error handler automatically.

### `src/middlewares/auth.js`
```js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token; // reading from cookie, not header

  if (!token) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // { id, role }
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized for this action');
  }
  next();
};

module.exports = { authenticate, authorize };
```

### Why this matters
Satisfies "hash passwords," "protect routes," "at least two roles" — plus the cookie approach is more resistant to token theft via XSS than storing a token in JS-accessible storage. `sameSite: 'strict'` is the lightweight CSRF defense that's appropriate for this project's scope (no need for a full CSRF-token system).

---

## Phase 3 — Projects Module
**Time estimate:** 2 hours

### Endpoints
| Method | Route | Who | What |
|---|---|---|---|
| POST | `/api/projects` | Any logged-in user | Creates project, creator becomes owner + first member |
| GET | `/api/projects` | Any logged-in user | Only projects where user is owner OR member |
| PUT | `/api/projects/:id` | Owner/Admin | Update |
| DELETE | `/api/projects/:id` | Owner/Admin | Delete |
| POST | `/api/projects/:id/members` | Admin only | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin only | Remove member |

### `src/modules/projects/project.controller.js`
```js
const asyncHandler = require('express-async-handler');
const Project = require('../../models/Project');

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

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { members: req.user.id }]
  }).populate('owner', 'name email');

  res.json(projects);
});

const addMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404); throw new Error('Project not found'); }

  project.members.addToSet(req.params.userId || req.body.userId); // addToSet avoids duplicates
  await project.save();
  res.json(project);
});

module.exports = { createProject, getProjects, addMember };
```

### Why this matters
The `$or` filter is the actual access-control mechanism — without it, any logged-in user could `GET` every project in the database. This is something a reviewer will specifically try to break.

---

## Phase 4 — Tasks Module + Bonus (Pagination, Sorting, Search)
**Time estimate:** 3 hours

### Query example
```
GET /api/projects/64f.../tasks?status=To Do&priority=High&assignee=64a...&page=1&limit=10&sort=dueDate&search=login
```

### `src/modules/tasks/task.controller.js`
```js
const asyncHandler = require('express-async-handler');
const Task = require('../../models/Task');
const AuditLog = require('../../models/AuditLog');

// GET /api/projects/:projectId/tasks
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, assignee, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const filter = { project: req.params.projectId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;
  if (search) filter.title = { $regex: search, $options: 'i' }; // case-insensitive partial match

  const tasks = await Task.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Task.countDocuments(filter);

  res.json({ tasks, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// PUT /api/tasks/:id  -- also triggers the audit log
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }

  const oldStatus = task.status;

  Object.assign(task, req.body);
  await task.save();

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

module.exports = { getTasks, updateTask };
```

### Why this matters
One query does double duty: `status`/`priority`/`assignee` satisfy the **required** filtering, while `page`/`limit`/`sort`/`search` are the **bonus**. Building them as the same feature saves real time instead of treating them as separate work.

---

## Phase 5 — Audit Log (Bonus Feature)
**Time estimate:** ~30 min (already wired into Phase 4's `updateTask`)

### Bonus read endpoint
```js
// GET /api/tasks/:id/audit-log
const getAuditLog = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find({ task: req.params.id })
    .sort('-changedAt')
    .populate('changedBy', 'name email');
  res.json(logs);
});
```

### Why this matters
Real-world pattern for accountability/compliance ("who changed this and when"). Cheap to add since you're already inside the update-task request — you're just writing one extra document.

---

## Phase 6 — Validation & Centralized Error Handling
**Time estimate:** 1 hour

### `src/middlewares/validate.js` (Zod)
```js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400);
    return next(new Error(result.error.errors.map(e => e.message).join(', ')));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
```

### `src/middlewares/errorHandler.js`
```js
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'ValidationError') { statusCode = 400; } // Mongoose validation
  if (err.code === 11000) { statusCode = 400; message = 'Duplicate field value'; }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }

  res.status(statusCode).json({ success: false, message, statusCode });
};

module.exports = errorHandler;
```

### Why this matters
Because every controller uses `asyncHandler`, **every** thrown error — Mongoose validation, JWT errors, manually thrown `Error`s — funnels into this one place. The API always responds with the same predictable JSON shape instead of ever hanging or crashing.

---

## Phase 7 — Testing
**Time estimate:** 1.5 hours

### What jest / supertest / mongodb-memory-server each do
- **Jest** — runs your test files and checks `expect(x).toBe(y)` style assertions; prints pass/fail.
- **Supertest** — sends fake HTTP requests straight into your Express app (`request(app).post(...)`) without needing a real server running on a real port.
- **mongodb-memory-server** — spins up a real, temporary, in-memory MongoDB just for the test run, so tests never touch (or risk) your actual database.

### `tests/auth.test.js`
```js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('register hashes the password, does not store plaintext', async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Test', email: 'test@test.com', password: 'password123'
  });

  const user = await User.findOne({ email: 'test@test.com' });
  expect(user.passwordHash).not.toBe('password123');
});

test('login with wrong password is rejected', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'test@test.com', password: 'wrongpassword'
  });
  expect(res.status).toBe(401);
});

test('protected route with no cookie returns 401', async () => {
  const res = await request(app).get('/api/projects');
  expect(res.status).toBe(401);
});
```

### The 5 required tests
1. Register stores a hashed password, not plaintext.
2. Login with wrong password → 401.
3. Protected route with no cookie → 401.
4. Non-member accessing a project they don't belong to → 403.
5. Changing a task's status creates a matching `AuditLog` entry.

### Why this matters
Graded directly as **"Testing" (10%)**. These tests prove the security-critical logic (hashing, auth gating, access control) actually works, not just that it "looks right."

---

## Phase 8 — Postman Documentation & Seed Data
**Time estimate:** ~1 hour, built incrementally

### Part 1 — Postman collection
As each route is finished and confirmed working, save that exact request into a Postman collection, grouped into folders: `Auth`, `Projects`, `Tasks`, `Audit Log`. Because auth is cookie-based, Postman's built-in cookie jar handles the session automatically after login — no manual header copy-pasting between requests. When everything's built, use Postman's **Export** button to produce `postman_collection.json` and commit it to the repo root.

### Part 2 — Seed script (kept, per your decision)
A seed script is one file (`src/seed.js`) you run once with `npm run seed`. It talks to Mongoose **directly** — it does not go through your API routes — and inserts:

- **Admin** — `admin@test.com` / `password123`, `role: 'Admin'` set directly
- **Member** — `member@test.com` / `password123`, `role: 'Member'`
- **One Project** — owned by Admin, with Member added to `members`
- **A few Tasks** — mixed statuses/priorities, some assigned to each user

**Why each part exists:**
- Two roles → reviewer can log in as each and verify permission checks actually reject the Member from Admin-only actions.
- A pre-made project → something to `GET /api/projects` immediately, no manual setup.
- Varied tasks → data to actually exercise pagination/sort/search/filter against.

Passwords are still hashed with `bcrypt.hash()` inside the script — bypassing the API doesn't mean bypassing security, and un-hashed seeded passwords would simply fail to log in.

```js
// src/seed.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const AuditLog = require('./models/AuditLog');

async function seed() {
  await connectDB();

  // wipe old data so re-running doesn't create duplicates / hit unique constraint errors
  await Promise.all([User.deleteMany(), Project.deleteMany(), Task.deleteMany(), AuditLog.deleteMany()]);

  const adminHash = await bcrypt.hash('password123', 10);
  const memberHash = await bcrypt.hash('password123', 10);

  const admin = await User.create({ name: 'Admin User', email: 'admin@test.com', passwordHash: adminHash, role: 'Admin' });
  const member = await User.create({ name: 'Member User', email: 'member@test.com', passwordHash: memberHash, role: 'Member' });

  const project = await Project.create({
    name: 'Demo Project',
    description: 'Seeded sample project',
    owner: admin._id,
    members: [admin._id, member._id]
  });

  await Task.insertMany([
    { title: 'Set up login page', status: 'To Do', priority: 'High', project: project._id, creator: admin._id, assignee: member._id },
    { title: 'Design database schema', status: 'In Progress', priority: 'Medium', project: project._id, creator: admin._id, assignee: admin._id },
    { title: 'Write README', status: 'Done', priority: 'Low', project: project._id, creator: admin._id, assignee: member._id }
  ]);

  console.log('Seed complete: admin@test.com / member@test.com, both password123');
  process.exit(0);
}

seed();
```

```json
// package.json
"scripts": {
  "seed": "node src/seed.js"
}
```

### Why this matters
Satisfies *"Provide API documentation or a Postman collection"* and *"Include test credentials or seed instructions"* directly, and means the reviewer has working accounts + populated data within seconds of `npm run seed`, with zero manual clicking through your app first.

---

## Phase 9 — README & Final Submission
**Time estimate:** 1 hour

### Must include
- Architecture overview (one paragraph + folder tree)
- Setup: `npm install`, `.env` setup, `npm run seed`, `npm start`
- Env vars explained: `MONGO_URI`, `JWT_SECRET`, `PORT`
- **Note that auth uses httpOnly cookies, not Bearer tokens** — so testers must log in via Postman (its cookie jar handles the rest automatically) rather than manually pasting a token into headers
- How to run tests: `npm test`
- Seeded test credentials (Admin/Member emails + password)
- 1–2 lines each on how audit log + pagination/search/sort work
- Link to `postman_collection.json`

### Why this matters
Graded as **"Documentation & setup" (10%)**. A reviewer should clone, follow the README, and have a fully working, populated app in under 5 minutes — including understanding that they need Postman (not curl with manual headers) to properly exercise cookie-based auth.

---

## Full Time Budget

| Phase | Task | Hours |
|---|---|---|
| 0 | Setup | 0.5 |
| 1 | DB Design (Schemas) | 1 |
| 2 | Auth (cookie-based) & Authorization | 2.5–3 |
| 3 | Projects Module | 2 |
| 4 | Tasks Module + Pagination/Sort/Search | 3 |
| 5 | Audit Log | *(bundled in Phase 4)* |
| 6 | Validation & Error Handling | 1 |
| 7 | Testing | 1.5 |
| 8 | Postman Docs & Seed Data | 1 |
| 9 | README & Submission | 1 |
| **Total** | | **~13.5–14 hrs** |

---

## Grading Alignment Check

| Evaluation Area | Weight | Covered By |
|---|---|---|
| Backend architecture & API quality | 25% | Phases 0, 2, 3, 4, 6 |
| Database design | 15% | Phase 1 |
| Testing | 10% | Phase 7 |
| Documentation & setup | 10% | Phases 8, 9 |
| Code quality | 15% | Ongoing (structure, `asyncHandler`, naming) |
| Git practices | 5% | Ongoing — commit after each phase |

*(Frontend implementation & UX — 20% — not covered here; this roadmap is backend-only.)*

---

## Suggested Build Order

1. Setup + `db.js` + `.env.example`
2. Mongoose models (User, Project, Task, AuditLog)
3. Auth module — register/login/logout, cookie-based, `authenticate`/`authorize` middleware
4. Projects module + access filtering
5. Tasks module + pagination/sorting/search + audit log trigger
6. Validation (Zod) + centralized error handler
7. Tests (5 required)
8. Seed script + Postman collection (build the collection as you go, not at the end)
9. README + final commit

Say the word whenever you want to start scaffolding the actual code for any phase.
