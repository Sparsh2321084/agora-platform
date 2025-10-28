/**
 * ═══════════════════════════════════════════════════════════════════
 * AGORA PLATFORM - SECURITY UTILITIES
 * Input sanitization, validation, and protection against common attacks
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Removes dangerous HTML/JavaScript while preserving basic formatting
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (except safe ones)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed|applet)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  
  // Encode special HTML characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username
 * - 3-20 characters
 * - Alphanumeric, underscores, hyphens only
 * - Must start with letter or number
 */
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,19}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
function isValidPassword(password) {
  if (password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

/**
 * Get password strength score (0-4)
 */
function getPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  
  return Math.min(strength, 4);
}

/**
 * Validate discussion/reply content
 * - Not empty
 * - Reasonable length (10-5000 characters for discussions, 1-2000 for replies)
 */
function isValidDiscussionContent(content, isReply = false) {
  const sanitized = content.trim();
  const maxLength = isReply ? 2000 : 5000;
  const minLength = isReply ? 1 : 10;
  
  return sanitized.length >= minLength && sanitized.length <= maxLength;
}

/**
 * Validate discussion title
 * - 5-200 characters
 * - Not just whitespace
 */
function isValidTitle(title) {
  const sanitized = title.trim();
  return sanitized.length >= 5 && sanitized.length <= 200;
}

/**
 * Rate limiting helper
 * Returns true if action is allowed, false if rate limit exceeded
 */
const rateLimitStore = new Map();

function checkRateLimit(identifier, maxAttempts, windowMs) {
  const now = Date.now();
  const key = identifier;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      attempts: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  const record = rateLimitStore.get(key);
  
  // Reset if window expired
  if (now > record.resetTime) {
    record.attempts = 1;
    record.resetTime = now + windowMs;
    return true;
  }
  
  // Check if limit exceeded
  if (record.attempts >= maxAttempts) {
    return false;
  }
  
  record.attempts++;
  return true;
}

/**
 * Clean up old rate limit records (run periodically)
 */
function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 */
function validateCSRFToken(token, storedToken) {
  if (!token || !storedToken) return false;
  return token === storedToken;
}

module.exports = {
  sanitizeInput,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  getPasswordStrength,
  isValidDiscussionContent,
  isValidTitle,
  checkRateLimit,
  generateCSRFToken,
  validateCSRFToken
};
