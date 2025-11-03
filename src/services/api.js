// API Service for backend communication
import logger from './logger';
import { auth } from '../config/firebase';

// Use relative URLs in development (with Vite proxy) or absolute URLs in production
const API_BASE_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;

// Debug logging for API configuration
console.log('🔧 API Configuration:', {
  apiBaseUrl: API_BASE_URL,
  isDev: import.meta.env.DEV,
  isUndefined: API_BASE_URL === undefined,
  isNull: API_BASE_URL === null,
  isEmpty: API_BASE_URL === '',
  type: typeof API_BASE_URL
});

// Validate that API_BASE_URL is configured for production
if (!import.meta.env.DEV && !API_BASE_URL) {
  console.error('❌ VITE_API_BASE_URL is not configured for production!');
  console.error('Current value:', API_BASE_URL);
  console.error('Please create a .env file with VITE_API_BASE_URL set to your backend API URL.');
  console.error('See env.template for reference.');
  throw new Error(
    '❌ VITE_API_BASE_URL is not configured for production! ' +
    'Please create a .env file with VITE_API_BASE_URL set to your backend API URL. ' +
    'See env.template for reference.'
  );
}

/**
 * Get Firebase ID token for authentication
 */
async function getFirebaseToken() {
  if (!auth.currentUser) {
    console.warn('⚠️ No authenticated user found');
    return null;
  }
  
  try {
    const token = await auth.currentUser.getIdToken();
    console.log('🔑 Firebase token obtained:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  } catch (error) {
    console.error('❌ Error getting Firebase token:', error);
    return null;
  }
}

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
  
  // Get Firebase token for authentication
  const firebaseToken = await getFirebaseToken();
  
  // Get user ID from localStorage for authenticated requests
  const userId = getUserId();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(firebaseToken && { 'Authorization': `Bearer ${firebaseToken}` }), // Add Firebase token
      ...(userId && { 'X-User-ID': userId }), // Add X-User-ID header if available
      ...options.headers,
    },
    ...options,
  };

  // Debug logging for all requests
  console.log(`📡 ${options.method || 'GET'} ${endpoint}`, {
    url: url,
    apiBaseUrl: API_BASE_URL,
    endpoint: endpoint,
    userId: userId,
    hasUserIdHeader: !!userId,
    hasFirebaseToken: !!firebaseToken,
    body: options.body ? JSON.parse(options.body) : undefined
  });
  
  // Log to centralized logger
  if (options.method && options.method !== 'GET') {
    logger.apiCall(options.method, endpoint, userId);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Try to get response as text first to check if it's HTML
      const responseText = await response.text();
      
      // Check if response is HTML (common error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error(`❌ API Error: ${response.status} - Received HTML instead of JSON`);
        console.error('❌ HTML Response:', responseText.substring(0, 200) + '...');
        
        const errorMessage = `HTTP ${response.status}: Received HTML response (endpoint may not exist)`;
        logger.apiError(options.method || 'GET', endpoint, new Error(errorMessage));
        throw new Error(errorMessage);
      }
      
      // Try to parse as JSON
      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ API Error: ${response.status} - Could not parse response as JSON`);
        console.error('❌ Response text:', responseText.substring(0, 200) + '...');
      }
      
      console.error(`❌ API Error: ${response.status}`, errorData);
      
      // Log error to centralized logger
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
      logger.apiError(options.method || 'GET', endpoint, new Error(errorMessage));
      
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    
    // Log response for non-GET requests
    if (options.method && options.method !== 'GET') {
      console.log(`✅ ${options.method} ${endpoint} response:`, data);
      // Log success to centralized logger
      logger.apiResponse(options.method, endpoint, response.status);
    }
    
    return data;
  } catch (error) {
    console.error(`💥 API Error in ${endpoint}:`, error);
    // Log to centralized logger if not already logged
    if (!error.logged) {
      logger.apiError(options.method || 'GET', endpoint, error);
    }
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
  console.log('🔍 getWallets() called');
  const result = await fetchAPI('/api/wallets');
  console.log('🔍 getWallets() result:', result);
  return result;
}

/**
 * Create a new wallet
 * @param {Object} walletData - Wallet data
 * @param {string} walletData.name - Wallet name
 * @returns {Promise<Object>} Created wallet
 */
export async function createWallet(walletData) {
  console.log('🔍 createWallet() called with:', walletData);
  const result = await fetchAPI('/api/wallets', {
    method: 'POST',
    body: JSON.stringify(walletData),
  });
  console.log('🔍 createWallet() result:', result);
  return result;
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
 * @param {string} walletId - Wallet ID to associate transactions with
 * @param {string} walletName - Wallet name to associate transactions with
 * @returns {Promise<Object>} Upload result
 */
export async function uploadTransactions(file, walletId, walletName, currency) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('wallet_id', walletId);
  formData.append('wallet_name', walletName);
  if (currency) {
    formData.append('currency', String(currency).toUpperCase());
  }
  // currency is appended conditionally by caller when available
  
  // Get Firebase token for authentication
  const firebaseToken = await getFirebaseToken();
  const userId = getUserId();
  const url = `${API_BASE_URL}/api/transactions/upload`;
  
  console.log('📤 Uploading transactions:', { walletId, walletName, fileName: file.name, userId, hasFirebaseToken: !!firebaseToken });
  
  const config = {
    method: 'POST',
    body: formData,
    headers: {
      ...(firebaseToken && { 'Authorization': `Bearer ${firebaseToken}` }), // Add Firebase token
      ...(userId && { 'X-User-ID': userId }), // Add X-User-ID header
      // Don't set Content-Type, let browser set it with boundary for FormData
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Upload failed:', errorData);
      
      // Extract error message from various possible formats
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // FastAPI validation errors come as an array
          errorMessage = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
        } else if (typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ Transactions uploaded:', result);
    return result;
  } catch (error) {
    console.error('💥 API Error during upload:', error);
    throw error;
  }
}

/**
 * Detect currency from a transactions file before upload (preflight)
 * @param {File} file - CSV/XLS/XLSX file
 * @param {string} walletId - Optional wallet ID
 * @returns {Promise<Object>} { detected_currency, needs_currency, message, sample }
 */
export async function detectTransactionCurrency(file, walletId) {
  const formData = new FormData();
  formData.append('file', file);
  if (walletId) formData.append('wallet_id', walletId);

  // Get Firebase token for authentication
  const firebaseToken = await getFirebaseToken();
  const userId = getUserId();
  const url = `${API_BASE_URL}/api/transactions/detect-currency`;

  console.log('📡 Detecting currency for upload preflight', { walletId, fileName: file?.name });

  const config = {
    method: 'POST',
    body: formData,
    headers: {
      ...(firebaseToken && { 'Authorization': `Bearer ${firebaseToken}` }),
      ...(userId && { 'X-User-ID': userId }),
    },
  };

  const res = await fetch(url, config);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const result = await res.json();
  console.log('✅ Currency detection result:', result);
  return result;
}

/**
 * Get total transaction count for a wallet (without pagination)
 * @param {string} walletId - Wallet ID
 * @returns {Promise<number>} Total number of transactions
 */
export async function getTransactionCount(walletId) {
  const userId = getUserId();
  console.log('📡 GET /api/transactions/count with wallet_id:', walletId, 'user_id:', userId);
  
  try {
    const response = await fetchAPI(`/api/transactions/count?wallet_id=${walletId}`);
    console.log('🔍 Transaction count response:', response);
    
    return response?.count || response?.total_count || 0;
  } catch (error) {
    console.error(`❌ Error fetching transaction count for wallet "${walletId}":`, error);
    // Fallback: try to get count from regular endpoint
    try {
      const response = await fetchAPI(`/api/transactions?wallet_id=${walletId}&limit=1`);
      return response?.total_count || response?.count || 0;
    } catch (fallbackError) {
      console.error(`❌ Fallback count fetch also failed:`, fallbackError);
      return 0;
    }
  }
}

/**
 * Get transactions for a specific wallet by wallet ID with pagination
 * @param {string} walletId - Wallet ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Number of transactions per page (default: 1000)
 * @returns {Promise<Object>} Paginated transactions response
 */
export async function getTransactionsByWallet(walletId, page = 1, limit = 1000) {
  const userId = getUserId();
  console.log('📡 GET /api/transactions with wallet_id:', walletId, 'page:', page, 'limit:', limit, 'user_id:', userId);
  
  try {
    const response = await fetchAPI(`/api/transactions?wallet_id=${walletId}&page=${page}&limit=${limit}`);
    
    // Debug: Log the raw response to see pagination info
    console.log('🔍 Raw API response for wallet', walletId, ':', response);
    console.log('🔍 Raw API response keys:', Object.keys(response || {}));
    console.log('🔍 Raw API response structure:', {
      transactions: response?.transactions?.length,
      total_count: response?.total_count,
      total_pages: response?.total_pages,
      page: response?.page,
      limit: response?.limit,
      has_next: response?.has_next,
      has_prev: response?.has_prev
    });
    
    // Extract transactions array from response
    const transactions = response?.transactions || 
                       response?.data?.transactions || 
                       (Array.isArray(response) ? response : []);
    
    // Backend now provides complete pagination info - use it directly
    console.log(`🔍 Backend returned ${transactions.length} transactions for wallet "${walletId}" (page ${response?.page || page}/${response?.total_pages || '?'})`);
    console.log(`🔍 Total transactions in wallet: ${response?.total_count || 'unknown'}`);
    
    // Return the response with pagination info (backend provides all needed data)
    return {
      ...response,
      transactions: transactions,
      count: transactions.length,
      page: response?.page || page,
      limit: response?.limit || limit,
      total_count: response?.total_count || 0,
      total_pages: response?.total_pages || 1,
      has_next: response?.has_next || false,
      has_prev: response?.has_prev || false
    };
  } catch (error) {
    console.error(`❌ Error fetching transactions for wallet "${walletId}":`, error);
    throw error;
  }
}

/**
 * Get transaction errors for a specific wallet
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>} Transaction errors
 */
export async function getWalletTransactionErrors(walletId) {
  console.log('🔍 getWalletTransactionErrors() called for wallet:', walletId);
  
  try {
    const basePath = `/api/transactions/errors`;
    const attempts = [
      `${basePath}?wallet_id=${walletId}`,
      `${basePath}?wallet_id=${walletId}&processed=false`,
      `${basePath}?wallet_id=${walletId}&unprocessed=true`,
    ];

    let response = null;
    let errors = [];
    let totalCount = 0;
    let usedUrl = '';

    for (const url of attempts) {
      console.log('🌐 Trying wallet errors endpoint:', url);
      const r = await fetchAPI(url);

      // Normalize response shape
      let candidateErrors = [];
      let candidateCount = 0;
      if (Array.isArray(r)) {
        candidateErrors = r;
        candidateCount = r.length;
      } else if (r?.errors) {
        candidateErrors = r.errors;
        candidateCount = r.total_count || r.count || candidateErrors.length;
      } else if (r?.data) {
        candidateErrors = r.data;
        candidateCount = r.total_count || r.count || candidateErrors.length;
      } else {
        for (const key in r) {
          if (Array.isArray(r[key])) {
            candidateErrors = r[key];
            candidateCount = candidateErrors.length;
            break;
          }
        }
      }

      console.log('🔎 Attempt result:', { url, candidateCount, keys: Object.keys(r || {}), sample: candidateErrors[0] });

      // Accept this attempt if we found any items or it's the last attempt
      if (candidateErrors.length > 0 || url === attempts[attempts.length - 1]) {
        response = r;
        errors = candidateErrors;
        totalCount = candidateCount;
        usedUrl = url;
        break;
      }
    }

    // If still empty, fetch all and filter client-side as a safety net
    if (!errors || errors.length === 0) {
      try {
        console.log('🛟 Fallback: fetching all errors to filter client-side');
        const allResp = await fetchAPI(basePath);
        let allErrors = Array.isArray(allResp)
          ? allResp
          : (allResp?.errors || allResp?.data || []);
        console.log('🛟 Fallback total from API:', Array.isArray(allErrors) ? allErrors.length : 0);
        const filtered = (allErrors || []).filter(e => {
          const wid = e.wallet_id || e.walletId || e.wallet?.id;
          return String(wid) === String(walletId);
        });
        if (filtered.length > 0) {
          errors = filtered;
          totalCount = filtered.length;
          usedUrl = `${basePath} (fallback+filter)`;
          response = { errors: filtered, total_count: filtered.length };
          console.log('🛟 Fallback filter matched errors:', filtered.length);
        } else {
          console.log('🛟 Fallback filter found 0 for wallet:', walletId);
        }
      } catch (fallbackErr) {
        console.warn('⚠️ Fallback fetch-all failed:', fallbackErr);
      }
    }

    // 'errors' and 'totalCount' are already set from the successful attempt above

    console.log('✅ Wallet transaction errors fetched successfully:', {
      walletId,
      errorCount: errors.length,
      usedUrl,
      keys: Object.keys(response || {}),
      sample: errors[0]
    });
    
    logger.transaction('Wallet transaction errors fetched successfully', walletId, {
      error_count: errors.length
    });
    
    return { errors, total_count: totalCount };
  } catch (error) {
    console.error('❌ Error fetching wallet transaction errors:', error);
    logger.error('transaction', 'Failed to fetch wallet transaction errors', { wallet_id: walletId }, error);
    throw error;
  }
}

/**
 * Get unprocessed transaction errors
 * @returns {Promise<Object>} Unprocessed errors with pagination info
 */
export async function getUnprocessedTransactionErrors() {
  console.log('🔍 getUnprocessedTransactionErrors() called');
  
  try {
    const response = await fetchAPI('/api/transactions/errors');
    
    console.log('✅ Unprocessed errors fetched successfully:', {
      errorCount: response.errors?.length || response.length || 0,
      totalCount: response.total_count || response.length || 0
    });
    
    logger.transaction('Unprocessed errors fetched successfully', null, {
      error_count: response.errors?.length || response.length || 0,
      total_count: response.total_count || response.length || 0
    });
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching unprocessed errors:', error);
    logger.error('transaction', 'Failed to fetch unprocessed errors', {}, error);
    throw error;
  }
}

/**
 * Get all transactions (deprecated - use getTransactionsByWallet instead)
 * @returns {Promise<Array>} List of transactions
 */
export async function getTransactions() {
  const userId = getUserId();
  console.log('📡 GET /api/transactions with user_id:', userId);
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

/**
 * Get wallet statistics (lightweight, without full transactions)
 * Uses /api/stats?wallet_id= to get balance, deposits, and transaction count
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>} Wallet stats with balance, deposits, and transaction count
 */
export async function getWalletStats(walletId) {
  console.log('📊 getWalletStats() called for wallet:', walletId);
  
  // Try to get stats from /api/stats endpoint with wallet_id parameter
  try {
    const response = await fetchAPI(`/api/stats?wallet_id=${walletId}`);
    console.log('✅ Wallet stats fetched:', response);
    return response;
  } catch (error) {
    console.log('⚠️ Stats endpoint not available, trying alternate method:', error.message);
    
    // Fallback: use transactions endpoint with limit=1 to get total_count
    try {
      const response = await fetchAPI(`/api/transactions?wallet_id=${walletId}&limit=1`);
      
      return {
        balance: null, // Can't determine without full transactions
        total_count: response?.total_count || 0,
        deposits: null
      };
    } catch (fallbackError) {
      console.error('❌ Failed to get any stats for wallet:', fallbackError);
      return {
        balance: null,
        total_count: 0,
        deposits: null
      };
    }
  }
}

// ==================== ASSETS APIs ====================

/**
 * Get all assets
 * @returns {Promise<Array>} List of assets
 */
export async function getAssets() {
  return fetchAPI('/api/assets');
}

// ==================== MUTUAL FUNDS APIs ====================

/**
 * Get all mutual funds for the authenticated user
 * @returns {Promise<Array>} List of mutual funds
 */
export async function getMutualFunds() {
  console.log('🔍 getMutualFunds() called');
  const result = await fetchAPI('/api/v1/mutual_funds');
  console.log('🔍 getMutualFunds() result:', result);
  return result;
}

/**
 * Push current value for a mutual fund
 * @param {string} fundId - Mutual fund ID
 * @param {Object} valueData - Value data
 * @param {number} valueData.current_value - Current value of the fund
 * @param {string} valueData.date - Date of the value (ISO format, optional)
 * @returns {Promise<Object>} Push result
 */
export async function pushMutualFundValue(fundId, valueData) {
  console.log('📤 pushMutualFundValue() called with:', { fundId, valueData });
  const result = await fetchAPI(`/api/v1/mutual_funds/${fundId}/push`, {
    method: 'POST',
    body: JSON.stringify(valueData),
  });
  console.log('✅ pushMutualFundValue() result:', result);
  return result;
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

