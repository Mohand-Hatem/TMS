// File: src/config/db.js
// What this does: Establishes a connection to the MongoDB Atlas database via Mongoose utilizing MONGO_URI from Env.js.
// Used by: server.js during live deployment and by src/seed.js during database seeding operations.

import mongoose from "mongoose";
import { MONGO_URI } from "./Env.js";

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error(
        "MONGO_URI is not defined in your .env file or environment variables.",
      );
    }
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Atlas Connected`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
