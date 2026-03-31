-- Reset Tables
TRUNCATE features, plans, plan_features, tenants, subscriptions, tenant_usage RESTART IDENTITY CASCADE;

-- 1. Setup Features
INSERT INTO features (feature_code, description) VALUES 
('BASIC_UPLOAD', 'Upload documents'),
('OCR_SCAN', 'Premium AI Scanning');

-- 2. Setup Plans (Fixed with price_monthly)
INSERT INTO plans (name, max_documents, price_monthly) VALUES 
('Free', 5, 0),
('Pro', 100, 20);

-- 3. Link Features to Plans
INSERT INTO plan_features (plan_id, feature_id) 
SELECT p.id, f.id FROM plans p, features f WHERE p.name = 'Pro';

INSERT INTO plan_features (plan_id, feature_id) 
SELECT p.id, f.id FROM plans p, features f WHERE p.name = 'Free' AND f.feature_code = 'BASIC_UPLOAD';

-- 4. Create a Demo Tenant
INSERT INTO tenants (id, name) VALUES ('eeee-ffff-aaaa-bbbb-cccc-dddd00000001', 'Migri Demo Org');

-- 5. Give them a Pro Subscription
INSERT INTO subscriptions (tenant_id, plan_id, status) 
VALUES ('eeee-ffff-aaaa-bbbb-cccc-dddd00000001', (SELECT id FROM plans WHERE name = 'Pro'), 'active');