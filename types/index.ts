// ============================================================
// SportWell – Shared TypeScript Interfaces
// /types/index.ts
// ============================================================

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export type WellScoreBand = "red" | "amber" | "green";

export type BadgeType = "STREAK_7" | "STREAK_30" | "STREAK_100";

export type FeedCardType =
  | "tip"
  | "challenge"
  | "insight"
  | "motivation"
  | "recovery";

export type ActivityType =
  | "walking"
  | "running"
  | "cycling"
  | "swimming"
  | "gym"
  | "yoga"
  | "team_sport"
  | "martial_arts"
  | "other";

export type FitnessLevel = "beginner" | "intermediate" | "advanced" | "elite";

// ─────────────────────────────────────────────
// WellScore Domain
// ─────────────────────────────────────────────

export interface BodyInputs {
  energy: number;       // 1–10
  sleep: number;        // 1–10
  soreness: number;     // 1–10 (inverted internally)
  hydration: number;    // 1–10
  restingHR: number;    // 1–10 (inverted internally)
}

export interface MindInputs {
  stress: number;       // 1–10 (inverted internally)
  motivation: number;   // 1–10
  focus: number;        // 1–10
  mood: number;         // 1–10
  social: number;       // 1–10
}

export interface MovementInputs {
  activityType: ActivityType;
  durationMinutes: number;   // 0–180+
  intensityLevel: number;    // 1–10
  consistencyDays: number;   // days active in past 7 days (0–7)
  enjoymentLevel: number;    // 1–10
}

export interface WellScoreBreakdown {
  bodyScore: number;       // 0–100
  mindScore: number;       // 0–100
  movementScore: number;   // 0–100
  composite: number;       // 0–100
  band: WellScoreBand;
}

// ─────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────

export interface SessionAnswers {
  body: BodyInputs;
  mind: MindInputs;
  movement: MovementInputs;
}

export interface Session {
  id: string;
  userId: string;
  answers: SessionAnswers;
  scores: WellScoreBreakdown;
  createdAt: string; // ISO-8601
}

export interface SessionSubmitRequest {
  answers: SessionAnswers;
}

export interface SessionSubmitResponse {
  session: Session;
  streak: Streak;
  badgesEarned: Badge[];
}

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

export interface Profile {
  id: string;             // matches Supabase auth.users.id
  fullName: string;
  avatarUrl: string | null;
  dateOfBirth: string;    // YYYY-MM-DD
  gender: "male" | "female" | "non_binary" | "prefer_not_to_say";
  city: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SportProfile {
  id: string;
  userId: string;
  primarySport: string;
  fitnessLevel: FitnessLevel;
  weeklyGoalMinutes: number;
  injuries: string[];     // free-text array
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Streaks & Badges
// ─────────────────────────────────────────────

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string; // YYYY-MM-DD
  updatedAt: string;
}

export interface Badge {
  id: string;
  userId: string;
  badgeType: BadgeType;
  earnedAt: string;
}

// ─────────────────────────────────────────────
// Feed / AI Cards
// ─────────────────────────────────────────────

export interface FeedCard {
  id: string;
  cardType: FeedCardType;
  title: string;
  body: string;
  cta: string | null;
  tags: string[];
  emoji: string;
}

export interface FeedGenerateRequest {
  userId: string;
  recentScores: WellScoreBreakdown[];   // last 7 days
  currentStreak: number;
  sportProfile: SportProfile;
}

export interface SavedCard {
  id: string;
  userId: string;
  card: FeedCard;
  savedAt: string;
}

// ─────────────────────────────────────────────
// Weekly Digest
// ─────────────────────────────────────────────

export interface WeeklyDigest {
  id: string;
  userId: string;
  weekStartDate: string;       // Monday ISO date
  avgWellScore: number;
  bodyAvg: number;
  mindAvg: number;
  movementAvg: number;
  trend: "improving" | "stable" | "declining";
  geminiNarrative: string;     // Gemini-generated paragraph
  highlightMetric: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Organisations
// ─────────────────────────────────────────────

export interface Org {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  followerCount: number;
  createdAt: string;
}

export interface OrgFollow {
  id: string;
  userId: string;
  orgId: string;
  followedAt: string;
}

// ─────────────────────────────────────────────
// Noticeboard
// ─────────────────────────────────────────────

export interface NoticeboardPost {
  id: string;
  orgId: string;
  orgName: string;
  orgLogoUrl: string | null;
  title: string;
  body: string;
  imageUrl: string | null;
  publishedAt: string;
  expiresAt: string | null;
}

export interface CreateNoticeboardPostRequest {
  title: string;
  body: string;
  imageUrl?: string;
  expiresAt?: string;
}

// ─────────────────────────────────────────────
// Contests
// ─────────────────────────────────────────────

export interface Contest {
  id: string;
  title: string;
  description: string;
  activityType: ActivityType;
  targetValue: number;
  targetUnit: "minutes" | "steps" | "km" | "reps";
  startsAt: string;
  endsAt: string;
  minAge: number | null;
  maxAge: number | null;
  genderFilter: "male" | "female" | "all";
  participantCount: number;
  isActive: boolean;
}

export interface ContestEntry {
  id: string;
  contestId: string;
  userId: string;
  joinedAt: string;
  completedAt: string | null;
  valueLogged: number | null;
  rank: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  valueLogged: number;
  completedAt: string;
}

// ─────────────────────────────────────────────
// Sport Discovery
// ─────────────────────────────────────────────

export interface SportNomination {
  id: string;
  weekStartDate: string;
  sportName: string;
  nominatedBy: string;       // userId
  voteCount: number;
  isWinner: boolean;
  guideText: string | null;  // Gemini-generated beginner guide
  createdAt: string;
}

export interface SportVote {
  id: string;
  nominationId: string;
  userId: string;
  votedAt: string;
}

// ─────────────────────────────────────────────
// Recovery Circle
// ─────────────────────────────────────────────

export interface RecoveryTip {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  tags: string[];
  upvoteCount: number;
  userHasUpvoted: boolean;   // computed per-request
  createdAt: string;
}

export interface TipUpvote {
  id: string;
  tipId: string;
  userId: string;
  upvotedAt: string;
}

// ─────────────────────────────────────────────
// Generic API Wrappers
// ─────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─────────────────────────────────────────────
// JWT / Auth Middleware
// ─────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      orgId?: string; // set by org-auth middleware
    }
  }
}
