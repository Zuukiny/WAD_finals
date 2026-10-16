import { getDb } from "../db.js";

// POST /login
// Body: { username, password }
// 200 + user (without password) on success, 401 on bad credentials.
export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const db = getDb();
  const user = await db.collection("users").findOne({ username, password });

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // never send the password back to the client
  const { password: _password, _id, ...safeUser } = user;
  return res.status(200).json(safeUser);
}
