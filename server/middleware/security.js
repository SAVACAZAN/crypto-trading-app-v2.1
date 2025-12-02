/**
 * Security Middleware
 * Implements multiple layers of security for the application
 */

export default defineEventHandler((event) => {
  // Only apply strict security headers in production
  if (process.env.NODE_ENV !== 'production') {
    return; // Skip security headers in development for better compatibility
  }

  const headers = event.node.res;

  // Set security headers
  headers.setHeader('X-Content-Type-Options', 'nosniff');
  headers.setHeader('X-Frame-Options', 'SAMEORIGIN');
  headers.setHeader('X-XSS-Protection', '1; mode=block');
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS (HTTP Strict Transport Security) - Force HTTPS
  if (process.env.NODE_ENV === 'production') {
    headers.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content Security Policy
  headers.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // unsafe-eval needed for Vue/Nuxt dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",  // WebSocket support
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );

  // Remove sensitive headers that leak server info
  headers.removeHeader('X-Powered-By');
  headers.removeHeader('Server');
});
