import { Router } from "express";
import { serviceClient } from "../../lib/supabase/client";

const router = Router();

// GET /api/digest/:userId - Fetch latest weekly digest
router.get("/:userId", async (req, res) => {
  try {
    // Only allow fetching own digest unless service_role
    if (req.user?.id !== req.params.userId && req.user?.role !== "service_role") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const supabase = serviceClient();
    
    const { data, error } = await supabase
      .from("weekly_digests")
      .select("*")
      .eq("user_id", req.params.userId)
      .order("week_start_date", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") { // No rows returned
         return res.status(404).json({ success: false, error: "No digest found for user" });
      }
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("[GET /api/digest]", error);
    res.status(500).json({ success: false, error: "Failed to fetch digest" });
  }
});

export default router;
