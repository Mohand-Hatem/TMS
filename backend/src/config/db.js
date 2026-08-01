// File: src/config/db.js
// What this does: Establishes a connection to the MongoDB Atlas database via Mongoose utilizing MONGO_URI from Env.js.
// Used by: server.js during live deployment and by src/seed.js during database seeding operations.

import mongoose from "mongoose";
import { MONGO_URI, NODE_ENV } from "./Env.js";

const connectDB = async () => {
  try {
    // Reuse active Mongoose connection or bypass during automated Jest testing (critical for Vercel Serverless performance and test isolation)
    if (mongoose.connection.readyState >= 1 || NODE_ENV === 'test' || process.env.NODE_ENV === 'test') {
      return;
    }

    if (!MONGO_URI) {
      throw new Error(
        "MONGO_URI is not defined in your .env file or environment variables.",
      );
    }
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Atlas Connected`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // In Serverless (Vercel) environments, avoid process.exit() to prevent lambda container crashes
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
