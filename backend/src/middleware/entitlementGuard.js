const db = require('../config/db');

const checkEntitlement = (featureCode) => {
  return async (req, res, next) => {
    const tenantId = req.tenantId;

    try {
      console.log(`--- Entitlement Check Start ---`);
      console.log(`Checking Tenant: ${tenantId}`);
      console.log(`Looking for Feature: ${featureCode}`);

    const result = await db.query(`
        SELECT s.status, f.feature_code 
        FROM subscriptions s
        LEFT JOIN plan_features pf ON s.plan_id = pf.plan_id
        LEFT JOIN features f ON pf.feature_id = f.id AND f.feature_code = $2
        WHERE s.tenant_id = $1
    `, [tenantId, featureCode]);

    // 1. EXISTENCE CHECK
    if (result.rows.length === 0) {
        return res.status(403).json({ error: "No subscription record found." });
    }

    const record = result.rows[0];

    // 2. STATUS CHECK (Day 4 Requirement: 402 Error)
    // If status is not active (expired, suspended, etc.), block EVERYTHING.
    if (record.status !== 'active') {
        return res.status(402).json({ error: "Subscription not active. Please pay." });
    }

    // 3. FEATURE CHECK (Day 2 Requirement: 403 Error)
    // If the status was active, but feature_code is null, they don't have this feature.
    if (!record.feature_code) {
        return res.status(403).json({ error: "Feature not included in your plan." });
    }

    // 4. SUCCESS
    next()
    } catch (err) {
      console.error("❌ Database Error in Entitlement Guard:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

module.exports = { checkEntitlement };