import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import authRoutes from "./routes/auth.routes.js";
import locationRoutes from "./routes/locations.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
  app.use(express.json());

  // Serve uploaded images at http://localhost:PORT/uploads/<filename>
  app.use("/uploads", express.static(path.resolve("uploads")));

  // API routes
  app.use(authRoutes);
  app.use(locationRoutes);

  const clientDist = path.resolve("../client/dist");
  app.use(express.static(clientDist));

  // SPA fallback: any GET request not already handled above (by authRoutes,
  // locationRoutes, or the /uploads static middleware) is a client-side
  // route - hand it index.html so Vue Router can take over.
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) res.status(404).send("Frontend build not found yet - run `npm run build` in /client");
    });
  });

  // Basic error handler (e.g. multer file-type/size errors, unexpected exceptions)
  app.use((err, req, res, next) => {
    // Wrong file type (our custom fileFilter) or size limit exceeded (multer's own check)
    // are client mistakes, not server failures - respond 400, not 500.
    if (err instanceof multer.MulterError || /^Only image files/.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  });

  return app;
}
