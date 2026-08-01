// File: src/config/db.js
// What this does: Establishes a connection to the MongoDB Atlas database via Mongoose utilizing MONGO_URI from Env.js.
// Used by: server.js during live deployment and by src/seed.js during database seeding operations.

import mongoose from "mongoose";
import { MONGO_URI } from "./Env.js";

const connectDB = async () => {
  try {
    // If Mongoose is already connected (1) or connecting (2), reuse existing connection in serverless functions
    if (mongoose.connection.readyState >= 1) {
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
    // In Vercel serverless mode, throw instead of process.exit so lambda doesn't terminate abruptly without returning an HTTP response
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
