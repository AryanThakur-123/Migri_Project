const path = require('path');
// This finds the .env file exactly two levels up from src/models/
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { Pool } = require('pg');

// DEBUG: If this still says undefined, your .env file is named incorrectly or in the wrong folder
console.log("Checking .env load... Host is:", process.env.DB_HOST);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seed() {
  try {
    // 1. Clear existing data (Optional but helpful for testing)
    await pool.query('TRUNCATE tenants, plans, features, subscriptions, tenant_usage CASCADE');

    // 2. Create Plans
    const freePlan = await pool.query(
      "INSERT INTO plans (name, max_documents, price_monthly) VALUES ('Free', 5, 0) RETURNING id"
    );
    const proPlan = await pool.query(
      "INSERT INTO plans (name, max_documents, price_monthly) VALUES ('Pro', 100, 20) RETURNING id"
    );

    // 3. Create a Test Tenant
    const tenant = await pool.query(
      "INSERT INTO tenants (name) VALUES ('Test Corp') RETURNING id"
    );
    const tenantId = tenant.rows[0].id;

    // 4. Link Tenant to a Subscription (Crucial for Day 2)
    await pool.query(
      "INSERT INTO subscriptions (tenant_id, plan_id, status) VALUES ($1, $2, 'active')",
      [tenantId, freePlan.rows[0].id]
    );

    // 5. Initialize Usage (Crucial for Day 3)
    await pool.query(
      "INSERT INTO tenant_usage (tenant_id, current_doc_count) VALUES ($1, 0)",
      [tenantId]
    );

    console.log("✅ Database Seeded Successfully!");
    console.log("TENANT_ID for Testing:", tenantId);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  }
}

seed();