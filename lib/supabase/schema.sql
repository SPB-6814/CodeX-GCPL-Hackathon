-- ============================================================
-- SportWell – Full Supabase / PostgreSQL Schema
-- /lib/supabase/schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('male','female','non_binary','prefer_not_to_say');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fitness_level') THEN
    CREATE TYPE fitness_level AS ENUM ('beginner','intermediate','advanced','elite');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_type') THEN
    CREATE TYPE badge_type AS ENUM ('STREAK_7','STREAK_30','STREAK_100');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE activity_type AS ENUM (
      'walking','running','cycling','swimming','gym',
      'yoga','team_sport','martial_arts','other'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'target_unit') THEN
    CREATE TYPE target_unit AS ENUM ('minutes','steps','km','reps');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_filter') THEN
    CREATE TYPE gender_filter AS ENUM ('male','female','all');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'digest_trend') THEN
    CREATE TYPE digest_trend AS ENUM ('improving','stable','declining');
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- UTILITY TRIGGER: set_updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- ─────────────────────────────────────────────
-- TABLE: profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  avatar_url     TEXT,
  date_of_birth  DATE NOT NULL,
  gender         gender_type NOT NULL DEFAULT 'prefer_not_to_say',
  city           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own"  ON profiles FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"  ON profiles FOR INSERT  WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON profiles FOR UPDATE  USING (auth.uid() = id);
CREATE POLICY "profiles_service"     ON profiles USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: sport_profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sport_profiles (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  primary_sport        TEXT NOT NULL,
  fitness_level        fitness_level NOT NULL DEFAULT 'beginner',
  weekly_goal_minutes  INT NOT NULL DEFAULT 150 CHECK (weekly_goal_minutes >= 0),
  injuries             TEXT[] NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sport_profiles_user_unique UNIQUE (user_id)
);

DROP TRIGGER IF EXISTS sport_profiles_updated_at ON sport_profiles;
CREATE TRIGGER sport_profiles_updated_at
  BEFORE UPDATE ON sport_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE sport_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sp_select_own" ON sport_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sp_insert_own" ON sport_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sp_update_own" ON sport_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sp_service"    ON sport_profiles USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: sessions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body_score       NUMERIC(5,2) NOT NULL CHECK (body_score BETWEEN 0 AND 100),
  mind_score       NUMERIC(5,2) NOT NULL CHECK (mind_score BETWEEN 0 AND 100),
  movement_score   NUMERIC(5,2) NOT NULL CHECK (movement_score BETWEEN 0 AND 100),
  composite_score  NUMERIC(5,2) NOT NULL CHECK (composite_score BETWEEN 0 AND 100),
  score_band       TEXT NOT NULL CHECK (score_band IN ('red','amber','green')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_created_idx ON sessions (user_id, created_at DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_select_own" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert_own" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_service"    ON sessions USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: session_answers
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_answers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id       UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- body
  energy           SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 10),
  sleep            SMALLINT NOT NULL CHECK (sleep BETWEEN 1 AND 10),
  soreness         SMALLINT NOT NULL CHECK (soreness BETWEEN 1 AND 10),
  hydration        SMALLINT NOT NULL CHECK (hydration BETWEEN 1 AND 10),
  resting_hr       SMALLINT NOT NULL CHECK (resting_hr BETWEEN 1 AND 10),
  -- mind
  stress           SMALLINT NOT NULL CHECK (stress BETWEEN 1 AND 10),
  motivation       SMALLINT NOT NULL CHECK (motivation BETWEEN 1 AND 10),
  focus            SMALLINT NOT NULL CHECK (focus BETWEEN 1 AND 10),
  mood             SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 10),
  social           SMALLINT NOT NULL CHECK (social BETWEEN 1 AND 10),
  -- movement
  activity_type    activity_type NOT NULL DEFAULT 'other',
  duration_minutes SMALLINT NOT NULL CHECK (duration_minutes >= 0),
  intensity_level  SMALLINT NOT NULL CHECK (intensity_level BETWEEN 1 AND 10),
  consistency_days SMALLINT NOT NULL CHECK (consistency_days BETWEEN 0 AND 7),
  enjoyment_level  SMALLINT NOT NULL CHECK (enjoyment_level BETWEEN 1 AND 10),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sa_select_own" ON session_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sa_insert_own" ON session_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sa_service"    ON session_answers USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: streaks
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streaks (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak    INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak    INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_checkin_date DATE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT streaks_user_unique UNIQUE (user_id)
);

DROP TRIGGER IF EXISTS streaks_updated_at ON streaks;
CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks_select_own" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "streaks_insert_own" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "streaks_update_own" ON streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "streaks_service"    ON streaks USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: badges
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type  badge_type NOT NULL,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT badges_user_type_unique UNIQUE (user_id, badge_type)
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_select_own" ON badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "badges_service"    ON badges USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: saved_cards
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_cards (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_data JSONB NOT NULL,
  saved_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_cards_user_idx ON saved_cards (user_id, saved_at DESC);

ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sc_select_own" ON saved_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sc_insert_own" ON saved_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sc_delete_own" ON saved_cards FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TABLE: weekly_digests
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_digests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date   DATE NOT NULL,
  avg_well_score    NUMERIC(5,2) NOT NULL,
  body_avg          NUMERIC(5,2) NOT NULL,
  mind_avg          NUMERIC(5,2) NOT NULL,
  movement_avg      NUMERIC(5,2) NOT NULL,
  trend             digest_trend NOT NULL DEFAULT 'stable',
  gemini_narrative  TEXT NOT NULL,
  highlight_metric  TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT weekly_digests_user_week_unique UNIQUE (user_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS weekly_digests_user_idx ON weekly_digests (user_id, week_start_date DESC);

ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wd_select_own" ON weekly_digests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wd_service"    ON weekly_digests USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: orgs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orgs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  logo_url       TEXT,
  description    TEXT,
  website        TEXT,
  owner_user_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs_public_read"  ON orgs FOR SELECT USING (true);
CREATE POLICY "orgs_owner_update" ON orgs FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "orgs_service"      ON orgs USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: org_follows
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_follows (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT org_follows_unique UNIQUE (user_id, org_id)
);

ALTER TABLE org_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "of_select_own" ON org_follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "of_insert_own" ON org_follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "of_delete_own" ON org_follows FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TABLE: noticeboard_posts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS noticeboard_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id       UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  image_url    TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS nb_posts_org_idx ON noticeboard_posts (org_id, published_at DESC);

ALTER TABLE noticeboard_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nb_select_followers" ON noticeboard_posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM org_follows
    WHERE org_follows.org_id = noticeboard_posts.org_id
      AND org_follows.user_id = auth.uid()
  )
);
CREATE POLICY "nb_insert_owner" ON noticeboard_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orgs WHERE orgs.id = noticeboard_posts.org_id AND orgs.owner_user_id = auth.uid())
);
CREATE POLICY "nb_service" ON noticeboard_posts USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: contests
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  activity_type     activity_type NOT NULL DEFAULT 'other',
  target_value      NUMERIC NOT NULL CHECK (target_value > 0),
  target_unit       target_unit NOT NULL DEFAULT 'minutes',
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  min_age           SMALLINT CHECK (min_age >= 0),
  max_age           SMALLINT CHECK (max_age <= 120),
  gender_filter     gender_filter NOT NULL DEFAULT 'all',
  participant_count INT NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contests_dates_check CHECK (ends_at > starts_at)
);

ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contests_public_read" ON contests FOR SELECT USING (true);
CREATE POLICY "contests_service"     ON contests USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: contest_entries
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contest_entries (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id   UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  value_logged NUMERIC CHECK (value_logged >= 0),
  CONSTRAINT contest_entries_unique UNIQUE (contest_id, user_id)
);

CREATE INDEX IF NOT EXISTS ce_contest_idx ON contest_entries (contest_id, value_logged DESC NULLS LAST);

ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ce_public_read"  ON contest_entries FOR SELECT USING (true);
CREATE POLICY "ce_insert_own"   ON contest_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ce_update_own"   ON contest_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ce_service"      ON contest_entries USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: sport_nominations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sport_nominations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start_date  DATE NOT NULL,
  sport_name       TEXT NOT NULL,
  nominated_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_count       INT NOT NULL DEFAULT 0 CHECK (vote_count >= 0),
  is_winner        BOOLEAN NOT NULL DEFAULT false,
  guide_text       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sport_nominations_week_sport_unique UNIQUE (week_start_date, sport_name)
);

CREATE INDEX IF NOT EXISTS sn_week_idx ON sport_nominations (week_start_date, vote_count DESC);

ALTER TABLE sport_nominations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sn_public_read"   ON sport_nominations FOR SELECT USING (true);
CREATE POLICY "sn_insert_auth"   ON sport_nominations FOR INSERT WITH CHECK (auth.uid() = nominated_by);
CREATE POLICY "sn_service"       ON sport_nominations USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: sport_votes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sport_votes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nomination_id    UUID NOT NULL REFERENCES sport_nominations(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  week_start_date  DATE NOT NULL,
  CONSTRAINT sport_votes_user_week_unique UNIQUE (user_id, week_start_date)
);

ALTER TABLE sport_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sv_public_read" ON sport_votes FOR SELECT USING (true);
CREATE POLICY "sv_insert_own"  ON sport_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sv_service"     ON sport_votes USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: recovery_tips
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recovery_tips (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL CHECK (length(content) BETWEEN 10 AND 2000),
  tags          TEXT[] NOT NULL DEFAULT '{}',
  upvote_count  INT NOT NULL DEFAULT 0 CHECK (upvote_count >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rt_upvote_idx ON recovery_tips (upvote_count DESC, created_at DESC);

ALTER TABLE recovery_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rt_public_read" ON recovery_tips FOR SELECT USING (true);
CREATE POLICY "rt_insert_own"  ON recovery_tips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rt_service"     ON recovery_tips USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABLE: tip_upvotes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tip_upvotes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tip_id     UUID NOT NULL REFERENCES recovery_tips(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  upvoted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tip_upvotes_unique UNIQUE (tip_id, user_id)
);

ALTER TABLE tip_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tu_public_read" ON tip_upvotes FOR SELECT USING (true);
CREATE POLICY "tu_insert_own"  ON tip_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tu_delete_own"  ON tip_upvotes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "tu_service"     ON tip_upvotes USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TRIGGERS: upvote counters
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_tip_upvote()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE recovery_tips SET upvote_count = upvote_count + 1 WHERE id = NEW.tip_id;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION decrement_tip_upvote()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE recovery_tips SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = OLD.tip_id;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS trg_tip_upvote_insert ON tip_upvotes;
CREATE TRIGGER trg_tip_upvote_insert
  AFTER INSERT ON tip_upvotes FOR EACH ROW EXECUTE FUNCTION increment_tip_upvote();

DROP TRIGGER IF EXISTS trg_tip_upvote_delete ON tip_upvotes;
CREATE TRIGGER trg_tip_upvote_delete
  AFTER DELETE ON tip_upvotes FOR EACH ROW EXECUTE FUNCTION decrement_tip_upvote();

-- ─────────────────────────────────────────────
-- TRIGGERS: sport nomination vote_count
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_nomination_vote()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE sport_nominations SET vote_count = vote_count + 1 WHERE id = NEW.nomination_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sport_vote_insert ON sport_votes;
CREATE TRIGGER trg_sport_vote_insert
  AFTER INSERT ON sport_votes FOR EACH ROW EXECUTE FUNCTION increment_nomination_vote();

-- ─────────────────────────────────────────────
-- TRIGGERS: contest participant_count
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_contest_participant()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE contests SET participant_count = participant_count + 1 WHERE id = NEW.contest_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_contest_entry_insert ON contest_entries;
CREATE TRIGGER trg_contest_entry_insert
  AFTER INSERT ON contest_entries FOR EACH ROW EXECUTE FUNCTION increment_contest_participant();

-- ─────────────────────────────────────────────
-- Enable Realtime for leaderboard
-- Run manually in Supabase dashboard → Realtime → Tables
-- ALTER PUBLICATION supabase_realtime ADD TABLE contest_entries;
-- ─────────────────────────────────────────────
