# Task Management System (TMS)

A production-minded, collaborative full-stack web application designed for teams to plan projects, manage tasks, assign responsibilities, and track workflows securely.

---

## 🔗 Live Deployments & Demos

* **Frontend UI Application:** [https://tms-t3wo.vercel.app/](https://tms-t3wo.vercel.app/)
* **Backend API Base URL:** [https://tms-back-end.vercel.app/](https://tms-back-end.vercel.app/)
* **Interactive API (Swagger) Docs:** [https://tms-back-end.vercel.app/api-docs/](https://tms-back-end.vercel.app/api-docs/)

---

## 🌱 Default Seed / Test Accounts

For testing the application (locally or on the live deployments), you can use the pre-seeded demo accounts:

| Role | Email | Password | Permissions / Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `password123` | Can create projects, add/remove members, and manage/assign all tasks. |
| **Member** | `member@test.com` | `password123` | Can view projects they belong to, edit tasks assigned to them, and update task statuses. |

---

## 💡 The Core Project Idea
The **Task Management System (TMS)** solves the complexity of team collaboration by providing a secure, centralized task board. The application's goal is to enable teams to work on projects collectively while enforcing permissions and tracking activity.

### Core Product Capabilities:
* **Project Workspaces:** Users can create custom projects and view only the workspaces they own or have been invited to join.
* **Team Collaboration (RBAC):** Supports hierarchical access control:
  * **Admins** can manage project details, add team members to projects, and assign tasks.
  * **Members** can view projects they belong to, edit tasks assigned to them, and update task statuses.
* **Task Boards & Urgency:** Tasks are categorized with titles, descriptions, due dates, statuses (`To Do`, `In Progress`, `Done`), and priority levels (`Low`, `Medium`, `High`).
* **Security & Isolation:** Unauthorized users are strictly blocked from viewing or editing projects and tasks they are not members of.
* **Immutable Activity Audit Trail:** Every time a task's status changes, the backend automatically generates a permanent log entry to track the project's progress history.

---

## ⚙️ How We Implemented the Backend
The backend is structured as a modular, secure, and performant REST API. It handles database persistence, security policies, role authorization, and data validation.

### Core Backend Implementations:
1. **Modular Code Structure:** Business logic is organized into clean, concerns-separated feature directories (`auth`, `projects`, `tasks`) containing their own controllers and routes.
2. **Stateless Security (JWT + Cookies):** Instead of storing tokens in browser localStorage (which is vulnerable to XSS attacks), the API signs a JWT session token and delivers it to the browser inside a secure, `httpOnly`, `sameSite: 'strict'` cookie.
3. **Database Caching & Serverless Readiness:** Built with MongoDB Atlas and Mongoose. We implemented connection status checks (`readyState`) so that when deployed to serverless environments (like Vercel), database connections are cached and reused across requests.
4. **Input Schema Validation:** All request payloads (`req.body`, `req.params`, `req.query`) are validated at runtime using **Zod** middleware schemas to block invalid or malicious data.
5. **Interactive Swagger Playground:** OpenAPI 3.0 documentation is embedded directly into the server (accessible at `/api-docs`), allowing direct browser-based API testing.
6. **Automated Integration Testing:** Implemented an integration test suite using **Jest** and **Supertest** running against an isolated, in-memory MongoDB server to test registration, login, route protection, authorization barriers, and audit logging.

### Backend Technologies:
* **Runtime:** Node.js (configured as ES Modules)
* **API Server:** Express.js 4
* **Database & ODM:** MongoDB Atlas & Mongoose
* **Validation:** Zod
* **Security:** Helmet (HTTP security headers), CORS, bcrypt (password hashing)
* **Testing:** Jest & Supertest (with `mongodb-memory-server`)
* **Documentation:** Swagger UI (OpenAPI 3.0)

---

## 🎨 How We Implemented the Frontend
The frontend is built as a fast, responsive, and visual single-page application (SPA) styled with modern web standards and supporting full Light/Dark mode.

### Core Frontend Implementations:
1. **Hybrid Server & Client Rendering:** Developed using Next.js 16 (App Router), leveraging Server Components for fast initial data fetching and page loads, combined with interactive Client Components for forms and boards.
2. **Next.js Proxy Rewrites:** To bypass cross-origin cookie-blocking policies in modern browsers, client-side requests are made to relative `/api` paths. Next.js proxies these requests to the backend, ensuring secure cookie delivery.
3. **Server-Side Cookie Handover:** Inside Next.js Server Components, the server reads the `httpOnly` auth cookie from the client browser and forwards it to the backend REST API, allowing secure data rendering before the page loads.
4. **Optimistic UI & Cache Synchronization:** Powered by **React Query**. When tasks are moved or updated, the UI updates instantly (optimistic updates) while synchronizing in the background to ensure a smooth, fluid user experience.
5. **Client-Side Form Validation:** Form inputs (Login, Register, Create/Edit tasks) validate instantly in the browser using React Hook Form and Zod schemas.
6. **Responsive Layouts:** Styled with Tailwind CSS v4 and accessible components, adapting smoothly to mobile, tablet, and desktop screens.

### Frontend Technologies:
* **Framework:** Next.js 16 (React 19) & TypeScript
* **State & Fetching:** `@tanstack/react-query` & Axios
* **Styling & Components:** Tailwind CSS v4 & Shadcn UI component design tokens
* **Validation:** React Hook Form & Zod
* **Feedback:** Next Themes (Dark/Light mode) & Sonner (toast notifications)

---

## 🚀 How to Run the Project Locally

### 1. Start the Backend API
Navigate to the backend folder and install the dependencies:
```bash
cd backend
npm install
```
Configure your local environment variables:
```bash
cp .env.example .env
# Open .env and set your MONGO_URI, JWT_SECRET, and PORT (defaults to 5000)
```
Wipe and seed the database with initial demo data (Admin & Member accounts):
```bash
npm run seed
```
Start the backend server in development mode:
```bash
npm run dev
# The API will be active at http://localhost:5000
# The interactive Swagger UI documentation is available at http://localhost:5000/api-docs
```

### 2. Start the Frontend UI
In a new terminal, navigate to the frontend folder and install the dependencies:
```bash
cd frontend
npm install
```
Link the frontend to your local backend API:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```
Start the Next.js development server:
```bash
npm run dev
# The application will be active in your browser at http://localhost:3000
```
