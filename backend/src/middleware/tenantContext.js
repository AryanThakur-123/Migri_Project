/**
 * Middleware to identify the Tenant (Organization) from the request headers.
 * Requirement: Support multiple organizations (tenants)
 */
const tenantContext = (req, res, next) => {
  // Extracting the tenant ID from the header
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    // Returns 401 if missing [Requirement: Proper HTTP responses]
    return res.status(401).json({ 
      error: "Missing Tenant Identification", 
      message: "Please provide a valid x-tenant-id in the headers." 
    });
  }

  // Attach to request for use in later logic [Requirement: Tenant isolation]
  req.tenantId = tenantId;
  next();
};

module.exports = { tenantContext };