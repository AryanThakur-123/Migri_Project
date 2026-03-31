const db = require('../../config/db');
const { authorize } = require('../../middleware/policyEngine');
const express = require('express');
const router = express.Router();

// Import your Guards
const { tenantContext } = require('../../middleware/tenantContext');
const { checkEntitlement } = require('../../middleware/entitlementGuard');
const { checkUsageLimit } = require('../../middleware/usageGuard');

/**
 * FEATURE CHECK (Day 2 Goal)
 * Only 'Pro' users should reach the logic inside this route.
 */
router.get('/ocr', 
    tenantContext,                // Step 1: Identify WHO is calling
    checkEntitlement('OCR_SCAN'), // Step 2: Check IF they are allowed (Premium)
    (req, res) => {
        res.json({ 
            message: "Success! You have access to Premium OCR Scanning.",
            tenantId: req.tenantId 
        });
    }
);

/**
 * USAGE LIMIT CHECK (Day 3 Goal - March 31st)
 * Even if allowed to upload, they can't exceed their plan's number.
 */
router.post('/upload', 
    tenantContext, 
    checkEntitlement('UPLOAD_DOC'), 
    checkUsageLimit, 
    async (req, res) => {
        const client = await db.connect(); // Get a dedicated connection
        try {
            await client.query('BEGIN'); // Start Transaction

            // ATOMIC INCREMENT: This prevents race conditions by locking the row
            const updateRes = await client.query(`
                UPDATE tenant_usage 
                SET current_doc_count = current_doc_count + 1 
                WHERE tenant_id = $1 
                RETURNING current_doc_count
            `, [req.tenantId]);

            // Double check inside the transaction for safety
            const currentCount = updateRes.rows[0].current_doc_count;
            
            await client.query('COMMIT');
            res.json({ message: "Upload successful", currentCount });
        } catch (err) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: "Upload failed" });
        } finally {
            client.release();
        }
    }
);

module.exports = router;