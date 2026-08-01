// File: src/server.js
// What this does: The application entry point. Imports centralized environment variables from Env.js,
// connects to MongoDB via Mongoose, and launches the Express server on the specified port.
// Used by: Executed by `node src/server.js` or `npm start` / `npm run dev` to boot up the backend API.

import { PORT, NODE_ENV } from './config/Env.js';
import app from './app.js';
import connectDB from './config/db.js';

connectDB().then(() => {
  // Only invoke app.listen when running locally or on a standard server; Vercel Serverless manages HTTP connections via default export
  if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`));
  }
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

// Required export for Vercel Serverless Functions (@vercel/node)
export default app;
