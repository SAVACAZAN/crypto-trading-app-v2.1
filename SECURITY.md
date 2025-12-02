# 🔒 Security Guide - Crypto Trading App

## Overview

This document outlines the security measures implemented in the application and best practices for maintaining security.

## 🛡️ Security Features Implemented

### 1. **Secure Cookie Configuration**
- **HttpOnly Cookies**: Prevents JavaScript access to sensitive cookies (protects against XSS)
- **Secure Flag**: Cookies only transmitted over HTTPS in production
- **SameSite=Strict**: Prevents CSRF attacks by blocking cross-site cookie sending
- **Cookie Encryption**: Sensitive cookie values are encrypted using AES-256-GCM

**Location**: `nuxt.config.ts`, `server/utils/secureCookies.js`

### 2. **CSRF (Cross-Site Request Forgery) Protection**
- CSRF tokens generated for all sessions
- Token validation required for POST/PUT/DELETE/PATCH requests
- Tokens expire after 15 minutes of inactivity
- Double-submit cookie pattern implementation

**Location**: `server/middleware/csrf.js`

**Usage**:
```javascript
// Client-side: Include CSRF token in requests
const csrfToken = document.cookie.match(/csrf-token=([^;]+)/)?.[1];
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  }
});
```

### 3. **Rate Limiting**
Protects against brute-force attacks and API abuse:

- **Authentication endpoints**: 5 requests per 15 minutes
- **Trading endpoints**: 30 requests per minute
- **Wallet endpoints**: 20 requests per minute
- **General API**: 100 requests per minute

**Location**: `server/middleware/rateLimit.js`

### 4. **Security Headers**
Comprehensive security headers set on all responses:

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: SAMEORIGIN
- **X-XSS-Protection**: 1; mode=block
- **Content-Security-Policy**: Strict CSP rules
- **Strict-Transport-Security**: Forces HTTPS in production
- **Referrer-Policy**: strict-origin-when-cross-origin

**Location**: `server/middleware/security.js`

### 5. **JWT Token Security**
- Tokens signed with strong secret (min 64 characters)
- Tokens include expiration time
- Refresh token rotation implemented
- Tokens stored in httpOnly cookies (not localStorage)

### 6. **API Key Protection**
- API keys encrypted at rest using AES-256
- API keys never logged or exposed in responses
- Separate API keys for different environments
- API key rotation supported

## 🚨 Security Best Practices

### For Development

1. **Never commit sensitive data**:
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Use different secrets for dev/staging/production**

3. **Test security features locally**:
   ```bash
   # Test with production mode locally
   NODE_ENV=production npm run build
   NODE_ENV=production node .output/server/index.mjs
   ```

### For Production

1. **Environment Variables**:
   - Store secrets in environment variables, NOT in .env files
   - Use a secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
   - Rotate secrets every 90 days

2. **HTTPS/SSL**:
   - Always use HTTPS in production
   - Use valid SSL certificates (Let's Encrypt, etc.)
   - Enable HSTS (already configured in app)

3. **Database Security**:
   - Enable MongoDB authentication
   - Use connection string with credentials
   - Restrict database access to application server only
   - Enable database encryption at rest

4. **Server Hardening**:
   ```bash
   # Firewall configuration (example for Ubuntu)
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw deny 3000/tcp   # Block direct access to Node
   sudo ufw enable
   ```

5. **Monitoring & Logging**:
   - Monitor failed authentication attempts
   - Set up alerts for rate limit violations
   - Log security events (don't log sensitive data)
   - Regularly review access logs

## 🔑 Secret Management

### Generating Secure Secrets

**Option 1 - Node.js**:
```javascript
require('crypto').randomBytes(64).toString('hex')
```

**Option 2 - OpenSSL**:
```bash
openssl rand -hex 64
```

**Option 3 - Online** (for non-production):
https://randomkeygen.com/

### Required Secrets

1. **JWT_SECRET**: For signing authentication tokens
2. **COOKIE_SECRET**: For encrypting cookies
3. **Database credentials**: For MongoDB connection
4. **Exchange API keys**: For trading functionality

## 🛠️ Security Utilities

### Secure Cookie Helper

```javascript
import { setEncryptedCookie, getEncryptedCookie } from '~/server/utils/secureCookies';

// Set encrypted cookie
setEncryptedCookie(event, 'user-data', JSON.stringify(userData));

// Get encrypted cookie
const userData = JSON.parse(getEncryptedCookie(event, 'user-data'));
```

### CSRF Token Access

```javascript
// Server-side: Token automatically generated and set in cookie
// Client-side: Include in requests
const csrfToken = getCookie('csrf-token');
```

## 🚦 Security Checklist

### Before Production Deployment

- [ ] All default secrets changed to strong, random values
- [ ] JWT_SECRET is at least 64 characters
- [ ] COOKIE_SECRET is different from JWT_SECRET
- [ ] NODE_ENV set to 'production'
- [ ] HTTPS/SSL enabled
- [ ] Database authentication enabled
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Security headers verified
- [ ] API keys encrypted and secured
- [ ] Logging and monitoring configured
- [ ] Backup strategy implemented
- [ ] Incident response plan created

## 📝 Security Incident Response

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [your-security-email@domain.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## 🔄 Regular Security Tasks

### Daily
- Monitor failed authentication attempts
- Check rate limit violations

### Weekly
- Review access logs
- Check for unusual API activity
- Update dependencies with security patches

### Monthly
- Review and rotate API keys
- Audit user permissions
- Security patch updates

### Quarterly
- Rotate JWT_SECRET and COOKIE_SECRET
- Full security audit
- Penetration testing (if applicable)
- Update security documentation

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Nuxt Security Best Practices](https://nuxt.com/docs/guide/going-further/security)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

## 🆘 Support

For security-related questions or concerns, contact the development team.

---

**Last Updated**: January 2025
**Version**: 1.0.0
