-- ==============================================================================
-- BetFit Arena V1 — Production Database Schema (PostgreSQL 16+)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    avatar_initials VARCHAR(4) NOT NULL DEFAULT 'U',
    avatar_color VARCHAR(30) NOT NULL DEFAULT 'emerald',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    privacy_mode VARCHAR(20) NOT NULL DEFAULT 'delta_only', -- 'full_numbers', 'delta_only', 'percentage_only'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WAGERS / BET SHOWDOWNS
CREATE TABLE IF NOT EXISTS wagers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL DEFAULT '₹',
    stake_amount DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    total_pot DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'draft', 'active', 'verification', 'completed', 'cancelled'
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_deadline DATE NOT NULL,
    forfeit_rule TEXT NOT NULL,
    invite_code VARCHAR(32) UNIQUE NOT NULL,
    invite_expires_at TIMESTAMPTZ,
    is_private BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. WAGER PARTICIPANTS (Custom Baselines & Goals per member)
CREATE TABLE IF NOT EXISTS wager_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wager_id UUID NOT NULL REFERENCES wagers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'participant', -- 'owner', 'participant', 'spectator'
    goal_type VARCHAR(10) NOT NULL, -- 'loss', 'gain'
    starting_weight DECIMAL(5,2) NOT NULL,
    current_weight DECIMAL(5,2) NOT NULL,
    target_weight DECIMAL(5,2) NOT NULL,
    weight_unit VARCHAR(5) NOT NULL DEFAULT 'kg',
    chosen_disciplines TEXT[] NOT NULL DEFAULT '{"gym", "walking", "diet"}',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'forfeited', 'disqualified', 'winner'
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(wager_id, user_id)
);

-- 4. WEIGH-IN LOGS
CREATE TABLE IF NOT EXISTS weigh_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wager_id UUID NOT NULL REFERENCES wagers(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,
    unit VARCHAR(5) NOT NULL DEFAULT 'kg',
    weigh_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    photo_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, wager_id, weigh_in_date)
);

-- 5. DAILY HABIT LOGS
CREATE TABLE IF NOT EXISTS daily_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    discipline VARCHAR(50) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    duration_minutes INT,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, habit_date, discipline)
);

-- 6. USER STREAKS & SHIELDS
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    shields_available INT NOT NULL DEFAULT 1,
    last_completed_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SOCIAL BANTER & NUDGES
CREATE TABLE IF NOT EXISTS wager_banter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wager_id UUID NOT NULL REFERENCES wagers(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'cheer', 'nudge', 'taunt', 'danger', 'milestone', 'system'
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_wagers_invite_code ON wagers(invite_code);
CREATE INDEX IF NOT EXISTS idx_wager_participants_wager_id ON wager_participants(wager_id);
CREATE INDEX IF NOT EXISTS idx_wager_participants_user_id ON wager_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_weigh_ins_user_date ON weigh_ins(user_id, weigh_in_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_habits_user_date ON daily_habits(user_id, habit_date);
CREATE INDEX IF NOT EXISTS idx_wager_banter_wager_id ON wager_banter(wager_id, created_at DESC);
