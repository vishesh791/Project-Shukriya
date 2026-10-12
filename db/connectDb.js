import mongoose from "mongoose";

/**
 * Cached Mongoose connection.
 *
 * In serverless / Next.js dev, modules are re-evaluated often. Without a cache
 * every server action would open a brand-new connection and we'd quickly hit
 * MongoDB Atlas connection limits. We keep the promise on `globalThis` so hot
 * reloads and concurrent requests reuse the same connection.
 */
const MONGODB_URI = process.env.MONGODB_URI;

let cached = globalThis._mongooseCache;
if (!cached) {
  cached = globalThis._mongooseCache = { conn: null, promise: null };
}

export default async function connectDb() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset so the next call can retry instead of reusing a rejected promise.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
