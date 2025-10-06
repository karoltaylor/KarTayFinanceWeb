// API Service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get user ID from localStorage
 */
function getUserId() {
  return localStorage.getItem('backend_user_id');
}

/**
 * Set user ID in localStorage
 */
export function setUserId(userId) {
  if (userId) {
    localStorage.setItem('backend_user_id', userId);
  } else {
    localStorage.removeItem('backend_user_id');
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get user ID from localStorage for authenticated requests
  const userId = getUserId();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(userId && { 'X-User-ID': userId }), // Add X-User-ID header if available
      ...options.headers,
    },
    ...options,
  };

  // Debug logging for all requests
  if (options.method && options.method !== 'GET') {
    console.log(`📡 ${options.method} ${endpoint}`, {
      userId: userId,
      body: options.body ? JSON.parse(options.body) : undefined
    });
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error: ${response.status}`, errorData);
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    
    // Log response for non-GET requests
    if (options.method && options.method !== 'GET') {
      console.log(`✅ ${options.method} ${endpoint} response:`, data);
    }
    
    return data;
  } catch (error) {
    console.error(`💥 API Error in ${endpoint}:`, error);
    throw error;
  }
}

// ==================== USER APIs ====================

/**
 * Register a new user (after OAuth login)
 * @param {Object} userData - User data from OAuth
 * @param {string} userData.email - User email
 * @param {string} userData.username - Username (can be derived from email)
 * @param {string} userData.oauth_provider - OAuth provider (google, facebook, github)
 * @param {string} userData.oauth_id - OAuth ID (Firebase UID)
 * @returns {Promise<Object>} Registered user with user_id
 */
export async function registerUser(userData) {
  const response = await fetchAPI('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  // Store user_id in localStorage for subsequent requests
  if (response && response.user_id) {
    setUserId(response.user_id);
    console.log('💾 User ID stored in localStorage:', response.user_id);
  }
  
  return response;
}

// ==================== WALLET APIs ====================

/**
 * Get all wallets for the authenticated user
 * @returns {Promise<Array>} List of wallets
 */
export async function getWallets() {
  return fetchAPI('/api/wallets');
}

/**
 * Create a new wallet
 * @param {Object} walletData - Wallet data
 * @param {string} walletData.name - Wallet name
 * @returns {Promise<Object>} Created wallet
 */
export async function createWallet(walletData) {
  return fetchAPI('/api/wallets', {
    method: 'POST',
    body: JSON.stringify(walletData),
  });
}

/**
 * Delete wallet
 * @param {string} walletId - Wallet ID
 * @returns {Promise<null>}
 */
export async function deleteWallet(walletId) {
  return fetchAPI(`/api/wallets/${walletId}`, {
    method: 'DELETE',
  });
}

// ==================== TRANSACTION APIs ====================

/**
 * Upload transactions file
 * @param {File} file - CSV/JSON file with transactions
 * @returns {Promise<Object>} Upload result
 */
export async function uploadTransactions(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const userId = getUserId();
  const url = `${API_BASE_URL}/api/transactions/upload`;
  
  const config = {
    method: 'POST',
    body: formData,
    headers: {
      ...(userId && { 'X-User-ID': userId }), // Add X-User-ID header
      // Don't set Content-Type, let browser set it with boundary for FormData
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get all transactions
 * @returns {Promise<Array>} List of transactions
 */
export async function getTransactions() {
  return fetchAPI('/api/transactions');
}

// ==================== STATS APIs ====================

/**
 * Get financial statistics
 * @returns {Promise<Object>} Statistics data
 */
export async function getStats() {
  return fetchAPI('/api/stats');
}

// ==================== ASSETS APIs ====================

/**
 * Get all assets
 * @returns {Promise<Array>} List of assets
 */
export async function getAssets() {
  return fetchAPI('/api/assets');
}

// ==================== Helper Functions ====================

/**
 * Check if API is available
 * @returns {Promise<boolean>}
 */
export async function checkAPIHealth() {
  try {
    await fetch(`${API_BASE_URL}/health`);
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

