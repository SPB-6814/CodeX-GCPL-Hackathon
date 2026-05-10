import { Router } from "express";
import { serviceClient } from "../../lib/supabase/client";
import { computeWellScore } from "../../lib/scoring/wellscore";
import type { SessionSubmitRequest, BadgeType } from "../../types/index";

const router = Router();

// POST /api/sessions - Submit assessment session
router.post("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { answers } = req.body as SessionSubmitRequest;
    if (!answers || !answers.body || !answers.mind || !answers.movement) {
      return res.status(400).json({ success: false, error: "Invalid session answers" });
    }

    const supabase = serviceClient();

    // Clean up movement answers so calculation algorithms don't crash on strings
    const movementClean = {
      ...answers.movement,
      activityType: answers.movement.activityType === 'Weights' ? 'weightlifting' : (answers.movement.activityType.toLowerCase() as any),
      intensityLevel: answers.movement.intensityLevel === 'High' ? 8 : answers.movement.intensityLevel === 'Moderate' ? 5 : 3,
    };

    // 1. Calculate WellScore Breakdown
    const scores = computeWellScore(answers.body, answers.mind, movementClean);

    // 2. Save Session
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        body_score: scores.bodyScore,
        mind_score: scores.mindScore,
        movement_score: scores.movementScore,
        composite_score: scores.composite,
        score_band: scores.band,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // 3. Save Detailed Answers
    await supabase.from("session_answers").insert({
      session_id: sessionData.id,
      user_id: userId,
      energy: answers.body.energy,
      sleep: answers.body.sleep,
      soreness: answers.body.soreness,
      hydration: answers.body.hydration,
      resting_hr: answers.body.restingHR,
      stress: answers.mind.stress,
      motivation: answers.mind.motivation,
      focus: answers.mind.focus,
      mood: answers.mind.mood,
      activity_type: movementClean.activityType,
      duration_minutes: movementClean.durationMinutes,
      intensity_level: movementClean.intensityLevel,
      consistency_days: movementClean.consistencyDays,
      enjoyment_level: movementClean.enjoymentLevel,
    });

    // 4. Update Streak Logic
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Get current streak info
    let { data: streakData } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    let newCurrentStreak = 1;
    let newLongestStreak = 1;
    let isNewDay = true;

    if (!streakData) {
      // First ever checkin
      const { data: newStreak } = await supabase
        .from("streaks")
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_checkin_date: todayStr
        })
        .select()
        .single();
      streakData = newStreak;
    } else {
      const lastCheckinDateStr = streakData.last_checkin_date;
      
      if (lastCheckinDateStr === todayStr) {
        // Idempotent: already checked in today
        newCurrentStreak = streakData.current_streak;
        newLongestStreak = streakData.longest_streak;
        isNewDay = false;
      } else {
        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastCheckinDateStr === yesterdayStr) {
          // Continued streak
          newCurrentStreak = streakData.current_streak + 1;
        } else {
          // Streak broken
          newCurrentStreak = 1;
        }

        newLongestStreak = Math.max(streakData.longest_streak, newCurrentStreak);

        // Update streak record
        const { data: updatedStreak } = await supabase
          .from("streaks")
          .update({
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_checkin_date: todayStr
          })
          .eq("user_id", userId)
          .select()
          .single();
        streakData = updatedStreak;
      }
    }

    // 5. Award Badges (Milestones: 7, 30, 100)
    const earnedBadges: BadgeType[] = [];
    if (isNewDay) {
      const milestones = [
        { limit: 7, type: "STREAK_7" as BadgeType },
        { limit: 30, type: "STREAK_30" as BadgeType },
        { limit: 100, type: "STREAK_100" as BadgeType }
      ];

      for (const m of milestones) {
        if (newCurrentStreak === m.limit) {
          // Grant badge
          const { error: badgeErr } = await supabase.from("badges").insert({
            user_id: userId,
            badge_type: m.type
          });
          // Ignore unique constraint errors in case of retries
          if (!badgeErr || badgeErr.code === "23505") {
             if (!badgeErr) earnedBadges.push(m.type);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        session: {
          id: sessionData.id,
          userId,
          answers,
          scores,
          createdAt: sessionData.created_at
        },
        streak: streakData,
        badgesEarned: earnedBadges
      }
    });

  } catch (error: any) {
    console.error("[POST /api/sessions]", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit session", 
      details: {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      }
    });
  }
});

// GET /api/sessions - Fetch recent sessions and streak
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const supabase = serviceClient();

    const [sessionsRes, streakRes] = await Promise.all([
      supabase
        .from("sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(7),
      supabase
        .from("streaks")
        .select("*")
        .eq("user_id", userId)
        .single()
    ]);

    res.status(200).json({
      success: true,
      data: {
        recentSessions: sessionsRes.data || [],
        streak: streakRes.data || null
      }
    });
  } catch (error: any) {
    console.error("[GET /api/sessions]", error);
    res.status(500).json({ success: false, error: "Failed to fetch sessions" });
  }
});

export default router;
