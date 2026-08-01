// File: src/app.js
// What this does: Initializes Express application, configures security HTTP headers via helmet, HTTP request logging via morgan,
// JSON body parsing, CORS with credentials enabled for cookies, interactive Swagger documentation at /api-docs, and registers error handling.
// Used by: server.js for live server deployment and tests/auth.test.js for Supertest API test suites.

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, CLIENT_URL } from './config/Env.js';
import connectDB from './config/db.js';
import swaggerDocument from './config/swagger.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import taskRoutes from './modules/tasks/task.routes.js';

const app = express();

// Security HTTP headers protection
app.use(helmet());

// HTTP request logging (disabled during testing via NODE_ENV check to keep Jest test terminal output clean)
if (NODE_ENV !== 'test' && process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cookieParser());
// credentials: true is REQUIRED for httpOnly cookies to function cross-origin
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Interactive Swagger OpenAPI 3.0 Documentation URL
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Zero-cost health & warmup endpoint to prevent Vercel serverless cold starts
app.get('/api/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: Date.now() }));

// Ensure database connection is active before processing API requests (critical for Vercel Serverless Functions)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Register application module routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Centralized error handling middleware (must be mounted last)
app.use(errorHandler);

export default app;
