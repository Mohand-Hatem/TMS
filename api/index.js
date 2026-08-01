// File: api/index.js
// What this does: Serverless entry point for Vercel deployment. Ensures MongoDB Atlas connection is active before handing requests to Express.
// Used by: Vercel AWS Lambda routing via vercel.json.

import app from '../src/app.js';
import connectDB from '../src/config/db.js';

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
