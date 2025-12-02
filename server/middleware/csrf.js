/**
 * CSRF (Cross-Site Request Forgery) Protection Middleware
 * Protects against CSRF attacks by validating tokens
 */

import crypto from 'crypto';

// Store CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map();

// Token expiration time (15 minutes)
const TOKEN_EXPIRATION = 15 * 60 * 1000;

/**
 * Generate a secure CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, timestamp] of csrfTokens.entries()) {
    if (now - timestamp > TOKEN_EXPIRATION) {
      csrfTokens.delete(token);
    }
  }
}

// Clean up expired tokens every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

// Log once when middleware loads
let hasLoggedStatus = false;

export default defineEventHandler(async (event) => {
  // DISABLE CSRF in development mode
  if (process.env.NODE_ENV !== 'production') {
    if (!hasLoggedStatus) {
      console.log('🔓 CSRF Protection DISABLED in development mode');
      hasLoggedStatus = true;
    }
    return; // Skip all CSRF checks in development
  }

  const method = event.node.req.method;
  const path = event.node.req.url;

  // Skip CSRF check for GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    // Generate and set CSRF token for safe methods
    const token = generateCsrfToken();
    csrfTokens.set(token, Date.now());

    // Set CSRF token in httpOnly cookie
    setCookie(event, 'csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRATION / 1000,
      path: '/'
    });

    // Also send token in header for client-side use
    event.node.res.setHeader('X-CSRF-Token', token);

    return;
  }

  // For POST, PUT, DELETE, PATCH - validate CSRF token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    // Skip CSRF check for API authentication endpoints
    if (path.includes('/api/v1/login') || path.includes('/api/v1/register')) {
      return;
    }

    // Get CSRF token from header or body
    const tokenFromHeader = getHeader(event, 'X-CSRF-Token');
    const tokenFromCookie = getCookie(event, 'csrf-token');
    const body = await readBody(event).catch(() => ({}));
    const tokenFromBody = body?.csrfToken;

    const clientToken = tokenFromHeader || tokenFromBody;

    // Validate CSRF token
    if (!clientToken || !tokenFromCookie || clientToken !== tokenFromCookie) {
      console.error('🚫 CSRF validation failed:', {
        path,
        method,
        hasHeaderToken: !!tokenFromHeader,
        hasBodyToken: !!tokenFromBody,
        hasCookieToken: !!tokenFromCookie,
        tokensMatch: clientToken === tokenFromCookie
      });

      throw createError({
        statusCode: 403,
        statusMessage: 'CSRF token validation failed',
        message: 'Invalid or missing CSRF token'
      });
    }

    // Check if token exists and is not expired
    const tokenTimestamp = csrfTokens.get(tokenFromCookie);
    if (!tokenTimestamp || Date.now() - tokenTimestamp > TOKEN_EXPIRATION) {
      console.error('🚫 CSRF token expired or invalid');

      throw createError({
        statusCode: 403,
        statusMessage: 'CSRF token expired',
        message: 'CSRF token has expired. Please refresh the page.'
      });
    }

    console.log('✅ CSRF validation passed for:', path);
  }
});
