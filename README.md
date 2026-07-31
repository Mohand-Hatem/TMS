<!--
File: README.md
What this does: Provides complete documentation for setting up, seeding, running, testing, and evaluating the Task Management API.
Used by: Reviewers, developers, and testers to understand architecture, environment variables, security headers, interactive Swagger UI, and cookie-based auth testing.
-->

# Task Management App — Backend REST API (ES Modules, Swagger & Constants)

A production-ready Task Management App REST API built with Node.js (**ES Modules / Type: Module**), Express.js, MongoDB Atlas, and Mongoose. Features an interactive **Swagger (OpenAPI 3.0)** visual test interface, secure **httpOnly cookie-based JWT authentication**, robust request body validation with **Zod** in standalone validation modules, domain role/status constants, centralized asynchronous error handling, advanced query filtering/pagination/search, automated audit logging, **Helmet** HTTP security headers, and **Morgan** request logging.

---

## 🌐 Live Interactive OpenAPI 3.0 Documentation (Swagger UI)

Unlike standard REST backends requiring external HTTP client applications, this API includes an **embedded interactive Swagger testing engine** directly out-of-the-box.

When running your server locally, navigate your browser to:
### 👉 **`http://localhost:5000/api-docs`**

### Why Test with Swagger?
* **Zero Software Needed:** Reviewers do not need to install Postman or import JSON files.
* **Live "Try It Out" Execution:** You can test every endpoint directly inside your browser. Simply click the **Try it out** button on `POST /api/auth/login` with your demo credentials, press **Execute**, and the browser automatically captures the secure `httpOnly` session cookie!
* **Enterprise Standard:** Built strictly using OpenAPI 3.0 specification guidelines in `src/config/swagger.js`.

---

## 🏛 Architecture Overview

The codebase strictly adheres to a **modular ES modules architecture** separated by business concerns. Models, middleware, database configurations, validation rules, application constants (`Admin`, `Member`, task statuses), interactive OpenAPI definitions, and feature modules (`auth`, `projects`, `tasks`) live in clearly segregated layers. Every async controller utilizes `express-async-handler` to eliminate manual `try/catch` boilerplate, forwarding any exceptions directly to a unified comprehensive centralized error handling middleware.

### Project Folder Tree
```
project-root/
├── src/
│   ├── config/
│   │   ├── Env.js                # Centralized environment config loader
│   │   ├── db.js                 # MongoDB Atlas connection logic via Mongoose
│   │   └── swagger.js            # Interactive OpenAPI 3.0 specification object
│   ├── constants/
│   │   ├── roles.constant.js     # User role enum definitions (Admin & Member)
│   │   └── task.constant.js      # Task status & priority enum definitions
│   ├── middlewares/
│   │   ├── auth.js               # Cookie JWT extraction & role authorization
│   │   ├── errorHandler.js       # Comprehensive JSON error response formatting
│   │   └── validate.js           # Zod schema validation engine
│   ├── models/
│   │   ├── User.js               # User schema & roles (Admin / Member)
│   │   ├── Project.js            # Project schema & membership relationships
│   │   ├── Task.js               # Task schema with status & priorities
│   │   └── AuditLog.js           # Immutable status transition audit tracking
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   └── auth.routes.js
│   │   ├── projects/
│   │   │   ├── project.controller.js
│   │   │   └── project.routes.js
│   │   └── tasks/
│   │       ├── task.controller.js
│   │       └── task.routes.js
│   ├── utils/
│   │   └── generateToken.js      # JWT signing & httpOnly cookie attachment
│   ├── validations/
│   │   ├── auth.validation.js    # External Zod schemas for auth inputs
│   │   ├── project.validation.js # External Zod schemas for projects & team members
│   │   └── task.validation.js    # External Zod schemas for tasks
│   ├── seed.js                   # Direct Mongo cleaner & demo data seeding script
│   ├── app.js                    # Express configuration, Swagger, Helmet, Morgan, & Cors setup
│   └── server.js                 # Application startup & port listener
├── tests/
│   └── auth.test.js              # 5 required integration tests using in-memory Mongo
├── .env.example
├── .gitignore
├── postman_collection.json       # Pre-configured Postman testing endpoints
├── README.md
└── package.json
```

---

## ⚙️ Setup & Execution Guide

Follow these simple commands to install, seed, test, and start the backend:

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup (.env)
Copy the example environment configuration:
```bash
cp .env.example .env
```
Ensure your MongoDB Atlas or local database URI is placed into `MONGO_URI`.

#### Environment Variables Explained:
- `MONGO_URI`: The connection string for MongoDB Atlas cloud cluster.
- `JWT_SECRET`: Secret cryptographic key used to sign and verify JSON Web Tokens.
- `PORT`: Network port on which the HTTP API listens (default: `5000`).
- `NODE_ENV`: Execution environment (`development`, `test`, or `production`). Controls cookie security flags and Morgan request log muting during test runs.
- `CLIENT_URL`: Approved origin domain allowed by CORS with credentials enabled (default: `http://localhost:3000`).

---

## 🌱 Seeding the Database & Test Credentials

Run the direct Mongoose seeder script to wipe old data and generate rich demo users, projects, and varied tasks:
```bash
npm run seed
```

### 🔑 Seeded Test Credentials:
| Account Role | Email Address | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `password123` |
| **Member** | `member@test.com` | `password123` |

*(Note: All passwords are securely hashed with bcrypt prior to DB insertion).*

---

## 🚀 Running the Server

Start the API server in development mode (with hot reloading via nodemon) or standard production mode:
```bash
# Development mode (Nodemon + Morgan request logging executing src/server.js)
npm run dev

# Standard deployment mode
npm start
```
Once booted, visit **`http://localhost:5000/api-docs`** to explore the Swagger UI!

---

## 🧪 Running Automated Tests

The test suite utilizes Jest with ES module support (`--experimental-vm-modules`), Supertest, and `mongodb-memory-server` to run integration checks in isolation without touching or putting your live MongoDB database at risk:
```bash
npm test
```

### Proven Test Cases:
1. **Password Security:** Registering a user stores a bcrypt hashed password rather than plaintext.
2. **Authentication Defense:** Logging in with an incorrect password immediately returns an HTTP `401 Unauthorized` status.
3. **Cookie Enforcement:** Attempting to hit protected routes with no session cookie attached returns an HTTP `401 Unauthorized` status.
4. **Access boundaries:** A user attempting to read or edit projects where they are neither the owner nor a team member receives an HTTP `403 Forbidden` status.
5. **Audit Traceability:** Updating a task's status from one state to another automatically triggers the creation of an immutable `AuditLog` document in the database.
