/**
 * CoachOS V0.2 — Backend Server
 * Express server with API routes for AI Chat, Counselor Recommendation,
 * and Style Analysis. Serves static files in production.
 */
import express from "express";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

// API Routes
import chatRouter from "./routes/chat.js";
import recommendRouter from "./routes/recommend.js";
import styleAnalyzeRouter from "./routes/style-analyze.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      version: "0.2.0",
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use("/api/chat", chatRouter);
  app.use("/api/recommend", recommendRouter);
  app.use("/api/style-analyze", styleAnalyzeRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`CoachOS API Server running on http://localhost:${port}/`);
    console.log(`  API endpoints:`);
    console.log(`    POST /api/chat          - AI Coach conversation`);
    console.log(`    POST /api/chat/analyze-topic - Topic analysis`);
    console.log(`    POST /api/recommend     - Counselor recommendation`);
    console.log(`    POST /api/style-analyze - Style analysis`);
    console.log(`    GET  /api/health        - Health check`);
  });
}

startServer().catch(console.error);
