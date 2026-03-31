const { tenantContext } = require('./tenantContext');
const { checkEntitlement } = require('./entitlementGuard');
const { checkUsageLimit } = require('./usageGuard');

// A "Super-Middleware" that combines all checks into one line
const authorize = (featureCode) => {
    return [
        tenantContext,           // 1. Who are you?
        checkEntitlement(featureCode), // 2. Can you do this?
        checkUsageLimit          // 3. Do you have room left?
    ];
};

module.exports = { authorize };