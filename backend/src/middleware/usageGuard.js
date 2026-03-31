const db = require('../config/db');

const checkUsageLimit = async (req, res, next) => {
  const tenantId = req.tenantId;

  try {
    // This query links the tenant's current usage to their plan's max limit
      const result = await db.query(`
          SELECT p.max_documents, COALESCE(u.current_doc_count, 0) as current_count, s.status
          FROM subscriptions s
          JOIN plans p ON s.plan_id = p.id
          LEFT JOIN tenant_usage u ON s.tenant_id = u.tenant_id
          WHERE s.tenant_id = $1
      `, [tenantId]);

      // LIFECYCLE CHECK: If they aren't active, they can't upload anything
      if (result.rows[0].status !== 'active') {
          return res.status(402).json({ error: "Subscription inactive. Uploads disabled." });
      }
    const { max_documents, current_count } = result.rows[0];

    // THE CORE LOGIC: Block if they hit the limit (e.g., 5 for Free)
    if (current_count >= max_documents) {
      return res.status(403).json({
        error: "Usage Limit Exceeded",
        message: `Your plan limit is ${max_documents} documents. Please upgrade to Pro.`
      });
    }

    next();
  } catch (err) {
    console.error("Usage Guard Error:", err);
    res.status(500).json({ error: "Internal Server Error during usage check" });
  }
};

module.exports = { checkUsageLimit };