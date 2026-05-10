// ============================================================
// SportWell – Gemini Prompt Templates
// /lib/gemini/prompts.ts
//
// ALL prompt construction lives here — never inline in routes.
// Templates use typed inputs to guarantee context completeness.
// ============================================================

import type {
  WellScoreBreakdown,
  SportProfile,
  FitnessLevel,
} from "../../types/index";

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

function formatBand(band: string): string {
  return band.charAt(0).toUpperCase() + band.slice(1);
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function trend7Day(scores: number[]): string {
  if (scores.length < 2) return "stable";
  const first = scores[0];
  const last = scores[scores.length - 1];
  const delta = last - first;
  if (delta > 5) return "improving";
  if (delta < -5) return "declining";
  return "stable";
}

function sparkline(scores: number[]): string {
  return scores.map((s) => s.toFixed(1)).join(", ");
}

// ─────────────────────────────────────────────
// PROMPT A — Feed Card Generation
//
// Used in: POST /api/feed/generate
// Output format: newline-delimited JSON objects, one per card.
// Each card must match the FeedCard interface exactly.
// ─────────────────────────────────────────────

export interface FeedPromptContext {
  recentScores: WellScoreBreakdown[];   // up to 7 entries (newest last)
  currentStreak: number;
  sportProfile: SportProfile;
  cardCount?: number;                   // default 5
}

export function buildFeedPrompt(ctx: FeedPromptContext): string {
  const { recentScores, currentStreak, sportProfile } = ctx;
  const count = ctx.cardCount ?? 5;

  const compositeScores = recentScores.map((s) => s.composite);
  const bodyScores      = recentScores.map((s) => s.bodyScore);
  const mindScores      = recentScores.map((s) => s.mindScore);
  const movementScores  = recentScores.map((s) => s.movementScore);

  const latestScore     = recentScores[recentScores.length - 1];
  const weeklyTrend     = trend7Day(compositeScores);
  const weakestPillar   = (() => {
    if (!latestScore) return "body";
    const { bodyScore, mindScore, movementScore } = latestScore;
    if (bodyScore <= mindScore && bodyScore <= movementScore) return "body";
    if (mindScore <= bodyScore && mindScore <= movementScore) return "mind";
    return "movement";
  })();

  return `You are SportWell's AI wellness coach. Generate exactly ${count} personalised wellness feed cards for a user.

## User Context
- **Primary Sport:** ${sportProfile.primarySport}
- **Fitness Level:** ${sportProfile.fitnessLevel}
- **Weekly Goal:** ${sportProfile.weeklyGoalMinutes} minutes
- **Current Streak:** ${currentStreak} day${currentStreak !== 1 ? "s" : ""}
- **Reported Injuries/Limitations:** ${sportProfile.injuries.length > 0 ? sportProfile.injuries.join(", ") : "None"}

## WellScore™ – Last 7 Days
- **Composite Trend:** ${weeklyTrend} (sparkline: [${sparkline(compositeScores)}])
- **Latest Composite Score:** ${latestScore?.composite ?? "N/A"} (${latestScore ? formatBand(latestScore.band) : "N/A"} band)
- **Body avg:** ${avg(bodyScores)} | **Mind avg:** ${avg(mindScores)} | **Movement avg:** ${avg(movementScores)}
- **Weakest pillar this week:** ${weakestPillar}

## Instructions
1. Generate exactly ${count} cards as a JSON array.
2. Prioritise content that addresses the weakest pillar (${weakestPillar}).
3. Cards must be sport-specific (${sportProfile.primarySport}) and fitness-level appropriate (${sportProfile.fitnessLevel}).
4. If streak ≥ 7, include at least one motivational card acknowledging the streak.
5. If any score is in the "red" band (< 40), include at least one recovery tip card.
6. Vary card types: use a mix of "tip", "challenge", "insight", "motivation", "recovery".

## Output Format
Return ONLY a valid JSON array, no markdown, no prose. Each object must have:
{
  "id": "<uuid-v4>",
  "cardType": "<tip|challenge|insight|motivation|recovery>",
  "title": "<max 60 chars>",
  "body": "<2-3 sentences, max 200 chars>",
  "cta": "<optional call-to-action text, null if none>",
  "tags": ["<tag1>", "<tag2>"],
  "emoji": "<single emoji>"
}`;
}

// ─────────────────────────────────────────────
// PROMPT B — Weekly Digest
//
// Used in: weeklyDigest.ts cron job
// Output: a single JSON object matching WeeklyDigest narrative fields.
// ─────────────────────────────────────────────

export interface DigestPromptContext {
  userName: string;
  thisWeekAvg: number;
  thisWeekBody: number;
  thisWeekMind: number;
  thisWeekMovement: number;
  prev4WeekAvgs: number[];          // oldest first, max 4 values
  thisWeekBand: string;
  sessionsThisWeek: number;
  primarySport: string;
  currentStreak: number;
}

export function buildDigestPrompt(ctx: DigestPromptContext): string {
  const {
    userName,
    thisWeekAvg,
    thisWeekBody,
    thisWeekMind,
    thisWeekMovement,
    prev4WeekAvgs,
    thisWeekBand,
    sessionsThisWeek,
    primarySport,
    currentStreak,
  } = ctx;

  const prev4Avg = prev4WeekAvgs.length > 0 ? avg(prev4WeekAvgs) : null;
  const weeklyDelta = prev4Avg !== null ? thisWeekAvg - prev4Avg : null;
  const trendWord =
    weeklyDelta === null
      ? "your first tracked week"
      : weeklyDelta > 3
      ? "an improving week"
      : weeklyDelta < -3
      ? "a declining week"
      : "a stable week";

  const pillars = [
    { name: "Body",     score: thisWeekBody },
    { name: "Mind",     score: thisWeekMind },
    { name: "Movement", score: thisWeekMovement },
  ];
  const strongest = pillars.reduce((a, b) => (a.score >= b.score ? a : b));
  const weakest   = pillars.reduce((a, b) => (a.score <= b.score ? a : b));

  return `You are SportWell's AI wellness analyst. Write a warm, encouraging, data-driven weekly digest for a user.

## User Summary
- **Name:** ${userName}
- **Primary Sport:** ${primarySport}
- **Sessions Completed This Week:** ${sessionsThisWeek}
- **Current Streak:** ${currentStreak} days

## This Week's WellScore™ Breakdown
- **Composite Average:** ${thisWeekAvg.toFixed(1)} (${formatBand(thisWeekBand)} band)
- **Body:** ${thisWeekBody.toFixed(1)} | **Mind:** ${thisWeekMind.toFixed(1)} | **Movement:** ${thisWeekMovement.toFixed(1)}
- **Strongest Pillar:** ${strongest.name} (${strongest.score.toFixed(1)})
- **Weakest Pillar:** ${weakest.name} (${weakest.score.toFixed(1)})

## Historical Context (past 4 weeks)
- **Previous 4-week averages:** ${prev4WeekAvgs.length > 0 ? prev4WeekAvgs.map((s) => s.toFixed(1)).join(", ") : "No prior data"}
- **4-week average:** ${prev4Avg !== null ? prev4Avg.toFixed(1) : "N/A"}
- **This week vs 4-week avg:** ${weeklyDelta !== null ? (weeklyDelta > 0 ? "+" : "") + weeklyDelta.toFixed(1) : "First week"} — ${trendWord}

## Instructions
Write a 3-paragraph narrative (150-250 words total):
1. **Paragraph 1:** Celebrate their week — acknowledge sessions, score, and streak. Be specific with numbers.
2. **Paragraph 2:** Analyse the strongest and weakest pillars. Give one concrete, sport-specific tip to improve ${weakest.name}.
3. **Paragraph 3:** Motivational close — set an intention for the coming week tied to their goals.

## Output Format
Return ONLY a valid JSON object, no markdown:
{
  "narrative": "<full 3-paragraph text>",
  "highlightMetric": "<one standout insight, max 80 chars>",
  "trend": "<improving|stable|declining>"
}`;
}

// ─────────────────────────────────────────────
// PROMPT C — Sport Discovery Guide
//
// Used in: sportDiscovery.ts cron job (Monday 00:01)
// Output: a beginner guide stored in sport_nominations.guide_text
// ─────────────────────────────────────────────

export interface DiscoveryPromptContext {
  sportName: string;
  voteCount: number;
  communityFitnessLevel: FitnessLevel;  // most common level among voters
  weekStartDate: string;                 // YYYY-MM-DD
}

export function buildDiscoveryPrompt(ctx: DiscoveryPromptContext): string {
  const { sportName, voteCount, communityFitnessLevel, weekStartDate } = ctx;

  const levelDesc: Record<FitnessLevel, string> = {
    beginner:     "just starting their fitness journey with little to no experience",
    intermediate: "regularly active with 6-12 months of consistent exercise",
    advanced:     "highly trained athletes with 1+ years of structured training",
    elite:        "competitive athletes seeking performance-level guidance",
  };

  return `You are SportWell's sport discovery expert. The community has voted and this week's featured sport is **${sportName}** with ${voteCount} votes (week of ${weekStartDate}).

## Target Audience
Community fitness level: **${communityFitnessLevel}** — ${levelDesc[communityFitnessLevel]}.

## Instructions
Write a comprehensive beginner's introduction to ${sportName} structured as follows:

1. **What is ${sportName}?** (2-3 sentences — describe the sport, its origins, and what makes it unique)
2. **Why Try It?** (3 bullet points — key physical and mental benefits)
3. **What You Need to Get Started** (equipment list with approximate costs)
4. **Your First Week Plan** (3 sessions, each with duration, focus, and what to expect)
5. **Common Beginner Mistakes** (3 mistakes with how to avoid them)
6. **WellScore™ Impact** (which pillar — Body/Mind/Movement — this sport strengthens most and why)
7. **Community Tips** (2-3 sentences encouraging users to share their experience)

## Tone
- Energetic, inclusive, and encouraging
- Specific enough to be actionable — avoid generic fitness advice
- Use metric units (km, kg)
- Calibrate difficulty to ${communityFitnessLevel} level

## Output Format
Return the guide as plain text with markdown headings (##). No JSON wrapper needed.
Max 600 words. Make every word count.`;
}
