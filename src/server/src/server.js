import "dotenv/config";
import { createApp } from "./app.js";
import { connectToDatabase } from "./db.js";

const PORT = process.env.PORT || 3000;

async function start() {
  await connectToDatabase();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
