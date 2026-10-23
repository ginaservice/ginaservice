-- =============================================
-- GinaService PostgreSQL Init Script
-- Amazon-grade schema with proper indices
-- =============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- USERS SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid             VARCHAR(128) UNIQUE NOT NULL,  -- Firebase UID
    email           VARCHAR(320) UNIQUE NOT NULL,
    phone           VARCHAR(32),
    display_name    VARCHAR(256) NOT NULL,
    avatar_url      TEXT,
    role            VARCHAR(32) NOT NULL DEFAULT 'user'
                    CHECK (role IN ('super_admin','admin','merchant','developer','user','guest')),
    tier            VARCHAR(32) NOT NULL DEFAULT 'free'
                    CHECK (tier IN ('free','starter','pro','enterprise','custom')),
    status          VARCHAR(32) NOT NULL DEFAULT 'pending_verification'
                    CHECK (status IN ('active','inactive','suspended','pending_verification','banned')),
    locale          VARCHAR(16) DEFAULT 'ar',
    timezone        VARCHAR(64) DEFAULT 'UTC',
    country         VARCHAR(3),
    referral_code   VARCHAR(16) UNIQUE DEFAULT UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)),
    referred_by     UUID REFERENCES users(id),
    metadata        JSONB DEFAULT '{}',
    flags           JSONB DEFAULT '{}',
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email     ON users(email);
CREATE INDEX idx_users_uid       ON users(uid);
CREATE INDEX idx_users_status    ON users(status);
CREATE INDEX idx_users_tier      ON users(tier);
CREATE INDEX idx_users_referral  ON users(referral_code);
CREATE INDEX idx_users_metadata  ON users USING gin(metadata);

-- =============================================
-- KYC SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS kyc_records (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(32) NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started','in_progress','under_review','approved','rejected','expired')),
    level           SMALLINT NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 4),
    verified_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    rejection_reason TEXT,
    documents       JSONB DEFAULT '[]',
    risk_rating     VARCHAR(16) DEFAULT 'low' CHECK (risk_rating IN ('low','medium','high','very_high')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kyc_user_id ON kyc_records(user_id);
CREATE INDEX idx_kyc_status  ON kyc_records(status);

-- =============================================
-- WALLETS SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS wallets (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency    VARCHAR(10) NOT NULL,
    balance     NUMERIC(24, 8) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    frozen      NUMERIC(24, 8) NOT NULL DEFAULT 0 CHECK (frozen >= 0),
    tier        VARCHAR(32) NOT NULL DEFAULT 'basic',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- =============================================
-- TRANSACTIONS SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id        VARCHAR(64) UNIQUE NOT NULL,
    idempotency_key     VARCHAR(256) UNIQUE,
    type                VARCHAR(32) NOT NULL CHECK (type IN ('payment','refund','transfer','deposit','withdrawal','fee','reward')),
    status              VARCHAR(32) NOT NULL DEFAULT 'initiated'
                        CHECK (status IN ('initiated','pending','processing','completed','failed','cancelled','refunded','disputed','on_hold')),
    amount              NUMERIC(24, 8) NOT NULL CHECK (amount > 0),
    currency            VARCHAR(10) NOT NULL,
    method              VARCHAR(32) NOT NULL,
    sender_id           UUID REFERENCES users(id),
    recipient_id        UUID REFERENCES users(id),
    merchant_id         UUID REFERENCES users(id),
    processing_fee      NUMERIC(12, 8) NOT NULL DEFAULT 0,
    platform_fee        NUMERIC(12, 8) NOT NULL DEFAULT 0,
    network_fee         NUMERIC(12, 8) NOT NULL DEFAULT 0,
    total_fees          NUMERIC(12, 8) NOT NULL DEFAULT 0,
    risk_score          SMALLINT NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    description         TEXT,
    metadata            JSONB DEFAULT '{}',
    webhook_url         TEXT,
    failure_reason      TEXT,
    audit_trail         JSONB DEFAULT '[]',
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_sender       ON transactions(sender_id, created_at DESC);
CREATE INDEX idx_transactions_recipient    ON transactions(recipient_id, created_at DESC);
CREATE INDEX idx_transactions_merchant     ON transactions(merchant_id, created_at DESC);
CREATE INDEX idx_transactions_status       ON transactions(status);
CREATE INDEX idx_transactions_type         ON transactions(type);
CREATE INDEX idx_transactions_currency     ON transactions(currency);
CREATE INDEX idx_transactions_created      ON transactions(created_at DESC);
CREATE INDEX idx_transactions_reference    ON transactions(reference_id);
CREATE INDEX idx_transactions_idempotency  ON transactions(idempotency_key);
CREATE INDEX idx_transactions_metadata     ON transactions USING gin(metadata);

-- =============================================
-- SESSIONS SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id       VARCHAR(256),
    ip_address      INET,
    user_agent      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    mfa_verified    BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at      TIMESTAMPTZ NOT NULL,
    last_activity   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id  ON sessions(user_id);
CREATE INDEX idx_sessions_active   ON sessions(is_active, expires_at);

-- =============================================
-- NOTIFICATIONS SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel     VARCHAR(32) NOT NULL CHECK (channel IN ('email','sms','push','in_app','webhook','whatsapp')),
    priority    VARCHAR(16) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
    title       VARCHAR(512) NOT NULL,
    body        TEXT NOT NULL,
    data        JSONB DEFAULT '{}',
    image_url   TEXT,
    action_url  TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    sent_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id  ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread   ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- =============================================
-- AUDIT LOGS SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event       VARCHAR(128) NOT NULL,
    actor_id    UUID,
    actor_type  VARCHAR(32) DEFAULT 'user',
    target_id   VARCHAR(256),
    target_type VARCHAR(128),
    ip_address  INET,
    user_agent  TEXT,
    level       SMALLINT NOT NULL DEFAULT 1,
    details     JSONB DEFAULT '{}',
    signature   VARCHAR(256),  -- HMAC signature for tamper detection
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor   ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_event   ON audit_logs(event);
CREATE INDEX idx_audit_level   ON audit_logs(level);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kyc_updated          BEFORE UPDATE ON kyc_records  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_wallets_updated      BEFORE UPDATE ON wallets       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_transactions_updated BEFORE UPDATE ON transactions  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SEED: Default admin user
-- =============================================
INSERT INTO users (uid, email, display_name, role, tier, status)
VALUES ('admin_seed_uid', 'admin@ginaservice.com', 'GinaService Admin', 'super_admin', 'enterprise', 'active')
ON CONFLICT (email) DO NOTHING;
