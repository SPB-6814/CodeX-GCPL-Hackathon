// ============================================================
// SportWell – WellScore™ Engine
// /lib/scoring/wellscore.ts
// ============================================================
import type {
  BodyInputs,
  MindInputs,
  MovementInputs,
  WellScoreBreakdown,
  WellScoreBand,
  ActivityType,
} from "../../types/index";

// ─────────────────────────────────────────────
// Activity type multipliers (0.5 – 1.0)
// Reflects relative cardiovascular / muscular demand
// ─────────────────────────────────────────────
const ACTIVITY_MULTIPLIERS: Record<ActivityType, number> = {
  running: 1.0,
  swimming: 1.0,
  cycling: 0.95,
  team_sport: 0.95,
  martial_arts: 0.90,
  gym: 0.85,
  walking: 0.75,
  yoga: 0.70,
  other: 0.70,
};

// ─────────────────────────────────────────────
// Duration factor: 30 min baseline → 1.0
// Caps at 120 min (1.5), floors at 0 min (0.1)
// ─────────────────────────────────────────────
function durationFactor(minutes: number): number {
  const clamped = Math.min(Math.max(minutes, 0), 180);
  if (clamped === 0) return 0.1;
  // Sigmoid-ish: 30 min = 0.8, 60 min = 1.0, 120 min = 1.4, 180 min = 1.5
  return Math.min(0.1 + (clamped / 60) * 0.9, 1.5);
}

// ─────────────────────────────────────────────
// Consistency factor: days active (0–7) → (0.2–1.0)
// ─────────────────────────────────────────────
function consistencyFactor(days: number): number {
  return 0.2 + (Math.min(days, 7) / 7) * 0.8;
}

// ─────────────────────────────────────────────
// Score band
// ─────────────────────────────────────────────
function getBand(score: number): WellScoreBand {
  if (score < 40) return "red";
  if (score < 70) return "amber";
  return "green";
}

// ─────────────────────────────────────────────
// Normalise: clamp a value to [0, 100]
// ─────────────────────────────────────────────
function clamp100(v: number): number {
  return Math.min(Math.max(Math.round(v * 100) / 100, 0), 100);
}

// ─────────────────────────────────────────────
// BODY SCORE  (max 100)
// Weights: energy 25%, sleep 25%, soreness 20%, hydration 15%, restingHR 15%
// soreness and restingHR are INVERTED (lower raw = better wellness)
// Raw inputs are 1–10 sliders → normalised to 0–100 by ×10
// ─────────────────────────────────────────────
export function computeBodyScore(inputs: BodyInputs): number {
  const { energy, sleep, soreness, hydration, restingHR } = inputs;

  // Invert soreness and resting HR (10 = worst)
  const sorenessInv = 11 - soreness; // 10 (no soreness) → 10, 1 (very sore) → 10 inverted 1
  const hrInv = 11 - restingHR;

  const raw =
    energy * 0.25 +
    sleep * 0.25 +
    sorenessInv * 0.20 +
    hydration * 0.15 +
    hrInv * 0.15;

  // raw is on 1–10 scale → convert to 0–100
  return clamp100((raw - 1) * (100 / 9));
}

// ─────────────────────────────────────────────
// MIND SCORE  (max 100)
// Weights: stress 25% (inverted), motivation 25%, focus 20%, mood 20%, social 10%
// ─────────────────────────────────────────────
export function computeMindScore(inputs: MindInputs): number {
  const { stress, motivation, focus, mood, social } = inputs;

  const stressInv = 11 - stress;

  const raw =
    stressInv * 0.25 +
    motivation * 0.25 +
    focus * 0.20 +
    mood * 0.20 +
    social * 0.10;

  return clamp100((raw - 1) * (100 / 9));
}

// ─────────────────────────────────────────────
// MOVEMENT SCORE  (max 100)
// Formula: activityMultiplier × durationFactor × intensityNorm
//          × consistencyFactor × enjoymentNorm / normaliser
// All component factors combined → scale to 0–100
// ─────────────────────────────────────────────
export function computeMovementScore(inputs: MovementInputs): number {
  const {
    activityType,
    durationMinutes,
    intensityLevel,
    consistencyDays,
    enjoymentLevel,
  } = inputs;

  const actMult = ACTIVITY_MULTIPLIERS[activityType] ?? 0.70;
  const durFactor = durationFactor(durationMinutes);
  const intNorm = intensityLevel / 10; // 0.1 – 1.0
  const conFactor = consistencyFactor(consistencyDays);
  const enjNorm = enjoymentLevel / 10; // 0.1 – 1.0

  // Combined raw: max theoretical = 1.0 × 1.5 × 1.0 × 1.0 × 1.0 = 1.5
  const raw = actMult * durFactor * intNorm * conFactor * enjNorm;

  // Normalise to 0–100 (max raw 1.5 → 100)
  return clamp100((raw / 1.5) * 100);
}

// ─────────────────────────────────────────────
// COMPOSITE WELLSCORE
// Body 35% | Mind 35% | Movement 30%
// ─────────────────────────────────────────────
export function computeWellScore(
  body: BodyInputs,
  mind: MindInputs,
  movement: MovementInputs
): WellScoreBreakdown {
  const bodyScore = computeBodyScore(body);
  const mindScore = computeMindScore(mind);
  const movementScore = computeMovementScore(movement);

  const composite = clamp100(
    bodyScore * 0.35 + mindScore * 0.35 + movementScore * 0.30
  );

  return {
    bodyScore,
    mindScore,
    movementScore,
    composite,
    band: getBand(composite),
  };
}
