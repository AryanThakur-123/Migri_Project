-- Create Extensions for UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants (Organizations) [cite: 21, 22]
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subscription Plans [cite: 26, 28, 32]
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, -- e.g., 'Free', 'Pro' [cite: 29]
    max_documents INTEGER NOT NULL, -- "One measurable limit" [cite: 31, 43]
    price_monthly DECIMAL(10, 2) NOT NULL
);

-- 3. Features Master List [cite: 15, 30]
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'OCR_SCAN', 'SHARE_LINK'
    description TEXT
);

-- 4. Plan Entitlements 
CREATE TABLE IF NOT EXISTS plan_features (
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, feature_id)
);

-- 5. Active Subscriptions [cite: 24, 53]
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) UNIQUE,
    plan_id UUID REFERENCES plans(id),
    status VARCHAR(20) DEFAULT 'active', -- 'active' or 'expired' [cite: 54, 55]
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Usage Stats 
CREATE TABLE IF NOT EXISTS tenant_usage (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
    current_doc_count INTEGER DEFAULT 0 -- Tracks usage vs limit [cite: 42, 44]
);