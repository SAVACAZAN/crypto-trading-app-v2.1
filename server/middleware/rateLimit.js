/**
 * Rate Limiting Middleware
 * Protects against brute-force attacks and API abuse
 */

// Store request counts per IP (in production, use Redis)
const requestCounts = new Map();

// Rate limit configuration
const RATE_LIMITS = {
  // Authentication endpoints - very strict
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,             // Max 5 requests
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },

  // Trading endpoints - moderate
  trading: {
    windowMs: 1 * 60 * 1000,   // 1 minute
    maxRequests: 30,            // Max 30 requests
    message: 'Too many trading requests. Please slow down.'
  },

  // API endpoints - lenient
  api: {
    windowMs: 1 * 60 * 1000,   // 1 minute
    maxRequests: 100,           // Max 100 requests
    message: 'Too many API requests. Please slow down.'
  },

  // Balance/wallet endpoints - strict
  wallet: {
    windowMs: 1 * 60 * 1000,   // 1 minute
    maxRequests: 20,            // Max 20 requests
    message: 'Too many wallet requests. Please slow down.'
  }
};

/**
 * Clean up old request records
 */
function cleanupOldRecords() {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > data.windowMs) {
      requestCounts.delete(key);
    }
  }
}

// Clean up every minute
setInterval(cleanupOldRecords, 60 * 1000);

/**
 * Get the client IP address
 */
function getClientIp(event) {
  const forwarded = getHeader(event, 'x-forwarded-for');
  const realIp = getHeader(event, 'x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return event.node.req.socket.remoteAddress || 'unknown';
}

/**
 * Determine rate limit tier based on path
 */
function getRateLimitTier(path) {
  // Authentication endpoints
  if (path.includes('/login') || path.includes('/register') || path.includes('/reset-password')) {
    return 'auth';
  }

  // Trading endpoints
  if (path.includes('/createOrder') || path.includes('/cancelOrder') || path.includes('/createGridBot')) {
    return 'trading';
  }

  // Wallet/balance endpoints
  if (path.includes('/balance') || path.includes('/wallet') || path.includes('/withdraw')) {
    return 'wallet';
  }

  // Default API tier
  return 'api';
}

/**
 * Check if request exceeds rate limit
 */
function isRateLimited(ip, path) {
  const tier = getRateLimitTier(path);
  const limit = RATE_LIMITS[tier];
  const key = `${ip}:${tier}`;

  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now - record.resetTime > limit.windowMs) {
    // Create new record
    requestCounts.set(key, {
      count: 1,
      resetTime: now,
      windowMs: limit.windowMs
    });
    return false;
  }

  // Increment count
  record.count++;

  // Check if limit exceeded
  if (record.count > limit.maxRequests) {
    return { limited: true, limit, remaining: 0 };
  }

  return { limited: false, limit, remaining: limit.maxRequests - record.count };
}

// Log once when middleware loads
let hasLoggedStatus = false;

export default defineEventHandler((event) => {
  // DISABLE rate limiting in development mode
  if (process.env.NODE_ENV !== 'production') {
    if (!hasLoggedStatus) {
      console.log('🔓 Rate Limiting DISABLED in development mode');
      hasLoggedStatus = true;
    }
    return; // Skip all rate limiting in development
  }

  const path = event.node.req.url;
  const method = event.node.req.method;

  // Only rate limit POST, PUT, DELETE, PATCH requests
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return;
  }

  // Get client IP
  const ip = getClientIp(event);

  // Check rate limit
  const rateLimitResult = isRateLimited(ip, path);

  if (rateLimitResult.limited) {
    console.warn(`🚫 Rate limit exceeded for IP ${ip} on path ${path}`);

    // Set rate limit headers
    event.node.res.setHeader('X-RateLimit-Limit', rateLimitResult.limit.maxRequests);
    event.node.res.setHeader('X-RateLimit-Remaining', 0);
    event.node.res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimitResult.limit.windowMs).toISOString());
    event.node.res.setHeader('Retry-After', Math.ceil(rateLimitResult.limit.windowMs / 1000));

    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: rateLimitResult.limit.message
    });
  }

  // Set rate limit info headers for successful requests
  if (rateLimitResult.remaining !== undefined) {
    event.node.res.setHeader('X-RateLimit-Limit', rateLimitResult.limit.maxRequests);
    event.node.res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
    event.node.res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimitResult.limit.windowMs).toISOString());
  }
});
