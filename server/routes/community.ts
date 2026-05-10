import { Router } from "express";
import { serviceClient } from "../../lib/supabase/client";
import { authMiddleware, orgAuthMiddleware } from "../middleware/auth";

const router = Router();

// ==========================================
// ORGS
// ==========================================

// GET /api/orgs - List orgs
router.get("/", async (req, res) => {
  try {
    const supabase = serviceClient();
    const { data, error } = await supabase.from("orgs").select("*");
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch orgs" });
  }
});

// POST /api/orgs/:id/follow
router.post("/:id/follow", authMiddleware, async (req, res) => {
  try {
    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("org_follows")
      .insert({ user_id: req.user!.id, org_id: req.params.id })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return res.status(400).json({ success: false, error: "Already followed" });
      throw error;
    }
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to follow org" });
  }
});

// ==========================================
// NOTICEBOARD
// ==========================================

// GET /api/noticeboard
router.get("/noticeboard", authMiddleware, async (req, res) => {
  try {
    const supabase = serviceClient();
    
    // Auth policy handles only showing posts from followed orgs
    // Since we use serviceClient here which bypasses RLS, we must manually filter
    // 1. Get followed org IDs
    const { data: follows } = await supabase
      .from("org_follows")
      .select("org_id")
      .eq("user_id", req.user!.id);
      
    if (!follows || follows.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const orgIds = follows.map(f => f.org_id);

    const { data, error } = await supabase
      .from("noticeboard_posts")
      .select(`
        *,
        orgs!inner(name, logo_url)
      `)
      .in("org_id", orgIds)
      .order("published_at", { ascending: false });

    if (error) throw error;

    const formatted = data.map((post: any) => ({
      id: post.id,
      orgId: post.org_id,
      orgName: post.orgs.name,
      orgLogoUrl: post.orgs.logo_url,
      title: post.title,
      body: post.body,
      imageUrl: post.image_url,
      publishedAt: post.published_at,
      expiresAt: post.expires_at
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch noticeboard" });
  }
});

// POST /api/noticeboard
router.post("/noticeboard", authMiddleware, orgAuthMiddleware, async (req, res) => {
  try {
    const { title, body, imageUrl, expiresAt } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, error: "Title and body required" });

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("noticeboard_posts")
      .insert({
        org_id: req.orgId,
        title,
        body,
        image_url: imageUrl,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to create post" });
  }
});

// ==========================================
// SPORT DISCOVERY
// ==========================================

// GET /api/discovery/nominations
router.get("/nominations", async (req, res) => {
  try {
    // Get current week's start date (Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("sport_nominations")
      .select("*")
      .eq("week_start_date", weekStartStr)
      .order("vote_count", { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch nominations" });
  }
});

// POST /api/discovery/vote
router.post("/vote", authMiddleware, async (req, res) => {
  try {
    const { nominationId } = req.body;
    if (!nominationId) return res.status(400).json({ success: false, error: "nominationId required" });

    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("sport_votes")
      .insert({
        nomination_id: nominationId,
        user_id: req.user!.id,
        week_start_date: weekStartStr
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return res.status(400).json({ success: false, error: "Already voted this week" });
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to submit vote" });
  }
});

export default router;
