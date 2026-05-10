import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { serviceClient } from "../../lib/supabase/client";
import { buildFeedPrompt, FeedPromptContext } from "../../lib/gemini/prompts";

const router = Router();

// Initialize Gemini (only if key exists, gracefully fail otherwise)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// POST /api/feed/generate
router.post("/generate", async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ success: false, error: "AI service not configured" });
  }

  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const supabase = serviceClient();

    // 1. Fetch user context
    const [sportRes, streakRes, sessionRes] = await Promise.all([
      supabase.from("sport_profiles").select("*").eq("user_id", userId).single(),
      supabase.from("streaks").select("*").eq("user_id", userId).single(),
      supabase.from("sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(7)
    ]);

    // Use default values if profile isn't fully setup yet
    const sportProfile = sportRes.data || {
      primarySport: "fitness",
      fitnessLevel: "beginner",
      weeklyGoalMinutes: 150,
      injuries: []
    };
    
    const currentStreak = streakRes.data?.current_streak || 0;
    
    // Map sessions to WellScoreBreakdown
    const recentScores = (sessionRes.data || []).reverse().map((s: any) => ({
      bodyScore: Number(s.body_score),
      mindScore: Number(s.mind_score),
      movementScore: Number(s.movement_score),
      composite: Number(s.composite_score),
      band: s.score_band
    }));

    // 2. Build the exact prompt
    const promptCtx: FeedPromptContext = {
      recentScores,
      currentStreak,
      sportProfile,
      cardCount: 5
    };
    
    const prompt = buildFeedPrompt(promptCtx);

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    const responseText = result.response.text();
    const cards = JSON.parse(responseText);

    res.status(200).json({ success: true, data: cards });

  } catch (error: any) {
    console.error("[POST /api/feed/generate]", error);
    res.status(500).json({ success: false, error: "Failed to generate feed" });
  }
});

// GET /api/feed/saved
router.get("/saved", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("saved_cards")
      .select("*")
      .eq("user_id", userId)
      .order("saved_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch saved cards" });
  }
});

// POST /api/feed/save
router.post("/save", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const { card } = req.body;
    if (!card || !card.id) return res.status(400).json({ success: false, error: "Invalid card data" });

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("saved_cards")
      .insert({ user_id: userId, card_data: card })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({ success: false, error: "Card already saved" });
      }
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to save card" });
  }
});

export default router;
