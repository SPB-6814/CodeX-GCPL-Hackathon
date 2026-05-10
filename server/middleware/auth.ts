// ============================================================
// SportWell – Supabase JWT Auth Middleware
// /server/middleware/auth.ts
//
// Verifies the Bearer token from the Authorization header
// using Supabase's getUser() — which cryptographically validates
// the JWT against your Supabase project secret.
//
// On success: attaches req.user = { id, email, role }
// On failure: returns 401 with a structured error body
// ============================================================
import type { Request, Response, NextFunction } from "express";
import { serviceClient } from "../../lib/supabase/client";
import type { AuthenticatedUser } from "../../types/index";

// ─────────────────────────────────────────────
// Auth Middleware — required on protected routes
// ─────────────────────────────────────────────
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Missing or malformed Authorization header. Expected: Bearer <token>",
      code: "MISSING_TOKEN",
    });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  // HACKATHON BYPASS: Allow 'test-token' for local development
  if (token === "test-token") {
    req.user = {
      id: "ed8130df-31e7-4639-8ef0-48e8578cf24a",
      email: "test@sportwell.app",
      role: "authenticated",
    };
    return next();
  }

  try {
    const supabase = serviceClient();

    // getUser() validates the JWT signature server-side.
    // It does NOT rely on the local session cache.
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        success: false,
        error: error?.message ?? "Invalid or expired token",
        code: "INVALID_TOKEN",
      });
      return;
    }

    const user = data.user;

    // Attach verified user identity to request
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email ?? "",
      role: user.role ?? "authenticated",
    };

    req.user = authenticatedUser;
    next();
  } catch (err) {
    console.error("[authMiddleware] Unexpected error:", err);
    res.status(500).json({
      success: false,
      error: "Authentication service unavailable",
      code: "AUTH_SERVICE_ERROR",
    });
  }
}

// ─────────────────────────────────────────────
// Org Auth Middleware — for org-owner-only routes
//
// Must be applied AFTER authMiddleware.
// Verifies the authenticated user owns the org
// specified by req.params.id or req.body.orgId.
// Attaches req.orgId for downstream use.
// ─────────────────────────────────────────────
export async function orgAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Not authenticated",
      code: "NOT_AUTHENTICATED",
    });
    return;
  }

  // orgId comes from route param (/api/orgs/:id) or body
  const orgId = req.params.id ?? req.body?.orgId;

  if (!orgId) {
    res.status(400).json({
      success: false,
      error: "Org ID is required",
      code: "MISSING_ORG_ID",
    });
    return;
  }

  try {
    const supabase = serviceClient();

    const { data: org, error } = await supabase
      .from("orgs")
      .select("id, owner_user_id")
      .eq("id", orgId)
      .single();

    if (error || !org) {
      res.status(404).json({
        success: false,
        error: "Organisation not found",
        code: "ORG_NOT_FOUND",
      });
      return;
    }

    if (org.owner_user_id !== req.user.id) {
      res.status(403).json({
        success: false,
        error: "You do not have permission to manage this organisation",
        code: "FORBIDDEN",
      });
      return;
    }

    req.orgId = orgId;
    next();
  } catch (err) {
    console.error("[orgAuthMiddleware] Unexpected error:", err);
    res.status(500).json({
      success: false,
      error: "Could not verify organisation ownership",
      code: "ORG_AUTH_ERROR",
    });
  }
}

// ─────────────────────────────────────────────
// Optional Auth Middleware — for public routes
// that are enriched when a user IS logged in
// (e.g. tip upvote status, contest membership)
//
// Never returns 401 — silently skips if no token.
// ─────────────────────────────────────────────
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // no token — continue as anonymous
  }

  const token = authHeader.slice(7);

  try {
    const supabase = serviceClient();
    const { data } = await supabase.auth.getUser(token);

    if (data.user) {
      req.user = {
        id: data.user.id,
        email: data.user.email ?? "",
        role: data.user.role ?? "authenticated",
      };
    }
  } catch {
    // Silently ignore — optional auth never blocks the request
  }

  next();
}
