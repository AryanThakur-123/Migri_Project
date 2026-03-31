# PROJECT REPORT: MIGRI SAAS SYSTEM
**Domain:** Multi-Tenant Document Management System (DMS)
**Submission Date:** March 31, 2026

---

## 1. System Architecture
Migri uses a **Layered SaaS Architecture** with a focus on Tenant Isolation and API-level Enforcement.

### Components:
- **Client Layer (React):** Provides a dynamic dashboard with real-time usage tracking and feature gating.
- **API Gateway (Node.js/Express):** Handles routing and acts as the security checkpoint.
- **Entitlement Engine (Middleware):** The core logic layer that validates:
    1. Tenant Identity (`x-tenant-id`)
    2. Subscription Status (`active` vs `expired`)
    3. Feature Permissions (Mapping Plan ID to Feature ID)
    4. Usage Quotas (Current Docs vs Max Documents)
- **Data Layer (PostgreSQL):** A relational database using a Shared-Schema model with Tenant ID filtering.



---

## 2. Database Schema (ER Diagram Description)
The database is designed to be **Configuration-Driven**, allowing new plans to be added without code changes.

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| **Tenants** | Defines the organization | `id`, `name`, `created_at` |
| **Plans** | Defines subscription tiers | `id`, `name`, `max_documents`, `price_monthly` |
| **Features** | Catalog of premium tools | `id`, `feature_code` (e.g., 'OCR_SCAN') |
| **Subscriptions** | Tracks the active contract | `tenant_id`, `plan_id`, `status`, `end_date` |
| **Tenant_Usage** | Real-time resource counter | `tenant_id`, `current_doc_count` |



---

## 3. Entitlement Decision Flow (Middleware Logic)
The **`entitlementGuard`** prevents unauthorized access at the API level using the following logic:

1. **Extraction:** Get `tenant_id` from Headers.
2. **Subscription Check:** Query DB for `status`. If status != 'active' or `end_date` < `today`, return `403 Forbidden`.
3. **Feature Check:** Verify if the requested endpoint (e.g., `/api/ocr`) exists in the `plan_features` table for this tenant's plan.
4. **Usage Check:** If the action creates a resource, verify `current_doc_count < max_documents`. If false, return `403 Forbidden`.

---

## 4. Testing & Validation
The system was validated using an **Automated Integration Test Suite** (`final_validation.js`) which confirmed:
- Successful blocking of Free users from Pro features.
- Automatic expiration of subscriptions based on system clock.
- Atomic increments of usage counters upon successful OCR processing.
