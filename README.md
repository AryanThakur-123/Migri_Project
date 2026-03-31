**Migri** is a professional Document Management System (DMS) built to demonstrate a scalable **Subscription & Feature Entitlement System**. It ensures that organizations (tenants) can only access features and resources according to their specific subscription tier.


---

## 🏗 System Architecture
Migri follows a **Shared Database, Isolated Schema** approach. Every request is identified by a unique `x-tenant-id` in the header, which the backend uses to scope all database queries and enforce security.

### **Entitlement Decision Flow**
1. **Identification:** Middleware extracts `tenant_id` from request headers.
2. **Validation:** Checks if the subscription `status` is `active` and the `end_date` has not passed.
3. **Entitlement:** Verifies if the requested feature (e.g., `OCR_SCAN`) is mapped to the tenant's current Plan.
4. **Usage Check:** Ensures `current_doc_count` is below the `max_documents` limit defined in the database.

---

## 📊 Database Design (ER Schema)
The system uses a highly normalized schema to allow for dynamic plan updates without code changes:

- **Tenants:** Unique organizations (UUID based).
- **Plans:** Defines subscription tiers (e.g., Free, Pro) and their specific `max_documents` limit.
- **Features:** Catalog of premium tools (e.g., `OCR_SCAN`, `UNLIMITED_STORAGE`).
- **Plan_Features:** Mapping table to assign specific features to plans.
- **Subscriptions:** Links tenants to plans with lifecycle states (`active`, `expired`) and `end_date`.
- **Tenant_Usage:** Tracks real-time resource consumption for limit enforcement.

---

## 🚀 Key Features
- ✅ **Multi-Tenant Isolation:** Complete data separation using `tenant_id` filtering.
- ✅ **API-Level Enforcement:** Premium modules are blocked at the server level via centralized middleware (`entitlementGuard`).
- ✅ **Usage Limit Enforcement:** Blocks actions immediately once a tenant reaches their document limit.
- ✅ **Subscription Lifecycle:** Automated 30-day expiry logic handled via SQL interval checks.
- ✅ **Dynamic Progress Tracking:** Real-time frontend dashboard reflecting current usage vs. plan limits.

---

## ⚙️ Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone (https://github.com/AryanThakur-123/Migri_Project.git)
Database Configuration:
Create a PostgreSQL database named dms_saas_db and run the seed script:

Bash
psql -U postgres -d dms_saas_db -f backend/seed.sql
Environment Variables:
Create a .env file in the backend folder:

Plaintext
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=dms_saas_db
PORT=3000
Run the Backend:

Bash
cd backend
npm install
npm run dev
Run the Frontend:

Bash
cd frontend
npm install
npm start
🧪 Testing & Validation
To verify the entitlement engine and usage limits, run the automated validation script:

Bash
node backend/tests/final_validation.js
This script tests:

Feature Gating: Ensures Free users cannot access OCR.

Usage Limits: Verifies the system blocks uploads after the limit is reached.

Expiration: Confirms the 403 response when a subscription is past its end_date
