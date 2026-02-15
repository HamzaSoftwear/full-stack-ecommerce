// this file is for protecting routes
const { expressjwt: expressJwt } = require('express-jwt');

function authjwt() {
  const secret = process.env.SECRET;

  return expressJwt({
    secret: secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked
  }).unless({
    path: [
      // public routes
      { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/users\/login(.*)/, methods: ['POST', 'OPTIONS'] },
      { url: /\/api\/v1\/users(.*)/, methods: ['POST', 'OPTIONS'] },
      { url: /\/uploads(.*)/, methods: ['GET', 'OPTIONS'] }
    ]
  });
}

// Decide if token should be revoked (deny access).
// return true  => access denied
// return false => token accepted
async function isRevoked(req, token) {
  const payload = token.payload || {};
  const isAdmin = payload.isAdmin === true;

  const method = (req.method || '').toLowerCase();
  const path = (req.originalUrl || req.url || req.path || '').toLowerCase();

  // ---- ADMIN-ONLY WRITE OPERATIONS ----
  // Products, categories, users, uploads: all writes are admin-only
  const isAdminWriteOnCore =
    ['post', 'put', 'patch', 'delete'].includes(method) &&
    (path.includes('/api/v1/products') ||
      path.includes('/api/v1/categories') ||
      path.includes('/api/v1/users') ||
      path.includes('/api/v1/upload'));

  // Orders:
  // - POST /api/v1/orders  => allowed for any authenticated user
  // - PUT/DELETE /api/v1/orders... => admin-only
  const isOrdersWriteAdminOnly =
    ['put', 'patch', 'delete'].includes(method) &&
    path.includes('/api/v1/orders');

  const isWriteOperation = isAdminWriteOnCore || isOrdersWriteAdminOnly;

  // ---- ADMIN-ONLY READ OPERATIONS ----
  const adminGetRoutes =
    method === 'get' &&
    (
      path.includes('/api/v1/users') ||                        // any users listing or detail
      path.includes('/api/v1/orders/count') ||                 // order count
      (path.includes('/api/v1/orders') &&
        !path.includes('/api/v1/orders/myorder'))              // all orders except myorder
    );

  const adminOnly = isWriteOperation || adminGetRoutes;

  // if route is admin-only but user is not admin -> revoke
  if (adminOnly && !isAdmin) {
    return true;
  }

  // otherwise, any valid token is accepted
  return false;
}

module.exports = authjwt;

