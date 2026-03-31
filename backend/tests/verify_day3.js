const axios = require('axios');
const UPLOAD_URL = 'http://localhost:3000/api/v1/documents/upload';
const FREE_TENANT_ID = 'fcdec7f6-23ef-4f4d-bf59-3ee20d214b77';

async function verifyUsageLimit() {
    console.log("--- Starting Day 3: Usage Limit Verification ---");

    for (let i = 1; i <= 6; i++) {
        try {
            const res = await axios.post(UPLOAD_URL, 
                { fileName: `document_${i}.pdf` },
                { headers: { 'x-tenant-id': FREE_TENANT_ID } }
            );
            console.log(`Upload ${i}: ✅ Success (Total: ${res.data.currentCount})`);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log(`Upload ${i}: ❌ BLOCKED! ${error.response.data.message}`);
            } else {
                console.log(`Upload ${i}: ❌ Error ${error.response?.status || error.message}`);
            }
        }
    }
}

verifyUsageLimit();