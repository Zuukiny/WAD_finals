// One-off script: run with `npm run seed`
// Inserts the two fixed users required by the assignment, if they don't exist yet.
// Safe to run multiple times (uses upsert).

import "dotenv/config";
import { connectToDatabase, closeDatabase } from "./db.js";

const users = [
  { username: "admin", password: "password", name: "Mina", role: "admin" },
  { username: "guest", password: "password", name: "Norman", role: "user" },
];

async function seed() {
  const db = await connectToDatabase();
  const usersCollection = db.collection("users");

  for (const user of users) {
    await usersCollection.updateOne(
      { username: user.username },
      { $set: user },
      { upsert: true }
    );
    console.log(`Upserted user "${user.username}"`);
  }

  await closeDatabase();
  console.log("Seeding done.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
