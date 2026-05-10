// ============================================================
// SportWell – Background Job: Sport Discovery
// /server/jobs/sportDiscovery.ts
//
// Runs every Monday at 00:01 local time.
// Tallies sport votes for the current week, identifies the winner,
// generates a comprehensive beginner's guide via Gemini,
// and saves the results in sport_nominations.
// ============================================================

import cron from "node-cron";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { serviceClient } from "../../lib/supabase/client";
import { buildDiscoveryPrompt } from "../../lib/gemini/prompts";
import type { DiscoveryPromptContext } from "../../lib/gemini/prompts";

// Initialise Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function runSportDiscoveryJob() {
  console.log("[Job: SportDiscovery] Starting execution...");
  const supabase = serviceClient();

  try {
    // 1. Determine week boundary for previous week's contest
    // Since this runs Monday at 00:01, we tally votes for the week that just ended
    const previousWeekDate = new Date();
    previousWeekDate.setDate(previousWeekDate.getDate() - 7);
    const day = previousWeekDate.getDay();
    const diff = previousWeekDate.getDate() - day + (day === 0 ? -6 : 1); // get Monday
    previousWeekDate.setDate(diff);
    previousWeekDate.setHours(0, 0, 0, 0);

    const weekStartStr = previousWeekDate.toISOString().split("T")[0];

    // 2. Fetch the top nomination for that week
    const { data: topNomination, error: fetchError } = await supabase
      .from("sport_nominations")
      .select("id, sport_name, vote_count")
      .eq("week_start_date", weekStartStr)
      .order("vote_count", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") { // Ignore 'no rows returned'
      throw fetchError;
    }

    if (!topNomination) {
      console.log(`[Job: SportDiscovery] No nominations found for week starting ${weekStartStr}.`);
      return;
    }

    console.log(`[Job: SportDiscovery] Winner for week ${weekStartStr} is ${topNomination.sport_name} with ${topNomination.vote_count} votes.`);

    // 3. Mark the winner
    await supabase
      .from("sport_nominations")
      .update({ is_winner: true })
      .eq("id", topNomination.id);

    // 4. Fetch the community's most common fitness level
    // A simplified approach: get overall distribution and pick the highest
    const { data: fitnessStats } = await supabase
        .from("sport_profiles")
        .select("fitness_level");
        
    let dominantLevel: "beginner" | "intermediate" | "advanced" | "elite" = "beginner";
    if (fitnessStats && fitnessStats.length > 0) {
        const counts = fitnessStats.reduce((acc, curr) => {
            acc[curr.fitness_level] = (acc[curr.fitness_level] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        dominantLevel = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as any;
    }

    // 5. Generate Guide via Gemini
    const promptCtx: DiscoveryPromptContext = {
      sportName: topNomination.sport_name,
      voteCount: topNomination.vote_count,
      communityFitnessLevel: dominantLevel,
      weekStartDate: weekStartStr
    };

    const promptText = buildDiscoveryPrompt(promptCtx);

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: promptText }] }]
    });
    
    const guideText = result.response.text();

    // 6. Save the guide to the database
    const { error: updateError } = await supabase
      .from("sport_nominations")
      .update({ guide_text: guideText })
      .eq("id", topNomination.id);

    if (updateError) throw updateError;
    
    console.log(`[Job: SportDiscovery] Successfully generated and stored guide for ${topNomination.sport_name}.`);

  } catch (error) {
    console.error("[Job: SportDiscovery] Fatal error:", error);
  }
}

// Ensure the cron runs every Monday at 00:01 local time
export const sportDiscoveryTask = cron.schedule("1 0 * * 1", () => {
  runSportDiscoveryJob();
}, {
  scheduled: false // Exporting it so we can start it explicitly in our main server file
});
