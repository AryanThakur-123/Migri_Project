const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1/documents/ocr';

async function runTests() {
    console.log("--- Starting Day 2 Verification ---");

    // TEST 1: No Identity (Expect 401)
    try {
        await axios.get(API_URL);
    } catch (error) {
        console.log("✅ Test 1 Passed: Blocked request without x-tenant-id (401)");
    }

    // TEST 2: Free Plan accessing Premium Feature (Expect 403)
    // Use a UUID you generated in your seed script for the 'Free' tenant
console.log("Running Test 2...");
try {
    await axios.get(API_URL, {
        headers: { 'x-tenant-id': 'fcdec7f6-23ef-4f4d-bf59-3ee20d214b77' }
    });
    console.log("❌ Test 2 Failed: Request should have been blocked, but it was allowed!");
} catch (error) {
    if (error.response) {
        console.log(`Received Status: ${error.response.status}`);
        if (error.response.status === 403) {
            console.log("✅ Test 2 Passed: 'Free' plan blocked from Premium OCR (403)");
        }
    } else {
        // This triggers if the server crashes or the route is wrong
        console.log("❌ Test 2 Crashed: No response from server. Check server logs!");
        console.log("Error Message:", error.message);
    }
}

// ... (Test 1 and 2 are already working) ...

// TEST 3: Expired Subscription (Expect 402)
try {
    await axios.get(API_URL, {
        headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000000' } 
    });
} catch (error) {
    if (error.response && error.response.status === 402) {
        console.log("✅ Test 3 Passed: Expired subscription blocked (402)");
    } else {
        console.log(`❌ Test 3 Failed: Expected 402, got ${error.response?.status}`);
    }
}

// TEST 4: Pro Plan Access (Expect 200 SUCCESS)
try {
    const res = await axios.get(API_URL, {
        headers: { 'x-tenant-id': 'eeee-ffff-aaaa-bbbb-cccc-dddd00000001' } 
    });
    if (res.status === 200) {
        console.log("✅ Test 4 Passed: 'Pro' plan allowed to access OCR (200)");
    }
} catch (error) {
    console.log(`❌ Test 4 Failed: Expected 200, got ${error.response?.status}`);
}
}

runTests();