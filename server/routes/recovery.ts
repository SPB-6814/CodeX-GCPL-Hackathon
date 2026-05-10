import { Router } from "express";
import { serviceClient } from "../../lib/supabase/client";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/recovery/tips
router.get("/tips", optionalAuthMiddleware, async (req, res) => {
  try {
    const supabase = serviceClient();
    
    // Fetch top tips
    const { data: tips, error } = await supabase
      .from("recovery_tips")
      .select(`
        *,
        profiles!inner(full_name)
      `)
      .order("upvote_count", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Check upvote status if user is logged in
    let upvotedIds = new Set<string>();
    if (req.user) {
      const { data: upvotes } = await supabase
        .from("tip_upvotes")
        .select("tip_id")
        .eq("user_id", req.user.id)
        .in("tip_id", tips.map(t => t.id));
        
      if (upvotes) {
        upvotedIds = new Set(upvotes.map(u => u.tip_id));
      }
    }

    const formatted = tips.map((tip: any) => ({
      id: tip.id,
      userId: tip.user_id,
      authorName: tip.profiles.full_name,
      content: tip.content,
      tags: tip.tags,
      upvoteCount: tip.upvote_count,
      userHasUpvoted: upvotedIds.has(tip.id),
      createdAt: tip.created_at
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch tips" });
  }
});

// POST /api/recovery/tips
router.post("/tips", authMiddleware, async (req, res) => {
  try {
    const { content, tags } = req.body;
    if (!content) return res.status(400).json({ success: false, error: "content required" });

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("recovery_tips")
      .insert({
        user_id: req.user!.id,
        content,
        tags: tags || []
      })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to submit tip" });
  }
});

// POST /api/recovery/tips/:id/upvote
router.post("/tips/:id/upvote", authMiddleware, async (req, res) => {
  try {
    const tipId = req.params.id;
    const userId = req.user!.id;
    const supabase = serviceClient();

    // Toggle logic: try to insert, if conflict, delete
    const { data: newUpvote, error: insertError } = await supabase
      .from("tip_upvotes")
      .insert({ tip_id: tipId, user_id: userId })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") { // Already upvoted
        await supabase
          .from("tip_upvotes")
          .delete()
          .eq("tip_id", tipId)
          .eq("user_id", userId);
          
        return res.status(200).json({ success: true, data: { action: "removed" } });
      }
      throw insertError;
    }

    res.status(200).json({ success: true, data: { action: "added" } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to toggle upvote" });
  }
});

export default router;
