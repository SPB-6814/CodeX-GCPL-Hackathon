// ============================================================
// SportWell – Background Job: Weekly Digest
// /server/jobs/weeklyDigest.ts
//
// Runs every Sunday at 08:00 local time.
// Finds users with >= 3 sessions in the past 7 days,
// calculates averages, generates a narrative via Gemini,
// and saves to the weekly_digests table.
// ============================================================

import cron from "node-cron";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { serviceClient } from "../../lib/supabase/client";
import { buildDigestPrompt } from "../../lib/gemini/prompts";
import type { DigestPromptContext } from "../../lib/gemini/prompts";

// Initialise Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function runWeeklyDigestJob() {
  console.log("[Job: WeeklyDigest] Starting execution...");
  const supabase = serviceClient();

  try {
    // 1. Determine date boundaries
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    // We want the start of the week (Monday)
    const weekStartDate = new Date();
    const day = weekStartDate.getDay();
    const diff = weekStartDate.getDate() - day + (day === 0 ? -6 : 1);
    weekStartDate.setDate(diff);
    weekStartDate.setHours(0, 0, 0, 0);

    const weekStartStr = weekStartDate.toISOString().split("T")[0];

    // 2. Find eligible users (>= 3 sessions in last 7 days)
    // We'll query all sessions in the last 7 days, group by user
    const { data: recentSessions, error: sessionError } = await supabase
      .from("sessions")
      .select("user_id, body_score, mind_score, movement_score, composite_score")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (sessionError) throw sessionError;

    // Group by user
    const userSessionsMap = new Map<string, typeof recentSessions>();
    for (const session of recentSessions) {
      if (!userSessionsMap.has(session.user_id)) {
        userSessionsMap.set(session.user_id, []);
      }
      userSessionsMap.get(session.user_id)!.push(session);
    }

    // Filter to those with >= 3 sessions
    const eligibleUserIds = Array.from(userSessionsMap.entries())
      .filter(([_, sessions]) => sessions.length >= 3)
      .map(([userId]) => userId);

    console.log(`[Job: WeeklyDigest] Found ${eligibleUserIds.length} eligible users.`);

    for (const userId of eligibleUserIds) {
      try {
        // Skip if already processed for this week
        const { data: existingDigest } = await supabase
          .from("weekly_digests")
          .select("id")
          .eq("user_id", userId)
          .eq("week_start_date", weekStartStr)
          .single();

        if (existingDigest) {
          console.log(`[Job: WeeklyDigest] Skipped user ${userId} (already exists)`);
          continue;
        }

        const userSessions = userSessionsMap.get(userId)!;
        
        // Fetch User Profile & Sport Profile & Streak
        const [profileRes, sportProfileRes, streakRes] = await Promise.all([
          supabase.from("profiles").select("full_name").eq("id", userId).single(),
          supabase.from("sport_profiles").select("primary_sport").eq("user_id", userId).single(),
          supabase.from("streaks").select("current_streak").eq("user_id", userId).single()
        ]);

        const userName = profileRes.data?.full_name || "Athlete";
        const primarySport = sportProfileRes.data?.primary_sport || "general fitness";
        const currentStreak = streakRes.data?.current_streak || 0;

        // Calculate this week's averages
        const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;
        const thisWeekBody = avg(userSessions.map(s => Number(s.body_score)));
        const thisWeekMind = avg(userSessions.map(s => Number(s.mind_score)));
        const thisWeekMovement = avg(userSessions.map(s => Number(s.movement_score)));
        const thisWeekAvg = avg(userSessions.map(s => Number(s.composite_score)));

        const thisWeekBand = thisWeekAvg >= 70 ? "green" : thisWeekAvg >= 40 ? "amber" : "red";

        // Fetch historical data (mocking previous 4 week averages for now, 
        // in a real scenario we'd query past weekly_digests)
        const { data: pastDigests } = await supabase
          .from("weekly_digests")
          .select("avg_well_score")
          .eq("user_id", userId)
          .order("week_start_date", { ascending: false })
          .limit(4);
          
        const prev4WeekAvgs = pastDigests ? pastDigests.map(d => Number(d.avg_well_score)).reverse() : [];

        // Build context for Gemini
        const promptCtx: DigestPromptContext = {
          userName,
          thisWeekAvg,
          thisWeekBody,
          thisWeekMind,
          thisWeekMovement,
          prev4WeekAvgs,
          thisWeekBand,
          sessionsThisWeek: userSessions.length,
          primarySport,
          currentStreak,
        };

        const promptText = buildDigestPrompt(promptCtx);

        // Generate narrative using Gemini
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
        
        const responseText = result.response.text();
        const generatedData = JSON.parse(responseText);

        // Save to Database
        const { error: insertError } = await supabase.from("weekly_digests").insert({
          user_id: userId,
          week_start_date: weekStartStr,
          avg_well_score: thisWeekAvg,
          body_avg: thisWeekBody,
          mind_avg: thisWeekMind,
          movement_avg: thisWeekMovement,
          trend: generatedData.trend || "stable",
          gemini_narrative: generatedData.narrative,
          highlight_metric: generatedData.highlightMetric
        });

        if (insertError) throw insertError;
        console.log(`[Job: WeeklyDigest] Successfully generated digest for user ${userId}`);

      } catch (err) {
        console.error(`[Job: WeeklyDigest] Failed processing user ${userId}:`, err);
      }
    }
    
    console.log("[Job: WeeklyDigest] Execution completed.");
  } catch (error) {
    console.error("[Job: WeeklyDigest] Fatal error:", error);
  }
}

// Ensure the cron runs every Sunday at 08:00 local time
export const weeklyDigestTask = cron.schedule("0 8 * * 0", () => {
  runWeeklyDigestJob();
}, {
  scheduled: false // Exporting it so we can start it explicitly in our main server file
});
