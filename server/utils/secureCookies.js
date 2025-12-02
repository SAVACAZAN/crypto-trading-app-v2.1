/**
 * Secure Cookie Utilities
 * Provides helper functions for setting secure, httpOnly cookies
 */

import crypto from 'crypto';

/**
 * Default secure cookie options
 */
const defaultCookieOptions = {
  httpOnly: true,      // Prevent JavaScript access
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'strict',  // CSRF protection
  path: '/',
  maxAge: 60 * 60 * 24 * 7  // 7 days
};

/**
 * Set a secure cookie
 * @param {object} event - H3 event object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {object} options - Additional cookie options
 */
export function setSecureCookie(event, name, value, options = {}) {
  const cookieOptions = {
    ...defaultCookieOptions,
    ...options
  };

  setCookie(event, name, value, cookieOptions);

  console.log(`🍪 Secure cookie set: ${name} (httpOnly: ${cookieOptions.httpOnly}, secure: ${cookieOptions.secure}, sameSite: ${cookieOptions.sameSite})`);
}

/**
 * Set an encrypted secure cookie
 * @param {object} event - H3 event object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value to encrypt
 * @param {object} options - Additional cookie options
 */
export function setEncryptedCookie(event, name, value, options = {}) {
  const config = useRuntimeConfig();
  const secret = config.cookieSecret;

  // Encrypt the value
  const encrypted = encryptValue(value, secret);

  setSecureCookie(event, name, encrypted, options);
}

/**
 * Get and decrypt an encrypted cookie
 * @param {object} event - H3 event object
 * @param {string} name - Cookie name
 * @returns {string|null} - Decrypted value or null
 */
export function getEncryptedCookie(event, name) {
  const config = useRuntimeConfig();
  const secret = config.cookieSecret;

  const encrypted = getCookie(event, name);
  if (!encrypted) return null;

  try {
    return decryptValue(encrypted, secret);
  } catch (error) {
    console.error(`❌ Failed to decrypt cookie ${name}:`, error.message);
    return null;
  }
}

/**
 * Delete a secure cookie
 * @param {object} event - H3 event object
 * @param {string} name - Cookie name
 */
export function deleteSecureCookie(event, name) {
  deleteCookie(event, name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  console.log(`🗑️  Secure cookie deleted: ${name}`);
}

/**
 * Encrypt a value using AES-256-GCM
 * @param {string} value - Value to encrypt
 * @param {string} secret - Encryption secret
 * @returns {string} - Encrypted value in format: iv:authTag:encrypted
 */
function encryptValue(value, secret) {
  // Generate a key from the secret
  const key = crypto.scryptSync(secret, 'salt', 32);

  // Generate a random IV (Initialization Vector)
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  // Encrypt the value
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  // Return IV:AuthTag:Encrypted format
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a value using AES-256-GCM
 * @param {string} encryptedValue - Encrypted value in format: iv:authTag:encrypted
 * @param {string} secret - Decryption secret
 * @returns {string} - Decrypted value
 */
function decryptValue(encryptedValue, secret) {
  // Split the encrypted value
  const parts = encryptedValue.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format');
  }

  const [ivHex, authTagHex, encrypted] = parts;

  // Generate a key from the secret
  const key = crypto.scryptSync(secret, 'salt', 32);

  // Convert hex strings back to buffers
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt the value
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Validate cookie options for security
 * @param {object} options - Cookie options to validate
 * @returns {boolean} - True if options are secure
 */
export function validateCookieOptions(options) {
  const warnings = [];

  if (!options.httpOnly) {
    warnings.push('⚠️  Cookie is not httpOnly - vulnerable to XSS attacks');
  }

  if (process.env.NODE_ENV === 'production' && !options.secure) {
    warnings.push('⚠️  Cookie is not secure in production - should use HTTPS only');
  }

  if (options.sameSite !== 'strict' && options.sameSite !== 'lax') {
    warnings.push('⚠️  Cookie sameSite is not strict/lax - vulnerable to CSRF attacks');
  }

  if (warnings.length > 0) {
    console.warn('🔒 Cookie security warnings:', warnings.join(', '));
    return false;
  }

  return true;
}
