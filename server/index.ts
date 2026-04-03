/**
 * CoachOS V0.3 — Backend Server
 * Express server with API routes for AI Chat, Counselor Recommendation,
 * Style Analysis, and the 归处 AI + Coach 协同机制.
 * V0.3: Added session cleanup, enhanced error handling, and version upgrade.
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
import recommendationsRouter from "./routes/recommendations.js";
import coachChatRouter from "./routes/coach-chat.js";

// Store (for cleanup)
import { getStoreStats, cleanupInactiveSessions } from "./store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // Request logging middleware
  app.use((req, _res, next) => {
    if (req.path.startsWith("/api/")) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    const stats = getStoreStats();
    res.json({
      status: "ok",
      version: "0.3.0",
      timestamp: new Date().toISOString(),
      features: [
        "guichu-ai",
        "specialist-coaches",
        "human-coaches",
        "recommendation-engine",
        "session-cleanup",
        "enhanced-error-handling",
      ],
      stats,
    });
  });

  // API Routes — Legacy
  app.use("/api/chat", chatRouter);
  app.use("/api/recommend", recommendRouter);
  app.use("/api/style-analyze", styleAnalyzeRouter);

  // API Routes — 归处 AI + Coach 协同机制
  app.use("/api/recommendations", recommendationsRouter);
  app.use("/api/coach-chat", coachChatRouter);

  // Return-to-main route (mounted under /api/coach)
  app.use("/api/coach", recommendationsRouter);

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

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(`[ERROR] ${err.message}`, err.stack);
    res.status(500).json({ error: "Internal server error" });
  });

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║  CoachOS V0.3 API Server                        ║`);
    console.log(`║  Running on http://localhost:${port}/               ║`);
    console.log(`╚══════════════════════════════════════════════════╝`);
    console.log(`\n  API endpoints:`);
    console.log(`    POST /api/chat                          - AI Coach conversation`);
    console.log(`    POST /api/chat/analyze-topic             - Topic analysis`);
    console.log(`    POST /api/recommend                      - Counselor recommendation (legacy)`);
    console.log(`    POST /api/style-analyze                  - Style analysis`);
    console.log(`    POST /api/recommendations/evaluate       - Recommendation evaluation`);
    console.log(`    GET  /api/recommendations/current        - Get current recommendation`);
    console.log(`    POST /api/recommendations/respond        - Respond to recommendation`);
    console.log(`    POST /api/coach/sessions/:id/return-to-main - Return to 归处 AI`);
    console.log(`    POST /api/coach-chat                     - Specialist Coach chat`);
    console.log(`    GET  /api/coach-chat/coaches              - List all coaches`);
    console.log(`    GET  /api/recommendations/audit           - Audit logs`);
    console.log(`    GET  /api/recommendations/stats           - Store stats`);
    console.log(`    GET  /api/health                          - Health check`);
    console.log(`\n  Session cleanup: every 30 minutes (inactive > 24h)\n`);
  });

  // Session cleanup: every 30 minutes, remove sessions inactive for > 24 hours
  const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
  const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
  setInterval(() => {
    const cleaned = cleanupInactiveSessions(SESSION_MAX_AGE);
    if (cleaned > 0) {
      console.log(`[Cleanup] Removed ${cleaned} inactive sessions (age > 24h)`);
    }
  }, CLEANUP_INTERVAL);
}

startServer().catch(console.error);
