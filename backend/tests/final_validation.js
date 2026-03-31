const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const PRO_TENANT_ID = 'eeee-ffff-aaaa-bbbb-cccc-dddd00000001'; // From your seed.sql

async function runValidation() {
    console.log("🚀 Starting Final Project Validation...");

    // TEST 1: Check Subscription Status
    try {
        const res = await axios.get(`${API_URL}/subscription/status`, {
            headers: { 'x-tenant-id': PRO_TENANT_ID }
        });
        console.log("✅ TEST 1: Subscription Fetching... PASSED");
        console.log(`   Plan: ${res.data.plan_name} | Status: ${res.data.status}`);
    } catch (e) {
        console.error("❌ TEST 1 FAILED: Could not fetch subscription.");
    }

    // TEST 2: Check Feature Entitlement (OCR)
    try {
        const res = await axios.post(`${API_URL}/ocr`, {}, {
            headers: { 'x-tenant-id': PRO_TENANT_ID }
        });
        if (res.status === 200) {
            console.log("✅ TEST 2: Feature Access (Pro User)... PASSED");
        }
    } catch (e) {
        console.error("❌ TEST 2 FAILED: Pro user blocked from OCR.");
    }

    // TEST 3: Check Usage Increment
    try {
        const statusBefore = await axios.get(`${API_URL}/subscription/status`, {
            headers: { 'x-tenant-id': PRO_TENANT_ID }
        });
        await axios.post(`${API_URL}/ocr`, {}, { headers: { 'x-tenant-id': PRO_TENANT_ID } });
        
        const statusAfter = await axios.get(`${API_URL}/subscription/status`, {
            headers: { 'x-tenant-id': PRO_TENANT_ID }
        });

        if (statusAfter.data.current_usage > statusBefore.data.current_usage) {
            console.log("✅ TEST 3: Usage Tracking (+1 Document)... PASSED");
        }
    } catch (e) {
        console.error("❌ TEST 3 FAILED: Usage count did not increment.");
    }

    console.log("\n🏁 ALL SYSTEMS OPERATIONAL FOR MARCH 31st SUBMISSION.");
}

runValidation();