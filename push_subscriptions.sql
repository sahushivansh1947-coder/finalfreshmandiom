-- Run this SQL in your InsForge database (via Dashboard → SQL Editor or run-raw-sql MCP tool)
-- Creates the push_subscriptions table to store browser push subscriptions

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint    TEXT UNIQUE NOT NULL,
    subscription_object JSONB NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by is_active
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);

-- Enable Row Level Security (allow anyone to insert/upsert their own subscription)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: allow anon to insert/upsert (browser register)
CREATE POLICY "Allow anon insert" ON push_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon upsert" ON push_subscriptions
    FOR UPDATE USING (true);

-- Policy: allow anon to read (for admin count)
CREATE POLICY "Allow anon select" ON push_subscriptions
    FOR SELECT USING (true);
