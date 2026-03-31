const { tenantContext } = require('./middleware/tenantContext');
const documentRoutes = require('./modules/documents/documents.routes');
const express = require('express');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const db = require('./config/db');
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());
app.use('/api', tenantContext);
app.use('/api/v1/documents', documentRoutes);
// ---------------------------------------------------------
// TODO: Import your Custom Middlewares (Day 4 task)
// const { tenantContext } = require('./middleware/tenantContext');
const { entitlementGuard } = require('./middleware/entitlementGuard');
// ---------------------------------------------------------

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'DMS SaaS Backend is running' });
});

// Example Premium Route (Requirement: Feature-Based Access)
app.get('/api/v1/documents/ocr', (req, res) => {
  // This will eventually be protected by your entitlementGuard
  res.json({ message: "Premium OCR Feature Accessed" });
});

// POST /api/ocr
app.post('/api/ocr', async (req, res) => {
    const tenantId = req.headers['x-tenant-id'];

    // 1. Logic: In a real app, save file to /uploads here
    
    // 2. Increment the usage count in the DB
    await db.query(`
        INSERT INTO tenant_usage (tenant_id, current_doc_count)
        VALUES ($1, 1)
        ON CONFLICT (tenant_id) 
        DO UPDATE SET current_doc_count = tenant_usage.current_doc_count + 1
    `, [tenantId]);

    res.status(200).json({ message: "Usage updated" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Target Submission Date: 31st March 2026`);
});

app.get('/api/subscription/status', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        
        const statusQuery = await db.query(`
            SELECT 
                t.name as tenant_name,
                p.name as plan_name,
                p.max_documents,
                -- Logic: Check if expired
                CASE 
                    WHEN s.status = 'active' AND s.end_date < CURRENT_DATE THEN 'expired'
                    ELSE s.status 
                END as status,
                s.end_date,
                COALESCE(u.current_doc_count, 0) as current_usage
            FROM tenants t
            JOIN subscriptions s ON t.id = s.tenant_id
            JOIN plans p ON s.plan_id = p.id
            LEFT JOIN features f ON f.id IN (SELECT feature_id FROM plan_features WHERE plan_id = p.id)
            LEFT JOIN tenant_usage u ON t.id = u.tenant_id
            WHERE t.id = $1
            -- EVERYTHING in the SELECT (that isn't an aggregate) must be here:
            GROUP BY t.name, p.name, p.max_documents, s.status, s.end_date, u.current_doc_count
        `, [tenantId]);

        if (statusQuery.rows.length > 0) {
            res.json(statusQuery.rows[0]);
        } else {
            res.status(404).json({ error: "No data found" });
        }
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Backend Crash" });
    }
});

// GET /api/subscription/status
// app.get('/api/subscription/status', async (req, res) => {
//     const tenantId = req.headers['x-tenant-id'];
    
//     const statusQuery = await db.query(`
//                 SELECT 
//                     t.name as tenant_name,
//                     p.name as plan_name,
//                     p.max_documents,
//                     s.status,
//                     COALESCE(u.current_doc_count, 0) as current_usage, -- MATCHES YOUR DB
//                     ARRAY_AGG(DISTINCT f.feature_code) as active_features
//                 FROM tenants t
//                 JOIN subscriptions s ON t.id = s.tenant_id
//                 JOIN plans p ON s.plan_id = p.id
//                 LEFT JOIN plan_features pf ON p.id = pf.plan_id
//                 LEFT JOIN features f ON pf.feature_id = f.id
//                 LEFT JOIN tenant_usage u ON t.id = u.tenant_id
//                 WHERE t.id = $1
//                 GROUP BY t.name, p.name, p.max_documents, s.status, u.current_doc_count
//             `, [tenantId]);

//     res.json(statusQuery.rows[0]);
// });