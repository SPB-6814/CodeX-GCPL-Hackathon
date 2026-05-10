import { Router } from "express";
import { serviceClient } from "../../lib/supabase/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/contests - List active contests
router.get("/", async (req, res) => {
  try {
    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("contests")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch contests" });
  }
});

// GET /api/contests/:id/leaderboard - Realtime leaderboard
router.get("/:id/leaderboard", async (req, res) => {
  try {
    const supabase = serviceClient();
    
    // We fetch entries, order by value_logged, and join profile to get full_name
    const { data, error } = await supabase
      .from("contest_entries")
      .select(`
        value_logged,
        completed_at,
        profiles!inner(id, full_name, avatar_url)
      `)
      .eq("contest_id", req.params.id)
      .order("value_logged", { ascending: false, nullsFirst: false });

    if (error) throw error;

    const formatted = data.map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.profiles.id,
      fullName: entry.profiles.full_name,
      avatarUrl: entry.profiles.avatar_url,
      valueLogged: entry.value_logged,
      completedAt: entry.completed_at
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch leaderboard" });
  }
});

// Protected routes
router.use(authMiddleware);

// POST /api/contests/:id/join
router.post("/:id/join", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("contest_entries")
      .insert({ contest_id: req.params.id, user_id: userId })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return res.status(400).json({ success: false, error: "Already joined" });
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to join contest" });
  }
});

// POST /api/contests/:id/complete
router.post("/:id/complete", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const { valueLogged } = req.body;
    if (typeof valueLogged !== 'number') return res.status(400).json({ success: false, error: "valueLogged is required" });

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("contest_entries")
      .update({ value_logged: valueLogged, completed_at: new Date().toISOString() })
      .eq("contest_id", req.params.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to complete contest" });
  }
});

export default router;
