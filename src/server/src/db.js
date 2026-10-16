import { MongoClient } from "mongodb";

let client;
let db;

/**
 * Connects once and caches the connection.
 * Call this at startup (see server.js) - every route then just calls getDb().
 */
export async function connectToDatabase() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri || !dbName) {
    throw new Error(
      "Missing MONGODB_URI or DB_NAME in .env - copy .env.example to .env and fill it in."
    );
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  console.log(`Connected to MongoDB database "${dbName}"`);
  return db;
}

/**
 * Use this in controllers once the app has started.
 * Throws if called before connectToDatabase() has resolved.
 */
export function getDb() {
  if (!db) {
    throw new Error("Database not initialized yet - connectToDatabase() must run first.");
  }
  return db;
}

export async function closeDatabase() {
  if (client) await client.close();
}
