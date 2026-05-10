// ============================================================
// SportWell – Express Server Entry Point
// /server/index.ts
// ============================================================
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

import { authMiddleware } from "./middleware/auth";
import sessionsRouter from "./routes/sessions";
import feedRouter from "./routes/feed";
import digestRouter from "./routes/digest";
import contestsRouter from "./routes/contests";
import communityRouter from "./routes/community";
import recoveryRouter from "./routes/recovery";

// ─────────────────────────────────────────────
// Env
// ─────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? "4000", 10);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
const NODE_ENV = process.env.NODE_ENV ?? "development";

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
// Security & utility middleware
// ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(NODE_ENV === "production" ? "combined" : "dev")
);

// ─────────────────────────────────────────────
// Health check (no auth required)
// ─────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "sportwell-api",
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// API Routes
// Auth middleware applied per-router (not globally,
// so public routes like /contests and /recovery/tips
// don't require a JWT)
// ─────────────────────────────────────────────
app.use("/api/sessions",  authMiddleware, sessionsRouter);
app.use("/api/feed",      authMiddleware, feedRouter);
app.use("/api/digest",    authMiddleware, digestRouter);
app.use("/api/contests",  contestsRouter);   // mixed auth — applied per-route inside
app.use("/api/orgs",      communityRouter);  // mixed auth — applied per-route inside
app.use("/api/noticeboard", communityRouter);
app.use("/api/discovery", communityRouter);
app.use("/api/recovery",  recoveryRouter);   // mixed auth — applied per-route inside

// ─────────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[SportWell API Error]", err.message, err.stack);
    res.status(500).json({
      success: false,
      error:
        NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  }
);

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(
    `[SportWell API] Running on port ${PORT} | CORS origin: ${FRONTEND_ORIGIN}`
  );
});

export default app;
