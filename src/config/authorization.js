// Authorization Configuration
// Controls who can access the application

/**
 * Whitelist of allowed email addresses
 * Add emails here to grant access to the application
 */
const ALLOWED_EMAILS = [
  'karol.taylor@gmail.com',
  // Add more emails here as needed
  // 'john.doe@example.com',
  // 'jane.smith@example.com',
];

/**
 * Enable/disable authorization check
 * Set to false in production if you want to allow all authenticated users
 */
const AUTHORIZATION_ENABLED = import.meta.env.VITE_AUTHORIZATION_ENABLED !== 'false';

/**
 * Check if a user is authorized to access the application
 * @param {string} email - User's email address
 * @returns {boolean} - True if user is authorized
 */
export function isUserAuthorized(email) {
  // If authorization is disabled, allow everyone
  if (!AUTHORIZATION_ENABLED) {
    return true;
  }
  
  // If no email provided, deny access
  if (!email) {
    return false;
  }
  
  // Check if email is in whitelist (case-insensitive)
  return ALLOWED_EMAILS.some(
    allowedEmail => allowedEmail.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Get list of allowed emails (for debugging)
 * Only available in development
 */
export function getAllowedEmails() {
  if (import.meta.env.DEV) {
    return ALLOWED_EMAILS;
  }
  return [];
}

export { AUTHORIZATION_ENABLED };

