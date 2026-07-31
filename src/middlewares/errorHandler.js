// File: src/middlewares/errorHandler.js
// What this does: A comprehensive centralized Express error handling middleware that intercepts all application exceptions,
// normalizing Mongoose validation, duplicate key, CastErrors (malformed IDs), malformed JSON payloads, and JWT authentication errors.
// Used by: Mounted as the absolute last middleware inside src/app.js to catch all errors forwarded by express-async-handler.

import { NODE_ENV } from '../config/Env.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? (err.statusCode || err.status || 500) : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // 1. Handle specific Mongoose ValidationError (schema validation failure)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {}).map((val) => val.message).join(', ') || 'Validation error';
  }

  // 2. Handle Mongoose Duplicate Key error (e.g., trying to register an existing email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate field value entered for '${field}' (already exists in database)`;
  }

  // 3. Handle Mongoose CastError (e.g., malformed ObjectId in URL params like /api/projects/123invalid)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource ID format for '${err.path}': ${err.value}`;
  }

  // 4. Handle JsonWebToken signature modification or invalid format
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token provided';
  }

  // 5. Handle JsonWebToken expiration
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired; please log in again';
  }

  // 6. Handle Express malformed JSON body parse syntax errors (bad JSON sent by client)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON syntax in request body';
  }

  // 7. Handle Zod validation errors if passed directly as raw ZodError
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors ? err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') : 'Request payload validation failed';
  }

  // Return unified JSON error shape matching specification requirements
  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
